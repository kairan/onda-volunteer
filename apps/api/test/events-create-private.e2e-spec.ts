import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/identity/supabase-jwt-verifier', () => ({
  SupabaseJwtVerifier: jest.fn().mockImplementation(() => ({
    verifyBearerToken: jest.fn().mockImplementation(async (authHeader: string) => {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return { sub: payload.sub };
    }),
  })),
}));

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { signTestAccessToken } from './support/sign-test-access-token';

describe('POST /events private create + assign (e2e)', () => {
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

  async function seedLedMinistryFixture() {
    const church = await prisma.church.create({
      data: { name: 'Private Church', defaultTimezone: 'UTC' },
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
      data: { displayName: 'Member', authSubjectId: 'member-auth-subject' },
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
    const role = await prisma.ministryRole.create({
      data: { ministryId: ledMinistry.id, name: 'Keys', retired: false },
    });
    return { church, ledMinistry, otherMinistry, leader, member, role };
  }

  it('leader creates private event and assigns on roster', async () => {
    const { ledMinistry, leader, member, role } = await seedLedMinistryFixture();

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: ledMinistry.id,
        title: 'Rehearsal',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/events/${created.body.id}/assignments`)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        volunteerId: member.id,
        ministryId: ledMinistry.id,
        roleId: role.id,
        startsAtUtc: '2026-08-01T18:30:00.000Z',
        endsAtUtc: '2026-08-01T19:30:00.000Z',
      })
      .expect(201);
  });

  it('rejects private event create when volunteer is not a leader for the ministry', async () => {
    const { ledMinistry } = await seedLedMinistryFixture();
    const token = signTestAccessToken('member-auth-subject');

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        kind: 'PRIVATE',
        ministryId: ledMinistry.id,
        title: 'Rehearsal',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('LEADER_NOT_AUTHORIZED');
  });

  it('rejects Leader create when dev ministry header does not match body ministry', async () => {
    const { ledMinistry, otherMinistry, leader } = await seedLedMinistryFixture();

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: otherMinistry.id,
        title: 'Rehearsal',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('LEADER_MINISTRY_MISMATCH');
  });

  it('rejects assignment when ministryId does not match a private event ministry', async () => {
    const { ledMinistry, otherMinistry, leader, member } =
      await seedLedMinistryFixture();
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: otherMinistry.id },
    });
    const otherRole = await prisma.ministryRole.create({
      data: { ministryId: otherMinistry.id, name: 'Host', retired: false },
    });

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ledMinistry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: ledMinistry.id,
        title: 'Rehearsal',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/events/${created.body.id}/assignments`)
      .set('X-Leader-Ministry-Id', otherMinistry.id)
      .send({
        volunteerId: member.id,
        ministryId: otherMinistry.id,
        roleId: otherRole.id,
        startsAtUtc: '2026-08-01T18:30:00.000Z',
        endsAtUtc: '2026-08-01T19:30:00.000Z',
      })
      .expect(400);

    expect(res.body.code).toBe('PRIVATE_EVENT_MINISTRY_MISMATCH');
  });
});
