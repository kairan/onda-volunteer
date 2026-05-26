import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Ministry leader delegation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.AUTH_ALLOW_DEV_HEADERS = 'true';
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for e2e tests');
    }
    execSync('pnpm exec prisma migrate deploy', {
      cwd: path.resolve(__dirname, '..'),
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
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('grants and revokes ministry leadership for accredited admin', async () => {
    const church = await prisma.church.create({
      data: { name: 'Delegate Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Youth', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'New Leader' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/leaders/${leader.id}`)
      .set('X-Volunteer-Id', admin.id)
      .expect(201);

    const listed = await request(app.getHttpServer())
      .get(`/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    expect(listed.body).toHaveLength(1);

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/leaders/${leader.id}/revoke`)
      .set('X-Volunteer-Id', admin.id)
      .expect(200);
  });

  it('denies grant when admin is not accredited for the church', async () => {
    const church = await prisma.church.create({
      data: { name: 'Scoped Church', defaultTimezone: 'UTC' },
    });
    const otherChurch = await prisma.church.create({
      data: { name: 'Other Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Youth', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Wrong Admin' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'New Leader' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: otherChurch.id },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/leaders/${leader.id}`)
      .set('X-Volunteer-Id', admin.id)
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });

  it('denies list when caller has no accreditation for the ministry church', async () => {
    const church = await prisma.church.create({
      data: { name: 'Scoped Church', defaultTimezone: 'UTC' },
    });
    const otherChurch = await prisma.church.create({
      data: { name: 'Other Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Youth', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Wrong Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: otherChurch.id },
    });

    await request(app.getHttpServer())
      .get(`/ministries/${ministry.id}/leaders`)
      .set('X-Volunteer-Id', admin.id)
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });

  it('denies delegation when caller is a ministry leader but not an accredited admin', async () => {
    const church = await prisma.church.create({
      data: { name: 'Leader Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Youth', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Delegated Leader' },
    });
    const target = await prisma.volunteer.create({
      data: { displayName: 'Target Volunteer' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/leaders/${target.id}`)
      .set('X-Volunteer-Id', leader.id)
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });

  it('allows delegated leader to list ministry memberships after grant', async () => {
    const church = await prisma.church.create({
      data: { name: 'Grant Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'New Leader' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: member.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/leaders/${leader.id}`)
      .set('X-Volunteer-Id', admin.id)
      .expect(201);

    await request(app.getHttpServer())
      .get(`/ministries/${ministry.id}/memberships`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].volunteerId).toBe(member.id);
      });
  });
});
