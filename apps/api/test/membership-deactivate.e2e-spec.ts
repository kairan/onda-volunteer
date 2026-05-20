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

describe('POST /ministries/:ministryId/memberships/:volunteerId/deactivate (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.AUTH_ALLOW_DEV_HEADERS = 'true';
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

  it('voids assignments on events whose scheduled end is still in the future', async () => {
    const church = await prisma.church.create({
      data: { name: 'Void Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Ushers', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pat Future' },
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
    const futureEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Next Sunday',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: futureEvent.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(
        `/ministries/${ministry.id}/memberships/${volunteer.id}/deactivate`,
      )
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    const row = await prisma.assignment.findUnique({ where: { id: assignment.id } });
    expect(row?.voidedAtUtc).toEqual(FIXED_NOW);

    const detail = await request(app.getHttpServer())
      .get(`/events/${futureEvent.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);
    expect(detail.body.assignments).toHaveLength(0);

    const membership = await prisma.ministryMembership.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: volunteer.id,
          ministryId: ministry.id,
        },
      },
    });
    expect(membership?.status).toBe('INACTIVE');
  });

  it('preserves assignments on events whose scheduled end is already in the past', async () => {
    const church = await prisma.church.create({
      data: { name: 'History Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Kids', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pat Past' },
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
    const endedEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Last Sunday',
        startsAtUtc: new Date('2026-05-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-05-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: endedEvent.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-05-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-05-01T15:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(
        `/ministries/${ministry.id}/memberships/${volunteer.id}/deactivate`,
      )
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    const row = await prisma.assignment.findUnique({ where: { id: assignment.id } });
    expect(row?.voidedAtUtc).toBeNull();

    const detail = await request(app.getHttpServer())
      .get(`/events/${endedEvent.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);
    expect(detail.body.assignments).toHaveLength(1);
    expect(detail.body.assignments[0].id).toBe(assignment.id);
  });

  it('voids assignments on an event still underway (scheduled end in the future)', async () => {
    const church = await prisma.church.create({
      data: { name: 'Live Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pat Live' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Keys', retired: false },
    });
    const inProgressEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Service in progress',
        startsAtUtc: new Date('2026-05-15T10:00:00.000Z'),
        endsAtUtc: new Date('2026-05-15T14:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: inProgressEvent.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-05-15T10:30:00.000Z'),
        endsAtUtc: new Date('2026-05-15T11:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(
        `/ministries/${ministry.id}/memberships/${volunteer.id}/deactivate`,
      )
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    const row = await prisma.assignment.findUnique({ where: { id: assignment.id } });
    expect(row?.voidedAtUtc).toEqual(FIXED_NOW);

    const detail = await request(app.getHttpServer())
      .get(`/events/${inProgressEvent.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);
    expect(detail.body.assignments).toHaveLength(0);
  });

  it('does not void assignments for other ministries when deactivating one membership', async () => {
    const church = await prisma.church.create({
      data: { name: 'Multi Church', defaultTimezone: 'UTC' },
    });
    const ministryA = await prisma.ministry.create({
      data: { name: 'A', churchId: church.id },
    });
    const ministryB = await prisma.ministry.create({
      data: { name: 'B', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pat Multi' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministryA.id,
        status: 'ACTIVE',
      },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministryB.id,
        status: 'ACTIVE',
      },
    });
    const roleB = await prisma.ministryRole.create({
      data: { ministryId: ministryB.id, name: 'R-B', retired: false },
    });
    const futureEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Joint',
        startsAtUtc: new Date('2026-07-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-07-01T18:00:00.000Z'),
        churchId: church.id,
      },
    });
    const otherAssignment = await prisma.assignment.create({
      data: {
        eventId: futureEvent.id,
        ministryId: ministryB.id,
        volunteerId: volunteer.id,
        roleId: roleB.id,
        startsAtUtc: new Date('2026-07-01T15:00:00.000Z'),
        endsAtUtc: new Date('2026-07-01T16:00:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(
        `/ministries/${ministryA.id}/memberships/${volunteer.id}/deactivate`,
      )
      .set('X-Leader-Ministry-Id', ministryA.id)
      .expect(200);

    const row = await prisma.assignment.findUnique({
      where: { id: otherAssignment.id },
    });
    expect(row?.voidedAtUtc).toBeNull();
  });
});
