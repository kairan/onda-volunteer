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

describe('Events List (e2e)', () => {
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
    await prisma.assignment.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /events returns Public events for the church', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    const otherChurch = await prisma.church.create({
      data: { name: 'Other Church', defaultTimezone: 'UTC' },
    });
    
    await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });

    const e1 = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Public Event',
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
        churchId: church.id,
      },
    });

    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Other Church Event',
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
        churchId: otherChurch.id,
      },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: church.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(e1.id);
  });

  it('GET /events returns Private events only if participant or Admin', async () => {
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
      data: { name: 'Greeters', churchId: church.id },
    });

    // Private event for Music
    const e1 = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Music Rehearsal',
        startsAtUtc: new Date('2026-06-02T10:00:00Z'),
        endsAtUtc: new Date('2026-06-02T12:00:00Z'),
        churchId: church.id,
        ministryId: m1.id,
      },
    });

    // Private event for Greeters
    await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Greeters Prep',
        startsAtUtc: new Date('2026-06-02T10:00:00Z'),
        endsAtUtc: new Date('2026-06-02T12:00:00Z'),
        churchId: church.id,
        ministryId: m2.id,
      },
    });

    // Sam is member of Music
    await prisma.ministryMembership.create({
      data: { volunteerId: volunteer.id, ministryId: m1.id, status: 'ACTIVE' },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: church.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(e1.id);
  });
});
