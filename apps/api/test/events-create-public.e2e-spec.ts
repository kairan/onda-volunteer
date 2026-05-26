import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('POST /events public create (e2e)', () => {
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
    await prisma.event.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a public event for accredited admin', async () => {
    const church = await prisma.church.create({
      data: { name: 'Create Church', defaultTimezone: 'America/New_York' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', admin.id)
      .send({
        kind: 'PUBLIC',
        churchId: church.id,
        title: 'Community Dinner',
        startsAtUtc: '2026-07-01T18:00:00.000Z',
        endsAtUtc: '2026-07-01T21:00:00.000Z',
      })
      .expect(201);

    expect(res.body.id).toBeTruthy();
    expect(res.body.kind).toBe('PUBLIC');
    expect(res.body.window.startsAtUtc).toBe('2026-07-01T18:00:00.000Z');
  });

  it('denies create when admin lacks accreditation', async () => {
    const church = await prisma.church.create({
      data: { name: 'Scoped', defaultTimezone: 'UTC' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Outsider' },
    });

    await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', admin.id)
      .send({
        kind: 'PUBLIC',
        churchId: church.id,
        title: 'Blocked',
        startsAtUtc: '2026-07-01T18:00:00.000Z',
        endsAtUtc: '2026-07-01T21:00:00.000Z',
      })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });
});
