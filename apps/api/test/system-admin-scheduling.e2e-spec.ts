import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('System Admin scheduling read-only (e2e)', () => {
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
    await prisma.event.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists events across churches without churchId for system admin', async () => {
    const churchA = await prisma.church.create({
      data: { name: 'A', defaultTimezone: 'UTC' },
    });
    const churchB = await prisma.church.create({
      data: { name: 'B', defaultTimezone: 'UTC' },
    });
    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Event A',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchA.id,
      },
    });
    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Event B',
        startsAtUtc: new Date('2026-06-02T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T16:00:00.000Z'),
        churchId: churchB.id,
      },
    });

    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });

    const res = await request(app.getHttpServer())
      .get('/events')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body).toHaveLength(2);
  });

  it('rejects scheduling writes for system admin', async () => {
    const church = await prisma.church.create({
      data: { name: 'Write Church', defaultTimezone: 'UTC' },
    });
    await prisma.volunteer.create({
      data: {
        id: 'seed-volunteer-system-admin',
        displayName: 'System Operator',
        systemAdministrator: { create: {} },
      },
    });

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({
        kind: 'PUBLIC',
        churchId: church.id,
        title: 'Blocked',
        startsAtUtc: '2026-06-01T14:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('SYSTEM_ADMIN_READ_ONLY');
  });
});
