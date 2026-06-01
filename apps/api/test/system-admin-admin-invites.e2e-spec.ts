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
      return {
        sub: payload.sub,
        email:
          typeof payload.email === 'string' ? payload.email.toLowerCase() : undefined,
      };
    }),
  })),
}));

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SupabaseAdminService } from '../src/system-admin/supabase-admin.service';
import { signTestAccessToken } from './support/sign-test-access-token';

describe('System Admin admin invites (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let inviteCalls: string[];

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
    const supabaseAdmin = app.get(SupabaseAdminService);
    inviteCalls = [];
    supabaseAdmin.setInviteClientForTests({
      inviteUserByEmail: async (email) => {
        inviteCalls.push(email);
      },
    });
    await app.init();
  });

  beforeEach(async () => {
    inviteCalls = [];
    await prisma.adminInvite.deleteMany();
    await prisma.systemAdministrator.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.ministryLeader.deleteMany();
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
  });

  async function seedOperatorAndChurch() {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });
    return prisma.church.create({
      data: {
        id: 'church-invite-test',
        name: 'Invite Test Church',
        defaultTimezone: 'America/Sao_Paulo',
        campuses: {
          create: {
            name: 'Principal',
            timezone: 'America/Sao_Paulo',
          },
        },
      },
    });
  }

  it('creates a pending invite and calls Supabase invite', async () => {
    const church = await seedOperatorAndChurch();

    const res = await request(app.getHttpServer())
      .post(`/system-admin/churches/${church.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'New.Admin@Example.com' })
      .expect(201);

    expect(res.body).toMatchObject({
      email: 'new.admin@example.com',
      churchId: church.id,
      status: 'PENDING',
    });
    expect(inviteCalls).toEqual(['new.admin@example.com']);

    const row = await prisma.adminInvite.findFirst({
      where: { email: 'new.admin@example.com', churchId: church.id },
    });
    expect(row?.status).toBe('PENDING');
  });

  it('returns ADMIN_INVITE_INVALID for malformed email', async () => {
    const church = await seedOperatorAndChurch();

    const res = await request(app.getHttpServer())
      .post(`/system-admin/churches/${church.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(res.body.code).toBe('ADMIN_INVITE_INVALID');
    expect(inviteCalls).toHaveLength(0);
  });

  it('returns ADMIN_INVITE_ALREADY_PENDING for duplicate invite', async () => {
    const church = await seedOperatorAndChurch();

    await request(app.getHttpServer())
      .post(`/system-admin/churches/${church.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'admin@example.com' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/system-admin/churches/${church.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'admin@example.com' })
      .expect(409);

    expect(res.body.code).toBe('ADMIN_INVITE_ALREADY_PENDING');
    expect(inviteCalls).toHaveLength(1);
  });

  it('fulfills invite on first JWT sign-in for a new volunteer', async () => {
    const church = await seedOperatorAndChurch();
    await request(app.getHttpServer())
      .post(`/system-admin/churches/${church.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'invitee@example.com' })
      .expect(201);

    const token = signTestAccessToken('auth-subject-invitee', {
      email: 'invitee@example.com',
    });

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.volunteer.displayName).toBe('Invitee');

    const accreditation = await prisma.adminAccreditation.findFirst({
      where: { churchId: church.id },
      include: { volunteer: true },
    });
    expect(accreditation?.volunteer.authSubjectId).toBe('auth-subject-invitee');

    const invite = await prisma.adminInvite.findFirst({
      where: { email: 'invitee@example.com' },
    });
    expect(invite?.status).toBe('FULFILLED');
    expect(invite?.fulfilledVolunteerId).toBe(accreditation?.volunteerId);
  });

  it('grants additional church accreditation to an existing volunteer', async () => {
    const churchA = await prisma.church.create({
      data: {
        id: 'church-a',
        name: 'Church A',
        defaultTimezone: 'America/Sao_Paulo',
      },
    });
    const churchB = await prisma.church.create({
      data: {
        id: 'church-b',
        name: 'Church B',
        defaultTimezone: 'America/Sao_Paulo',
      },
    });
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });
    await prisma.volunteer.create({
      data: {
        id: 'existing-admin',
        displayName: 'Existing Admin',
        authSubjectId: 'auth-subject-existing',
        adminAccreditations: {
          create: { churchId: churchA.id },
        },
      },
    });

    await request(app.getHttpServer())
      .post(`/system-admin/churches/${churchB.id}/admin-invites`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ email: 'existing.admin@example.com' })
      .expect(201);

    const token = signTestAccessToken('auth-subject-existing', {
      email: 'existing.admin@example.com',
    });

    await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const accreditations = await prisma.adminAccreditation.findMany({
      where: { volunteerId: 'existing-admin' },
      orderBy: { churchId: 'asc' },
    });
    expect(accreditations.map((row) => row.churchId)).toEqual(['church-a', 'church-b']);

    const invite = await prisma.adminInvite.findFirst({
      where: { email: 'existing.admin@example.com', churchId: churchB.id },
    });
    expect(invite?.status).toBe('FULFILLED');
    expect(invite?.fulfilledVolunteerId).toBe('existing-admin');
  });
});
