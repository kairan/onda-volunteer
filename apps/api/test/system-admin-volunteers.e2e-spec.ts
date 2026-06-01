import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Admin volunteers (e2e)', () => {
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

  async function seedSystemAdmin() {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });
  }

  async function seedChurchWithMinistry() {
    const church = await prisma.church.create({
      data: {
        name: 'Grace Chapel',
        defaultTimezone: 'UTC',
        campuses: { create: { name: 'Principal', timezone: 'UTC' } },
      },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Youth', churchId: church.id },
    });
    return { church, ministry };
  }

  it('searches volunteers with accreditation and membership summary', async () => {
    await seedSystemAdmin();
    const { church, ministry } = await seedChurchWithMinistry();
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Alice Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: volunteer.id, churchId: church.id },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });

    const res = await request(app.getHttpServer())
      .get('/system-admin/volunteers?q=Alice')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      id: volunteer.id,
      displayName: 'Alice Admin',
      accreditations: [{ churchId: church.id, churchName: 'Grace Chapel' }],
      memberships: [
        {
          ministryId: ministry.id,
          ministryName: 'Youth',
          churchId: church.id,
          status: 'ACTIVE',
        },
      ],
    });
    expect(res.body.nextCursor).toBeNull();
  });

  it('returns volunteer detail by id', async () => {
    await seedSystemAdmin();
    const { church, ministry } = await seedChurchWithMinistry();
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Bob Leader' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: volunteer.id, ministryId: ministry.id },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: volunteer.id, churchId: church.id },
    });

    const res = await request(app.getHttpServer())
      .get(`/system-admin/volunteers/${volunteer.id}`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body.leaderships).toHaveLength(1);
    expect(res.body.leaderships[0].ministryName).toBe('Youth');
  });

  it('grants and revokes admin accreditation', async () => {
    await seedSystemAdmin();
    const { church } = await seedChurchWithMinistry();
    const adminA = await prisma.volunteer.create({
      data: { displayName: 'Admin A' },
    });
    const adminB = await prisma.volunteer.create({
      data: { displayName: 'Admin B' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: adminA.id, churchId: church.id },
    });

    await request(app.getHttpServer())
      .put(
        `/system-admin/volunteers/${adminB.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/system-admin/volunteers/${adminB.id}`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(detail.body.accreditations).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(
        `/system-admin/volunteers/${adminB.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);
  });

  it('blocks revoking the last admin accreditation', async () => {
    await seedSystemAdmin();
    const { church } = await seedChurchWithMinistry();
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Sole Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });

    const res = await request(app.getHttpServer())
      .delete(
        `/system-admin/volunteers/${admin.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(400);

    expect(res.body.code).toBe('LAST_ADMIN_ACCREDITATION');
  });

  it('denies non–system-admin on volunteer routes', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular Volunteer' },
    });

    await request(app.getHttpServer())
      .get('/system-admin/volunteers')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(403);
  });
});
