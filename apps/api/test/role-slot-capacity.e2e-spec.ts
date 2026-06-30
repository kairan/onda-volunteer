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

  async function seedPrivateEventFixture(options?: { keepDefaultCapacity?: boolean }) {
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

    if (!options?.keepDefaultCapacity) {
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
    }

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

  it('GET event detail returns roleCapacities with default capacity 1 after private create', async () => {
    const { ministry, leader, audioRole, eventId } =
      await seedPrivateEventFixture({ keepDefaultCapacity: true });

    const res = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    expect(res.body.roleCapacities).toEqual([
      { ministryId: ministry.id, roleId: audioRole.id, capacity: 1 },
    ]);
  });

  it('seeds EventRoleCapacity only for active roles when creating a private event', async () => {
    const church = await prisma.church.create({
      data: { name: 'Retired Role Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Ushering', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Usher Leader' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    const activeRole = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Greeter', retired: false },
    });
    await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Legacy Door', retired: true },
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

    const capacities = await prisma.eventRoleCapacity.findMany({
      where: { eventId: created.body.id, ministryId: ministry.id },
    });
    expect(capacities).toHaveLength(1);
    expect(capacities[0]).toMatchObject({
      roleId: activeRole.id,
      capacity: 1,
    });
  });

  it('allows a new assignment after voiding one at full capacity', async () => {
    const { ministry, leader, memberA, memberB, memberC, audioRole, eventId } =
      await seedPrivateEventFixture();

    const first = await request(app.getHttpServer())
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

    await request(app.getHttpServer())
      .post(`/assignments/${first.body.id}/void`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send(assignmentBody(memberC.id, ministry.id, audioRole.id))
      .expect(201);
  });

  it('PATCH rejects capacity below 1 with INVALID_ROLE_CAPACITY', async () => {
    const { ministry, leader, audioRole, eventId } =
      await seedPrivateEventFixture({ keepDefaultCapacity: true });

    const res = await request(app.getHttpServer())
      .patch(`/events/${eventId}/role-capacities`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        ministryId: ministry.id,
        capacities: [{ roleId: audioRole.id, capacity: 0 }],
      })
      .expect(400);

    expect(res.body.code).toBe('INVALID_ROLE_CAPACITY');
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

  it('PATCH increases capacity 1 to 2 and persists', async () => {
    const { ministry, leader, audioRole, eventId } =
      await seedPrivateEventFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${eventId}/role-capacities`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        ministryId: ministry.id,
        capacities: [{ roleId: audioRole.id, capacity: 3 }],
      })
      .expect(200);

    expect(res.body.roleCapacities).toEqual([
      { roleId: audioRole.id, capacity: 3 },
    ]);

    const row = await prisma.eventRoleCapacity.findUniqueOrThrow({
      where: {
        eventId_ministryId_roleId: {
          eventId,
          ministryId: ministry.id,
          roleId: audioRole.id,
        },
      },
    });
    expect(row.capacity).toBe(3);
  });

  it('PATCH rejects decrease below filled count with CAPACITY_BELOW_FILLED_SLOTS', async () => {
    const { ministry, leader, memberA, memberB, audioRole, eventId } =
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
      .patch(`/events/${eventId}/role-capacities`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        ministryId: ministry.id,
        capacities: [{ roleId: audioRole.id, capacity: 1 }],
      })
      .expect(400);

    expect(res.body.code).toBe('CAPACITY_BELOW_FILLED_SLOTS');
  });

  it('PATCH rejects non-leader with 403', async () => {
    const { ministry, memberA, audioRole, eventId } =
      await seedPrivateEventFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${eventId}/role-capacities`)
      .set('X-Volunteer-Id', memberA.id)
      .send({
        ministryId: ministry.id,
        capacities: [{ roleId: audioRole.id, capacity: 2 }],
      })
      .expect(403);

    expect(res.body.code).toBe('ADMIN_NOT_ACCREDITED');
  });
});
