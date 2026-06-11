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

describe('Volunteer invite flow (e2e)', () => {
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
    await prisma.volunteerInvite.deleteMany();
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

  async function seedLeaderAndMinistry() {
    const church = await prisma.church.create({
      data: {
        id: 'church-invite-test',
        name: 'Invite Test Church',
        defaultTimezone: 'America/Sao_Paulo',
      },
    });
    const ministry = await prisma.ministry.create({
      data: {
        id: 'ministry-invite-test',
        name: 'Worship',
        churchId: church.id,
      },
    });
    const leader = await prisma.volunteer.create({
      data: {
        id: 'leader-vol',
        displayName: 'Leader Person',
        email: 'leader@example.com',
      },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    await prisma.ministryMembership.create({
      data: { volunteerId: leader.id, ministryId: ministry.id, status: 'ACTIVE' },
    });
    return { church, ministry, leader };
  }

  describe('POST /ministries/:id/invites', () => {
    it('sends invite to new email and creates VolunteerInvite row', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      const res = await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'New.Person@Example.com' })
        .expect(200);

      expect(res.body).toMatchObject({
        email: 'new.person@example.com',
        status: 'PENDING',
      });
      expect(res.body.id).toBeDefined();
      expect(inviteCalls).toEqual(['new.person@example.com']);

      const row = await prisma.volunteerInvite.findFirst({
        where: { email: 'new.person@example.com' },
      });
      expect(row?.status).toBe('PENDING');
      expect(row?.ministryId).toBe(ministry.id);
    });

    it('returns VOLUNTEER_ALREADY_EXISTS when email matches existing volunteer', async () => {
      const { ministry } = await seedLeaderAndMinistry();
      await prisma.volunteer.create({
        data: { id: 'existing-vol', displayName: 'Existing', email: 'existing@example.com' },
      });

      const res = await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'Existing@Example.com' })
        .expect(200);

      expect(res.body.code).toBe('VOLUNTEER_ALREADY_EXISTS');
      expect(res.body.existingVolunteerId).toBe('existing-vol');
      expect(res.body.displayName).toBe('Existing');
      expect(inviteCalls).toHaveLength(0);
    });

    it('resends invite before expiry (resets TTL, re-dispatches Supabase)', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'resend@example.com' })
        .expect(200);

      expect(inviteCalls).toHaveLength(1);

      const res = await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'resend@example.com' })
        .expect(200);

      expect(res.body.status).toBe('PENDING');
      expect(inviteCalls).toHaveLength(2);

      const rows = await prisma.volunteerInvite.findMany({
        where: { email: 'resend@example.com', ministryId: ministry.id },
      });
      expect(rows).toHaveLength(1);
    });

    it('returns MINISTRY_ARCHIVED for archived ministry', async () => {
      const { ministry } = await seedLeaderAndMinistry();
      await prisma.ministry.update({
        where: { id: ministry.id },
        data: { archivedAt: new Date() },
      });

      const res = await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'new@example.com' })
        .expect(400);

      expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      expect(inviteCalls).toHaveLength(0);
    });

    it('returns INVITE_EMAIL_INVALID for bad email', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      const res = await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'not-valid' })
        .expect(400);

      expect(res.body.code).toBe('INVITE_EMAIL_INVALID');
    });
  });

  describe('GET /ministries/:id/invites', () => {
    it('returns list of invites for a ministry', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'invite1@example.com' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .expect(200);

      expect(res.body.invites).toHaveLength(1);
      expect(res.body.invites[0]).toMatchObject({
        email: 'invite1@example.com',
        status: 'PENDING',
      });
    });
  });

  describe('GET /churches/:id/volunteers/search', () => {
    it('returns matching volunteers by name', async () => {
      const { church, ministry } = await seedLeaderAndMinistry();
      await prisma.volunteer.create({
        data: { id: 'search-vol', displayName: 'Alice Wonderland', email: 'alice@example.com' },
      });
      await prisma.ministryMembership.create({
        data: { volunteerId: 'search-vol', ministryId: ministry.id, status: 'INACTIVE' },
      });

      const res = await request(app.getHttpServer())
        .get(`/churches/${church.id}/volunteers/search?q=Alice&ministryId=${ministry.id}`)
        .set('X-Volunteer-Id', 'leader-vol')
        .expect(200);

      expect(res.body.volunteers).toHaveLength(1);
      expect(res.body.volunteers[0]).toMatchObject({
        id: 'search-vol',
        displayName: 'Alice Wonderland',
      });
    });

    it('excludes ACTIVE/PENDING members of the ministry', async () => {
      const { church, ministry } = await seedLeaderAndMinistry();

      const res = await request(app.getHttpServer())
        .get(`/churches/${church.id}/volunteers/search?q=Leader&ministryId=${ministry.id}`)
        .set('X-Volunteer-Id', 'leader-vol')
        .expect(200);

      expect(res.body.volunteers).toHaveLength(0);
    });

    it('returns SEARCH_QUERY_TOO_SHORT for short query', async () => {
      const { church, ministry } = await seedLeaderAndMinistry();

      const res = await request(app.getHttpServer())
        .get(`/churches/${church.id}/volunteers/search?q=A&ministryId=${ministry.id}`)
        .set('X-Volunteer-Id', 'leader-vol')
        .expect(400);

      expect(res.body.code).toBe('SEARCH_QUERY_TOO_SHORT');
    });
  });

  describe('Invite fulfillment on sign-in', () => {
    it('creates Pending membership when invited person signs in', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'invitee@example.com' })
        .expect(200);

      const token = signTestAccessToken('auth-subject-invitee', {
        email: 'invitee@example.com',
      });

      const res = await request(app.getHttpServer())
        .get('/identity/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.volunteer.displayName).toBe('Invitee');
      expect(res.body.newlyFulfilledInvites).toEqual([
        { ministryId: ministry.id, ministryName: ministry.name },
      ]);

      const secondMe = await request(app.getHttpServer())
        .get('/identity/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(secondMe.body.newlyFulfilledInvites).toEqual([]);

      const volunteer = await prisma.volunteer.findUnique({
        where: { authSubjectId: 'auth-subject-invitee' },
      });
      expect(volunteer?.email).toBe('invitee@example.com');

      const membership = await prisma.ministryMembership.findUnique({
        where: {
          volunteerId_ministryId: {
            volunteerId: volunteer!.id,
            ministryId: ministry.id,
          },
        },
      });
      expect(membership?.status).toBe('PENDING');

      const invite = await prisma.volunteerInvite.findFirst({
        where: { email: 'invitee@example.com' },
      });
      expect(invite?.status).toBe('ACCEPTED');
    });

    it('marks invite as EXPIRED when ministry is archived at fulfillment time', async () => {
      const { ministry } = await seedLeaderAndMinistry();

      await request(app.getHttpServer())
        .post(`/ministries/${ministry.id}/invites`)
        .set('X-Volunteer-Id', 'leader-vol')
        .send({ email: 'late@example.com' })
        .expect(200);

      await prisma.ministry.update({
        where: { id: ministry.id },
        data: { archivedAt: new Date() },
      });

      const token = signTestAccessToken('auth-subject-late', {
        email: 'late@example.com',
      });

      const res = await request(app.getHttpServer())
        .get('/identity/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.volunteer.displayName).toBe('Late');
      expect(res.body.newlyFulfilledInvites).toEqual([]);

      const volunteer = await prisma.volunteer.findUnique({
        where: { authSubjectId: 'auth-subject-late' },
      });
      expect(volunteer).not.toBeNull();

      const invite = await prisma.volunteerInvite.findFirst({
        where: { email: 'late@example.com' },
      });
      expect(invite?.status).toBe('EXPIRED');

      const membership = await prisma.ministryMembership.findUnique({
        where: {
          volunteerId_ministryId: {
            volunteerId: volunteer!.id,
            ministryId: ministry.id,
          },
        },
      });
      expect(membership).toBeNull();
    });
  });
});
