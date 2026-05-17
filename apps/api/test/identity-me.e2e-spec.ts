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
import { SupabaseJwtVerifier } from '../src/identity/supabase-jwt-verifier';

describe('GET /identity/me (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let previousDevHeaders: string | undefined;
  let previousAutoLink: string | undefined;

  beforeAll(async () => {
    previousDevHeaders = process.env.AUTH_ALLOW_DEV_HEADERS;
    previousAutoLink = process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID;
    process.env.SUPABASE_JWT_SECRET =
      process.env.SUPABASE_JWT_SECRET ??
      'test-supabase-jwt-secret-at-least-32-chars';
    process.env.AUTH_ALLOW_DEV_HEADERS = 'false';
    process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID = 'seed-volunteer-demo';

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
    }).compile();

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
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    if (previousDevHeaders === undefined) {
      delete process.env.AUTH_ALLOW_DEV_HEADERS;
    } else {
      process.env.AUTH_ALLOW_DEV_HEADERS = previousDevHeaders;
    }
    if (previousAutoLink === undefined) {
      delete process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID;
    } else {
      process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID = previousAutoLink;
    }
  });

  it('responds 401 when the caller is not authenticated', async () => {
    await request(app.getHttpServer()).get('/identity/me').expect(401);
  });

  it('returns the linked volunteer for a valid Bearer JWT', async () => {
    const authSubjectId = '22222222-2222-2222-2222-222222222222';
    const volunteer = await prisma.volunteer.create({
      data: {
        displayName: 'Linked Volunteer',
        authSubjectId,
      },
    });
    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      volunteer: {
        id: volunteer.id,
        displayName: 'Linked Volunteer',
        uiLocale: null,
      },
      authSubjectId,
    });
  });

  it('auto-links the seed volunteer on first sign-in when configured', async () => {
    const authSubjectId = '33333333-3333-3333-3333-333333333333';
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-demo',
        displayName: 'Demo Volunteer',
        authSubjectId: null,
      },
    });
    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.volunteer.id).toBe('seed-volunteer-demo');
    expect(res.body.authSubjectId).toBe(authSubjectId);

    const updated = await prisma.volunteer.findUnique({
      where: { id: 'seed-volunteer-demo' },
    });
    expect(updated?.authSubjectId).toBe(authSubjectId);
  });

  it('responds 403 PROFILE_NOT_LINKED when auto-link is disabled', async () => {
    const previous = process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID;
    delete process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID;

    const authSubjectId = '44444444-4444-4444-4444-444444444444';
    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.code).toBe('PROFILE_NOT_LINKED');

    if (previous !== undefined) {
      process.env.AUTH_AUTO_LINK_SEED_VOLUNTEER_ID = previous;
    }
  });
});
