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

describe('Event Cancellation (e2e)', () => {
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
    await prisma.adminAccreditation.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows Admin to cancel an event and voids its assignments', async () => {
    const authSubId = 'admin-auth-sub';
    const church = await prisma.church.create({
      data: { name: 'Admin Church', defaultTimezone: 'UTC' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin', authSubjectId: authSubId },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
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

    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        volunteerId: admin.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
      },
    });

    const token = signTestAccessToken(authSubId);

    await request(app.getHttpServer())
      .post(`/events/${event.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const updatedEvent = await prisma.event.findUnique({
      where: { id: event.id },
    });
    expect(updatedEvent?.voidedAtUtc).toBeTruthy();
    expect(updatedEvent?.voidedAtUtc?.toISOString()).toBe(FIXED_NOW.toISOString());

    const updatedAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(updatedAssignment?.voidedAtUtc).toBeTruthy();
    expect(updatedAssignment?.voidedAtUtc?.toISOString()).toBe(FIXED_NOW.toISOString());
  });

  it('rejects cancellation if not an Admin', async () => {
    const authSubId = 'user-auth-sub';
    const church = await prisma.church.create({
      data: { name: 'Church', defaultTimezone: 'UTC' },
    });
    await prisma.volunteer.create({
      data: { displayName: 'User', authSubjectId: authSubId },
    });

    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Event',
        startsAtUtc: new Date('2026-06-01T10:00:00Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00Z'),
        churchId: church.id,
      },
    });

    const token = signTestAccessToken(authSubId);

    await request(app.getHttpServer())
      .post(`/events/${event.id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
