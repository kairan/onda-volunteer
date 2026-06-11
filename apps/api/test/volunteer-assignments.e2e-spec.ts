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

describe('Volunteer Assignments (e2e)', () => {
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
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /volunteers/:volunteerId/assignments returns non-voided assignments for the church', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'Test Church', defaultTimezone: 'UTC' },
    });
    await prisma.church.create({
      data: { name: 'Other Church', defaultTimezone: 'UTC' },
    });
    
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    const otherVolunteer = await prisma.volunteer.create({
      data: { displayName: 'Other', authSubjectId: '2222' },
    });

    const ministry = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });
    const role = await prisma.ministryRole.create({
      data: { name: 'Singer', ministryId: ministry.id },
    });

    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Sunday Service',
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
        churchId: church.id,
      },
    });

    // 1. Active assignment (should be returned)
    const a1 = await prisma.assignment.create({
      data: {
        volunteerId: volunteer.id,
        eventId: event.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T11:00:00Z'),
      },
    });

    // 2. Voided assignment (should NOT be returned)
    await prisma.assignment.create({
      data: {
        volunteerId: volunteer.id,
        eventId: event.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T11:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
        voidedAtUtc: new Date(),
      },
    });

    // 3. Assignment for other volunteer (should NOT be returned)
    await prisma.assignment.create({
      data: {
        volunteerId: otherVolunteer.id,
        eventId: event.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T11:00:00Z'),
      },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${volunteer.id}/assignments`)
      .query({ churchId: church.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(a1.id);
    expect(res.body[0].event.title).toBe('Sunday Service');
    expect(res.body[0].role.name).toBe('Singer');
  });

  it('rejects requesting assignments for another volunteer', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    const otherVolunteer = await prisma.volunteer.create({
      data: { displayName: 'Other', authSubjectId: 'other-sub' },
    });

    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .get(`/volunteers/${otherVolunteer.id}/assignments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
