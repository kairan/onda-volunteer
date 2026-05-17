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
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';
import { signTestAccessToken } from './support/sign-test-access-token';
import { SupabaseJwtVerifier } from '../src/identity/supabase-jwt-verifier';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

describe('Identity: Bearer JWT → Volunteer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let previousDevHeaders: string | undefined;

  beforeAll(async () => {
    previousDevHeaders = process.env.AUTH_ALLOW_DEV_HEADERS;
    process.env.SUPABASE_JWT_SECRET =
      process.env.SUPABASE_JWT_SECRET ??
      'test-supabase-jwt-secret-at-least-32-chars';
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
    if (previousDevHeaders === undefined) {
      delete process.env.AUTH_ALLOW_DEV_HEADERS;
    } else {
      process.env.AUTH_ALLOW_DEV_HEADERS = previousDevHeaders;
    }
  });

  it('lets a volunteer release their own assignment with a valid Bearer JWT', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    const church = await prisma.church.create({
      data: { name: 'JWT Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: {
        displayName: 'Sam Volunteer',
        authSubjectId,
      },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
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
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const row = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(row?.voidedAtUtc).toEqual(FIXED_NOW);
  });

  it('rejects volunteer-scoped actions without a Bearer token', async () => {
    const church = await prisma.church.create({
      data: { name: 'No Auth Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: {
        displayName: 'No Token',
        authSubjectId: '22222222-2222-2222-2222-222222222222',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Keys', retired: false },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .expect(401);

    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

  it('rejects when JWT subject has no linked Volunteer profile', async () => {
    const church = await prisma.church.create({
      data: { name: 'Unlinked Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Ushers', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Linked Later' },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
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
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: volunteer.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const token = signTestAccessToken('33333333-3333-3333-3333-333333333333');

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.code).toBe('PROFILE_NOT_LINKED');
  });

  it('ignores spoofed X-Volunteer-Id when Bearer JWT identifies a different volunteer', async () => {
    const church = await prisma.church.create({
      data: { name: 'Spoof Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const owner = await prisma.volunteer.create({
      data: {
        displayName: 'Owner',
        authSubjectId: '44444444-4444-4444-4444-444444444444',
      },
    });
    const impostor = await prisma.volunteer.create({
      data: {
        displayName: 'Impostor',
        authSubjectId: '55555555-5555-5555-5555-555555555555',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
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
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: owner.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    const token = signTestAccessToken(impostor.authSubjectId!);

    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignment.id}/release`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Volunteer-Id', owner.id)
      .expect(403);

    expect(res.body.code).toBe('ASSIGNMENT_NOT_OWNED');
  });

  it('lets an authenticated Leader create an assignment for their ministry', async () => {
    const authSubjectId = '66666666-6666-6666-6666-666666666666';
    const church = await prisma.church.create({
      data: { name: 'Leader Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Lee Leader', authSubjectId },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    const rostered = await prisma.volunteer.create({
      data: { displayName: 'Riley Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: rostered.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
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

    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        volunteerId: rostered.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(201);
  });

  it('rejects leader assignment when JWT volunteer is not a Leader for that ministry', async () => {
    const authSubjectId = '77777777-7777-7777-7777-777777777777';
    const church = await prisma.church.create({
      data: { name: 'Not Leader Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    await prisma.volunteer.create({
      data: { displayName: 'Not A Leader', authSubjectId },
    });
    const rostered = await prisma.volunteer.create({
      data: { displayName: 'Riley' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: rostered.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Keys', retired: false },
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

    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        volunteerId: rostered.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('LEADER_NOT_AUTHORIZED');
  });

  it('lets an accredited Admin create an assignment without a MinistryLeader row', async () => {
    const authSubjectId = '88888888-8888-8888-8888-888888888888';
    const church = await prisma.church.create({
      data: { name: 'Admin Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Alex Admin', authSubjectId },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    const rostered = await prisma.volunteer.create({
      data: { displayName: 'Riley Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: rostered.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
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

    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        volunteerId: rostered.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(201);
  });
});
