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

describe('GET /events (e2e)', () => {
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
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.assignment.deleteMany();
    await prisma.unavailability.deleteMany();
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

  it('responds 401 when listing events without authentication', async () => {
    const church = await prisma.church.create({
      data: { name: 'Auth Church', defaultTimezone: 'UTC' },
    });

    await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: church.id })
      .expect(401);
  });

  it('returns public events for the requested church only', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const churchA = await prisma.church.create({
      data: { name: 'Alpha Church', defaultTimezone: 'America/New_York' },
    });
    const churchB = await prisma.church.create({
      data: { name: 'Beta Church', defaultTimezone: 'UTC' },
    });
    const ministryA = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: churchA.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam', authSubjectId },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministryA.id,
        status: 'ACTIVE',
      },
    });

    const publicA = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Sunday Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchA.id,
      },
    });
    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Other Church Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchB.id,
      },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: churchA.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: publicA.id,
      kind: 'PUBLIC',
      title: 'Sunday Service',
      window: {
        startsAtUtc: '2026-06-01T14:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      },
      framing: {
        churchDefaultTimezone: 'America/New_York',
        startsDisplayInChurchTz: '2026-06-01T10:00:00-04:00',
        endsDisplayInChurchTz: '2026-06-01T12:00:00-04:00',
      },
    });
  });

  it('includes private events only for ministries the volunteer participates in', async () => {
    const authSubjectId = '22222222-2222-2222-2222-222222222222';
    const church = await prisma.church.create({
      data: { name: 'Visibility Church', defaultTimezone: 'UTC' },
    });
    const band = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const kids = await prisma.ministry.create({
      data: { name: 'Kids', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Alex', authSubjectId },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: band.id,
        status: 'ACTIVE',
      },
    });

    const bandRehearsal = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Band Rehearsal',
        startsAtUtc: new Date('2026-06-02T18:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T20:00:00.000Z'),
        churchId: church.id,
        ministryId: band.id,
      },
    });
    await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Kids Prep',
        startsAtUtc: new Date('2026-06-02T18:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T20:00:00.000Z'),
        churchId: church.id,
        ministryId: kids.id,
      },
    });

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: church.id })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: bandRehearsal.id,
      kind: 'PRIVATE',
      title: 'Band Rehearsal',
      ministry: { id: band.id, name: 'Band' },
    });
  });
});
