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

  it('creates a church with default campus', async () => {
    await seedSystemAdmin();

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
    expect(res.body.id).toBeTruthy();
    expect(res.body.campuses[0].id).toBeTruthy();

    const stored = await prisma.church.findUnique({
      where: { id: res.body.id },
      include: { campuses: true },
    });
    expect(stored?.campuses).toHaveLength(1);
  });

  it('lists churches with search and pagination', async () => {
    await seedSystemAdmin();
    const alpha = await prisma.church.create({
      data: {
        name: 'Alpha Chapel',
        defaultTimezone: 'UTC',
        campuses: { create: { name: 'Principal', timezone: 'UTC' } },
      },
    });
    await prisma.church.create({
      data: {
        name: 'Beta Chapel',
        defaultTimezone: 'UTC',
        campuses: { create: { name: 'Principal', timezone: 'UTC' } },
      },
    });

    const listRes = await request(app.getHttpServer())
      .get('/system-admin/churches?q=Alpha&limit=10')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(listRes.body.items).toHaveLength(1);
    expect(listRes.body.items[0].id).toBe(alpha.id);
    expect(listRes.body.nextCursor).toBeNull();
  });

  it('returns validation errors for empty name', async () => {
    await seedSystemAdmin();

    const res = await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ name: '  ', defaultTimezone: 'UTC' })
      .expect(400);

    expect(res.body.code).toBe('CHURCH_NAME_REQUIRED');
  });

  it('returns validation errors for invalid timezone', async () => {
    await seedSystemAdmin();

    const res = await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({ name: 'Bad TZ Church', defaultTimezone: 'Not/A/Zone' })
      .expect(400);

    expect(res.body.code).toBe('INVALID_TIMEZONE');
  });

  it('denies non–system-admin on church routes', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Regular Volunteer' },
    });

    await request(app.getHttpServer())
      .get('/system-admin/churches')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(403);

    await request(app.getHttpServer())
      .post('/system-admin/churches')
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Blocked', defaultTimezone: 'UTC' })
      .expect(403);
  });
});
