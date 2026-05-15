import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

describe('POST /assignments/:id/release (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for e2e tests');
    }
    const apiRoot = path.resolve(__dirname, '..');
    execSync('pnpm exec prisma migrate deploy', {
      cwd: apiRoot,
      stdio: 'inherit',
      env: process.env,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CLOCK)
      .useValue({ now: () => FIXED_NOW })
      .compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.assignment.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('voids the volunteer own assignment so it no longer appears on event detail', async () => {
    const church = await prisma.church.create({
      data: { name: 'Release Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Sunday',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    const row = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(row?.voidedAtUtc).toEqual(FIXED_NOW);

    const detail = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .expect(200);
    expect(detail.body.assignments).toHaveLength(0);
  });

  it('rejects release when the volunteer header does not own the assignment', async () => {
    const church = await prisma.church.create({
      data: { name: 'Auth Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const owner = await prisma.volunteer.create({
      data: { displayName: 'Owner' },
    });
    const other = await prisma.volunteer.create({
      data: { displayName: 'Other' },
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: owner.id,
          ministryId: ministry.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: other.id,
          ministryId: ministry.id,
          status: 'ACTIVE',
        },
      ],
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Keys', retired: false },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Rehearsal',
        startsAtUtc: new Date('2026-06-02T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: owner.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-02T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-02T15:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('X-Volunteer-Id', other.id)
      .expect(403);

    const row = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(row?.voidedAtUtc).toBeNull();
  });

  it('does not create unavailability on release; volunteer may add it with explicit confirmation', async () => {
    const church = await prisma.church.create({
      data: { name: 'Offer Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Nursery', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Alex' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Helper', retired: false },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Serve',
        startsAtUtc: new Date('2026-06-03T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-03T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const startsAtUtc = '2026-06-03T14:30:00.000Z';
    const endsAtUtc = '2026-06-03T15:30:00.000Z';
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date(startsAtUtc),
        endsAtUtc: new Date(endsAtUtc),
      },
    });

    await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(await prisma.unavailability.count()).toBe(0);

    const created = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({ ministryId: ministry.id, startsAtUtc, endsAtUtc })
      .expect(201);

    expect(created.body).toMatchObject({
      ministryId: ministry.id,
      window: { startsAtUtc, endsAtUtc },
    });
    expect(await prisma.unavailability.count()).toBe(1);
  });
});
