import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Admin authorization (e2e)', () => {
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
    await prisma.systemAdministrator.deleteMany();
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
  });

  it('returns isSystemAdmin on GET /identity/me for seeded operator', async () => {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body.isSystemAdmin).toBe(true);
  });

  it('returns isSystemAdmin false for a regular volunteer', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular Volunteer' },
    });

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(res.body.isSystemAdmin).toBe(false);
  });

  it('allows GET /system-admin/health for system admin', async () => {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });

    const res = await request(app.getHttpServer())
      .get('/system-admin/health')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body).toEqual({
      ok: true,
      volunteerId: 'seed-volunteer-system-admin',
    });
  });

  it('returns 403 NOT_SYSTEM_ADMIN for volunteer on operator route', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular Volunteer' },
    });

    const res = await request(app.getHttpServer())
      .get('/system-admin/health')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(403);

    expect(res.body.code).toBe('NOT_SYSTEM_ADMIN');
  });

  it('returns 401 when unauthenticated on operator route', async () => {
    await request(app.getHttpServer()).get('/system-admin/health').expect(401);
  });
});
