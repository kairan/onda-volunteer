import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Role slot capacity guards (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.AUTH_ALLOW_DEV_HEADERS = 'true';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for e2e tests');
    }
    execSync('pnpm exec prisma migrate deploy', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: process.env,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.assignment.deleteMany();
    await prisma.eventRoleCapacity.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedPrivateEventFixture() {
    const church = await prisma.church.create({
      data: { name: 'Slot Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Technical', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader' },
    });
    const memberA = await prisma.volunteer.create({
      data: { displayName: 'Member A' },
    });
    const memberB = await prisma.volunteer.create({
      data: { displayName: 'Member B' },
    });
    const memberC = await prisma.volunteer.create({
      data: { displayName: 'Member C' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    await prisma.ministryMembership.createMany({
      data: [
        { volunteerId: memberA.id, ministryId: ministry.id, status: 'ACTIVE' },
        { volunteerId: memberB.id, ministryId: ministry.id, status: 'ACTIVE' },
        { volunteerId: memberC.id, ministryId: ministry.id, status: 'ACTIVE' },
      ],
    });
    const audioRole = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Audio', retired: false },
    });

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: ministry.id,
        title: 'Sunday Service',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(201);

    await prisma.eventRoleCapacity.update({
      where: {
        eventId_ministryId_roleId: {
          eventId: created.body.id,
          ministryId: ministry.id,
          roleId: audioRole.id,
        },
      },
      data: { capacity: 2 },
    });

    return {
      ministry,
      leader,
      memberA,
      memberB,
      memberC,
      audioRole,
      eventId: created.body.id as string,
    };
  }

  const assignmentBody = (volunteerId: string, ministryId: string, roleId: string) => ({
    volunteerId,
    ministryId,
    roleId,
    startsAtUtc: '2026-08-01T18:30:00.000Z',
    endsAtUtc: '2026-08-01T19:30:00.000Z',
  });

  it('allows two assignments at capacity 2 then rejects third with ROLE_SLOTS_FULL', async () => {
    const { ministry, leader, memberA, memberB, memberC, audioRole, eventId } =
      await seedPrivateEventFixture();

    await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberA.id, ministry.id, audioRole.id))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberB.id, ministry.id, audioRole.id))
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberC.id, ministry.id, audioRole.id))
      .expect(400);

    expect(res.body.code).toBe('ROLE_SLOTS_FULL');
  });

  it('rejects duplicate volunteer on same role with VOLUNTEER_ALREADY_ON_ROLE_SLOT', async () => {
    const { ministry, leader, memberA, audioRole, eventId } =
      await seedPrivateEventFixture();

    await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberA.id, ministry.id, audioRole.id))
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberA.id, ministry.id, audioRole.id))
      .expect(400);

    expect(res.body.code).toBe('VOLUNTEER_ALREADY_ON_ROLE_SLOT');
  });
});
