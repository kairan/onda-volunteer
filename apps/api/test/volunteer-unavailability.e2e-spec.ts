import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

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
import { CLOCK } from '../src/common/clock';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

describe('Volunteer Unavailability (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-at-least-32-chars';
    process.env.AUTH_ALLOW_DEV_HEADERS = 'false';

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
    await prisma.unavailability.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /volunteers/:volunteerId/unavailability returns unavailability for the volunteer', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });

    const u1 = await prisma.unavailability.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
      },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${volunteer.id}/unavailability`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(u1.id);
    expect(res.body[0].ministry.name).toBe('Music');
  });

  it('POST /volunteers/:volunteerId/unavailability creates new record if member', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });

    // Must be a member to create unavailability
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });

    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ministryId: ministry.id,
        startsAtUtc: '2026-06-02T10:00:00Z',
        endsAtUtc: '2026-06-02T12:00:00Z',
      })
      .expect(201);

    const count = await prisma.unavailability.count({
      where: { volunteerId: volunteer.id },
    });
    expect(count).toBe(1);
  });

  it('POST /volunteers/:volunteerId/unavailability/bulk creates records for multiple ministries', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    const m1 = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });
    const m2 = await prisma.ministry.create({
      data: { name: 'Tech', churchId: church.id },
    });

    await prisma.ministryMembership.createMany({
      data: [
        { volunteerId: volunteer.id, ministryId: m1.id, status: 'ACTIVE' },
        { volunteerId: volunteer.id, ministryId: m2.id, status: 'ACTIVE' },
      ],
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability/bulk`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ministryIds: [m1.id, m2.id],
        startsAtUtc: '2026-06-03T10:00:00Z',
        endsAtUtc: '2026-06-03T12:00:00Z',
      })
      .expect(201);

    expect(res.body.count).toBe(2);
    
    const count = await prisma.unavailability.count({
      where: { volunteerId: volunteer.id },
    });
    expect(count).toBe(2);
  });

  it('allows Leader to create unavailability for a member of their ministry', async () => {
    const leaderAuthSubId = 'leader-auth-sub';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader', authSubjectId: leaderAuthSubId },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member', authSubjectId: 'member-auth-sub' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });

    // Setup: leader leads the ministry
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    // Setup: member is in the ministry
    await prisma.ministryMembership.create({
      data: { volunteerId: member.id, ministryId: ministry.id, status: 'ACTIVE' },
    });

    const token = signTestAccessToken(leaderAuthSubId);

    await request(app.getHttpServer())
      .post(`/volunteers/${member.id}/unavailability`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ministryId: ministry.id,
        startsAtUtc: '2026-06-10T10:00:00Z',
        endsAtUtc: '2026-06-10T12:00:00Z',
      })
      .expect(201);

    const count = await prisma.unavailability.count({
      where: { volunteerId: member.id },
    });
    expect(count).toBe(1);
  });
});
