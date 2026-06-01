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

  jest.setTimeout(30_000);

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
        name: 'Stewardship Church',
        defaultTimezone: 'UTC',
        campuses: { create: { name: 'Principal', timezone: 'UTC' } },
      },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Worship', churchId: church.id },
    });
    return { church, ministry };
  }

  it('grants and revokes ministry leadership via system admin', async () => {
    await seedSystemAdmin();
    const { ministry } = await seedChurchWithMinistry();
    const leader = await prisma.volunteer.create({
      data: { displayName: 'New Leader' },
    });

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: leader.id })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/system-admin/volunteers/${leader.id}`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(detail.body.leaderships).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(
        `/system-admin/ministries/${ministry.id}/leaders/${leader.id}`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);
  });

  it('adds and deactivates ministry membership via system admin', async () => {
    await seedSystemAdmin();
    const { ministry } = await seedChurchWithMinistry();
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member One' },
    });

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/memberships`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: member.id, status: 'ACTIVE' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/system-admin/ministries/${ministry.id}/memberships/${member.id}`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ status: 'INACTIVE' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('INACTIVE');
      });
  });

  it('activates pending membership via system admin', async () => {
    await seedSystemAdmin();
    const { ministry } = await seedChurchWithMinistry();
    const member = await prisma.volunteer.create({
      data: { displayName: 'Pending Member' },
    });

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/memberships`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: member.id, status: 'PENDING' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(
        `/system-admin/ministries/${ministry.id}/memberships/${member.id}`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ status: 'ACTIVE' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ACTIVE');
      });
  });

  it('denies non–system-admin on organization wrapper routes', async () => {
    await seedSystemAdmin();
    const { ministry } = await seedChurchWithMinistry();
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular Volunteer' },
    });

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({ volunteerId: volunteer.id })
      .expect(403);
  });

  it('full stewardship lifecycle: grant admin, leader, membership, revoke admin blocked', async () => {
    await seedSystemAdmin();
    const { church, ministry } = await seedChurchWithMinistry();
    const keeper = await prisma.volunteer.create({
      data: { displayName: 'Keeper Admin' },
    });
    const target = await prisma.volunteer.create({
      data: { displayName: 'Target User' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: keeper.id, churchId: church.id },
    });

    await request(app.getHttpServer())
      .put(
        `/system-admin/volunteers/${target.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: target.id })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/system-admin/ministries/${ministry.id}/memberships`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ volunteerId: target.id, status: 'ACTIVE' })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get(`/system-admin/volunteers/${target.id}`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(summary.body.accreditations).toHaveLength(1);
    expect(summary.body.leaderships).toHaveLength(1);
    expect(summary.body.memberships).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(
        `/system-admin/volunteers/${keeper.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    await request(app.getHttpServer())
      .delete(
        `/system-admin/volunteers/${target.id}/churches/${church.id}/admin-accreditation`,
      )
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('LAST_ADMIN_ACCREDITATION');
      });
  });
});
