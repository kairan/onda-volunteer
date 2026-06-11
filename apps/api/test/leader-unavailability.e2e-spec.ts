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

describe('Leader volunteer unavailability (e2e)', () => {
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

  async function seedLedMinistryFixture() {
    const church = await prisma.church.create({
      data: { name: 'Leader UA Church', defaultTimezone: 'UTC' },
    });
    const ledMinistry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const otherMinistry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Lee Leader' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Sam Member' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ledMinistry.id },
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
    return { church, ledMinistry, otherMinistry, leader, member };
  }

  it('lets a Leader create unavailability for a member in a led ministry', async () => {
    const { ledMinistry, leader, member } = await seedLedMinistryFixture();

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${member.id}/unavailability`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        ministryId: ledMinistry.id,
        startsAtUtc: '2026-06-02T14:00:00.000Z',
        endsAtUtc: '2026-06-02T16:00:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      ministryId: ledMinistry.id,
      window: {
        startsAtUtc: '2026-06-02T14:00:00.000Z',
        endsAtUtc: '2026-06-02T16:00:00.000Z',
      },
    });
  });

  it('rejects Leader create when dev ministry header does not match body ministry', async () => {
    const { ledMinistry, otherMinistry, leader, member } =
      await seedLedMinistryFixture();

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${member.id}/unavailability`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        ministryId: otherMinistry.id,
        startsAtUtc: '2026-06-02T14:00:00.000Z',
        endsAtUtc: '2026-06-02T16:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('LEADER_MINISTRY_MISMATCH');
  });

  it('rejects Leader viewing a member without stewardship in that church', async () => {
    const { church, member } = await seedLedMinistryFixture();
    const outsider = await prisma.volunteer.create({
      data: { displayName: 'No Stewardship' },
    });

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${member.id}/unavailability`)
      .query({ churchId: church.id })
      .set('X-Volunteer-Id', outsider.id)
      .expect(403);

    expect(res.body.code).toBe('LEADER_NOT_AUTHORIZED');
  });

  it('lists only stewarded ministry unavailability when a Leader views a member', async () => {
    const { church, ledMinistry, otherMinistry, leader, member } =
      await seedLedMinistryFixture();
    await prisma.unavailability.createMany({
      data: [
        {
          volunteerId: member.id,
          ministryId: ledMinistry.id,
          startsAtUtc: new Date('2026-06-03T10:00:00.000Z'),
          endsAtUtc: new Date('2026-06-03T12:00:00.000Z'),
        },
        {
          volunteerId: member.id,
          ministryId: otherMinistry.id,
          startsAtUtc: new Date('2026-06-04T10:00:00.000Z'),
          endsAtUtc: new Date('2026-06-04T12:00:00.000Z'),
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${member.id}/unavailability`)
      .query({ churchId: church.id })
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].ministry.id).toBe(ledMinistry.id);
  });

  it('scopes leader GET to the ministry header when the leader stewards multiple ministries', async () => {
    const { church, ledMinistry, otherMinistry, leader, member } =
      await seedLedMinistryFixture();
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: otherMinistry.id },
    });
    await prisma.unavailability.createMany({
      data: [
        {
          volunteerId: member.id,
          ministryId: ledMinistry.id,
          startsAtUtc: new Date('2026-06-03T10:00:00.000Z'),
          endsAtUtc: new Date('2026-06-03T12:00:00.000Z'),
        },
        {
          volunteerId: member.id,
          ministryId: otherMinistry.id,
          startsAtUtc: new Date('2026-06-04T10:00:00.000Z'),
          endsAtUtc: new Date('2026-06-04T12:00:00.000Z'),
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${member.id}/unavailability`)
      .query({ churchId: church.id })
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].ministry.id).toBe(ledMinistry.id);
  });

  it('updates and deletes unavailability within a led ministry', async () => {
    const { ledMinistry, leader, member } = await seedLedMinistryFixture();
    const row = await prisma.unavailability.create({
      data: {
        volunteerId: member.id,
        ministryId: ledMinistry.id,
        startsAtUtc: new Date('2026-06-05T10:00:00.000Z'),
        endsAtUtc: new Date('2026-06-05T12:00:00.000Z'),
      },
    });

    const updated = await request(app.getHttpServer())
      .patch(`/unavailability/${row.id}`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        startsAtUtc: '2026-06-05T11:00:00.000Z',
        endsAtUtc: '2026-06-05T13:00:00.000Z',
      })
      .expect(200);

    expect(updated.body.window).toEqual({
      startsAtUtc: '2026-06-05T11:00:00.000Z',
      endsAtUtc: '2026-06-05T13:00:00.000Z',
    });

    await request(app.getHttpServer())
      .delete(`/unavailability/${row.id}`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .expect(200);

    const remaining = await prisma.unavailability.findMany({
      where: { volunteerId: member.id },
    });
    expect(remaining).toHaveLength(0);
  });

  it('rejects update when Leader ministry header mismatches the row ministry', async () => {
    const { ledMinistry, otherMinistry, leader, member } =
      await seedLedMinistryFixture();
    const row = await prisma.unavailability.create({
      data: {
        volunteerId: member.id,
        ministryId: otherMinistry.id,
        startsAtUtc: new Date('2026-06-06T10:00:00.000Z'),
        endsAtUtc: new Date('2026-06-06T12:00:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .patch(`/unavailability/${row.id}`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        startsAtUtc: '2026-06-06T11:00:00.000Z',
        endsAtUtc: '2026-06-06T13:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('LEADER_MINISTRY_MISMATCH');
  });

  it('lists ministry memberships for a leader', async () => {
    const { ledMinistry, leader, member } = await seedLedMinistryFixture();

    const res = await request(app.getHttpServer())
      .get(`/ministries/${ledMinistry.id}/memberships`)
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          volunteerId: member.id,
          displayName: 'Sam Member',
          status: 'ACTIVE',
        }),
      ]),
    );
  });

  it('rejects listing ministry memberships when volunteer is not a steward', async () => {
    const { ledMinistry, member } = await seedLedMinistryFixture();

    const res = await request(app.getHttpServer())
      .get(`/ministries/${ledMinistry.id}/memberships`)
      .set('X-Volunteer-Id', member.id)
      .expect(403);

    expect(res.body.code).toBe('LEADER_NOT_AUTHORIZED');
  });
});
