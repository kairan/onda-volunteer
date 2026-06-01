import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Admin churches (e2e)', () => {
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
    await prisma.adminInvite.deleteMany();
    await prisma.systemAdministrator.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
    await prisma.volunteer.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedOperator() {
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });
  }

  it('creates a church with default campus transactionally', async () => {
    await seedOperator();

    const res = await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({
        name: 'New Parish',
        defaultTimezone: 'America/Sao_Paulo',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'New Parish',
      defaultTimezone: 'America/Sao_Paulo',
      campuses: [
        {
          name: 'Principal',
          timezone: 'America/Sao_Paulo',
        },
      ],
    });

    const campuses = await prisma.campus.findMany({
      where: { churchId: res.body.id },
    });
    expect(campuses).toHaveLength(1);
  });

  it('returns validation errors for invalid timezone', async () => {
    await seedOperator();

    const res = await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({
        name: 'Bad TZ Church',
        defaultTimezone: 'Not/A_Timezone',
      })
      .expect(400);

    expect(res.body.code).toBe('INVALID_TIMEZONE');
  });

  it('denies church create for non–system-admin', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular' },
    });

    await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Nope', defaultTimezone: 'UTC' })
      .expect(403);
  });
});
