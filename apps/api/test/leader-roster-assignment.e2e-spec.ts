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

describe('Leader roster assignment (e2e)', () => {
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
    await prisma.systemAdministrator.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.adminAccreditation.deleteMany();
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

  async function seedLeaderRosterFixture() {
    const church = await prisma.church.create({
      data: { name: 'Roster Church', defaultTimezone: 'UTC' },
    });
    const ledMinistry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const otherMinistry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member' },
    });
    const otherLeader = await prisma.volunteer.create({
      data: { displayName: 'Other Leader' },
    });
    await prisma.ministryLeader.createMany({
      data: [
        { volunteerId: leader.id, ministryId: ledMinistry.id },
        { volunteerId: otherLeader.id, ministryId: otherMinistry.id },
      ],
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: member.id,
          ministryId: ledMinistry.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: member.id,
          ministryId: otherMinistry.id,
          status: 'ACTIVE',
        },
      ],
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ledMinistry.id, name: 'Keys', retired: false },
    });
    const otherRole = await prisma.ministryRole.create({
      data: { ministryId: otherMinistry.id, name: 'Door', retired: false },
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
    return {
      church,
      ledMinistry,
      otherMinistry,
      leader,
      member,
      otherLeader,
      role,
      otherRole,
      event,
    };
  }

  it('leader creates assignment for their ministry member — 201', async () => {
    const { ledMinistry, leader, member, role, event } =
      await seedLeaderRosterFixture();

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        volunteerId: member.id,
        ministryId: ledMinistry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      volunteerId: member.id,
      ministryId: ledMinistry.id,
      roleId: role.id,
    });
  });

  it('leader voids another volunteer assignment in their ministry — 200', async () => {
    const { ledMinistry, leader, member, role, event } =
      await seedLeaderRosterFixture();

    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ledMinistry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/void`)
      .set('X-Volunteer-Id', leader.id)
      .expect(200);

    expect(res.body).toMatchObject({
      id: assignment.id,
      voidedAtUtc: FIXED_NOW.toISOString(),
    });

    const row = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(row?.voidedAtUtc).toEqual(FIXED_NOW);
  });

  it('leader cannot void assignment for a ministry they do not lead — 403', async () => {
    const {
      ledMinistry,
      otherMinistry,
      leader,
      member,
      role,
      otherRole,
      event,
    } = await seedLeaderRosterFixture();

    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: otherMinistry.id,
        volunteerId: member.id,
        roleId: otherRole.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/void`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .expect(403);

    expect(res.body.code).toBe('LEADER_NOT_ASSIGNED');

    const row = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(row?.voidedAtUtc).toBeNull();
  });

  it('system admin cannot void — 403 SYSTEM_ADMIN_READ_ONLY', async () => {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });

    const { ledMinistry, member, role, event } = await seedLeaderRosterFixture();
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ledMinistry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/void`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(403);

    expect(res.body.code).toBe('SYSTEM_ADMIN_READ_ONLY');
  });

  it('double-void returns ASSIGNMENT_ALREADY_VOIDED — 400', async () => {
    const { ledMinistry, leader, member, role, event } =
      await seedLeaderRosterFixture();

    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ledMinistry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
        voidedAtUtc: FIXED_NOW,
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/void`)
      .set('X-Volunteer-Id', leader.id)
      .expect(400);

    expect(res.body.code).toBe('ASSIGNMENT_ALREADY_VOIDED');
  });

  it('unavailability block returns UNAVAILABILITY_BLOCKS_ASSIGN on create — 409', async () => {
    const { ledMinistry, leader, member, role, event } =
      await seedLeaderRosterFixture();

    await prisma.unavailability.create({
      data: {
        volunteerId: member.id,
        ministryId: ledMinistry.id,
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        volunteerId: member.id,
        ministryId: ledMinistry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(409);

    expect(res.body.code).toBe('UNAVAILABILITY_BLOCKS_ASSIGN');
  });
});
