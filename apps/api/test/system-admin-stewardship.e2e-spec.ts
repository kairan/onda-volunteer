import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Admin stewardship (e2e)', () => {
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
    await prisma.adminAccreditation.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedFixture() {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });
    const church = await prisma.church.create({
      data: {
        name: 'Stewardship Church',
        defaultTimezone: 'UTC',
        campuses: { create: { name: 'Principal', timezone: 'UTC' } },
      },
    });
    const ministry = await prisma.ministry.create({
      data: { churchId: church.id, name: 'Greeters' },
    });
    const target = await prisma.volunteer.create({
      data: { displayName: 'Target Volunteer' },
    });
    return { church, ministry, target };
  }

  it('searches volunteers and grants admin accreditation', async () => {
    const { church, target } = await seedFixture();

    const search = await request(app.getHttpServer())
      .get('/system-admin/volunteers')
      .query({ q: 'Target' })
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(search.body.some((v: { id: string }) => v.id === target.id)).toBe(true);

    await request(app.getHttpServer())
      .put(
        `/system-admin/volunteers/${target.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    const accreditation = await prisma.adminAccreditation.findUnique({
      where: {
        volunteerId_churchId: {
          volunteerId: target.id,
          churchId: church.id,
        },
      },
    });
    expect(accreditation).not.toBeNull();
  });

  it('blocks revoking the last admin accreditation', async () => {
    const { church, target } = await seedFixture();
    await prisma.adminAccreditation.create({
      data: { volunteerId: target.id, churchId: church.id },
    });

    const res = await request(app.getHttpServer())
      .delete(
        `/system-admin/volunteers/${target.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(400);

    expect(res.body.code).toBe('LAST_ADMIN_ACCREDITATION');
  });

  it('grants ministry leader under system admin', async () => {
    const { ministry, target } = await seedFixture();

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: target.id })
      .expect(201);

    const leader = await prisma.ministryLeader.findUnique({
      where: {
        volunteerId_ministryId: {
          volunteerId: target.id,
          ministryId: ministry.id,
        },
      },
    });
    expect(leader).not.toBeNull();
  });
});
