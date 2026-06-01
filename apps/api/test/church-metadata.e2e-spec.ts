import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Church metadata PATCH (e2e)', () => {
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
    await prisma.adminAccreditation.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.campus.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows accredited admin to rename church', async () => {
    const church = await prisma.church.create({
      data: { name: 'Old Name', defaultTimezone: 'UTC' },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Church Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });

    const res = await request(app.getHttpServer())
      .patch(`/churches/${church.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'New Name' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: church.id,
      name: 'New Name',
      defaultTimezone: 'UTC',
    });
  });

  it('denies non-accredited volunteer', async () => {
    const church = await prisma.church.create({
      data: { name: 'Locked', defaultTimezone: 'UTC' },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Outsider' },
    });

    await request(app.getHttpServer())
      .patch(`/churches/${church.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Hijack' })
      .expect(403);
  });
});
