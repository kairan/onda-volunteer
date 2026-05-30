import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Ministry structure administration (e2e)', () => {
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
    await prisma.assignment.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets an accredited Admin create and rename a Ministry while preserving its id', async () => {
    const church = await prisma.church.create({
      data: { name: 'Structure Church', defaultTimezone: 'UTC' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Structure Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { churchId: church.id, volunteerId: admin.id },
    });

    const created = await request(app.getHttpServer())
      .post(`/churches/${church.id}/ministries`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'Hospitality' })
      .expect(201);

    expect(created.body).toMatchObject({
      churchId: church.id,
      name: 'Hospitality',
    });

    const renamed = await request(app.getHttpServer())
      .patch(`/ministries/${created.body.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'Welcome Team' })
      .expect(200);

    expect(renamed.body).toEqual({
      id: created.body.id,
      churchId: church.id,
      name: 'Welcome Team',
    });

    const context = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    expect(context.body.churches[0].ministries).toContainEqual({
      id: created.body.id,
      name: 'Welcome Team',
      isChurchAdmin: true,
    });
  });

  it('rejects non-admin, empty, and duplicate Ministry names', async () => {
    const church = await prisma.church.create({
      data: { name: 'Guarded Church', defaultTimezone: 'UTC' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Volunteer' },
    });
    await prisma.adminAccreditation.create({
      data: { churchId: church.id, volunteerId: admin.id },
    });
    await prisma.ministry.create({
      data: { churchId: church.id, name: 'Band' },
    });

    await request(app.getHttpServer())
      .post(`/churches/${church.id}/ministries`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Kids' })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });

    await request(app.getHttpServer())
      .post(`/churches/${church.id}/ministries`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: '   ' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('MINISTRY_NAME_REQUIRED');
      });

    await request(app.getHttpServer())
      .post(`/churches/${church.id}/ministries`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'Band' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('MINISTRY_NAME_CONFLICT');
      });

    await request(app.getHttpServer())
      .post(`/churches/${church.id}/ministries`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'band' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('MINISTRY_NAME_CONFLICT');
      });
  });
});
