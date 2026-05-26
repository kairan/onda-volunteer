import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Ministry membership lifecycle (e2e)', () => {
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
    await prisma.adminAccreditation.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows accredited admin to add pending and activate membership', async () => {
    const church = await prisma.church.create({
      data: { name: 'Lifecycle Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin Pat' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'New Volunteer' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/memberships`)
      .set('X-Volunteer-Id', admin.id)
      .send({ volunteerId: member.id, status: 'PENDING' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.status).toBe('PENDING');
      });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/memberships/${member.id}/activate`)
      .set('X-Volunteer-Id', admin.id)
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ACTIVE');
      });
  });

  it('denies add when admin is not accredited for the church', async () => {
    const church = await prisma.church.create({
      data: { name: 'Scoped Church', defaultTimezone: 'UTC' },
    });
    const otherChurch = await prisma.church.create({
      data: { name: 'Other Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Team', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Wrong Admin' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Volunteer' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: otherChurch.id },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/memberships`)
      .set('X-Volunteer-Id', admin.id)
      .send({ volunteerId: member.id, status: 'ACTIVE' })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });
});
