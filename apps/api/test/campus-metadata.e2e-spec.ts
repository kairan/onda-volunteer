import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Campus metadata self-service (e2e)', () => {
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

  it('lets an accredited Admin rename the campus and change timezone', async () => {
    const church = await prisma.church.create({
      data: { name: 'Multi Campus Church', defaultTimezone: 'UTC' },
    });
    const campus = await prisma.campus.create({
      data: {
        churchId: church.id,
        name: 'Original Campus',
        timezone: 'America/New_York',
      },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Campus Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { churchId: church.id, volunteerId: admin.id },
    });

    const updated = await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({
        name: 'Renamed Campus',
        timezone: 'America/Sao_Paulo',
      })
      .expect(200);

    expect(updated.body).toEqual({
      id: campus.id,
      churchId: church.id,
      name: 'Renamed Campus',
      timezone: 'America/Sao_Paulo',
    });

    const context = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    expect(context.body.churches[0].campuses).toContainEqual({
      id: campus.id,
      name: 'Renamed Campus',
      timezone: 'America/Sao_Paulo',
    });
  });

  it('preserves UTC scheduling records when campus timezone changes', async () => {
    const church = await prisma.church.create({
      data: { name: 'TZ Church', defaultTimezone: 'UTC' },
    });
    const campus = await prisma.campus.create({
      data: {
        churchId: church.id,
        name: 'Main Campus',
        timezone: 'America/New_York',
      },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'TZ Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { churchId: church.id, volunteerId: admin.id },
    });

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', admin.id)
      .send({
        kind: 'PUBLIC',
        churchId: church.id,
        title: 'Sunday Service',
        startsAtUtc: '2026-07-01T14:00:00.000Z',
        endsAtUtc: '2026-07-01T16:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ timezone: 'America/Los_Angeles' })
      .expect(200);

    const event = await prisma.event.findUniqueOrThrow({
      where: { id: created.body.id },
    });
    expect(event.startsAtUtc.toISOString()).toBe('2026-07-01T14:00:00.000Z');
    expect(event.endsAtUtc.toISOString()).toBe('2026-07-01T16:00:00.000Z');
  });

  it('rejects non-admin volunteers and invalid metadata', async () => {
    const church = await prisma.church.create({
      data: { name: 'Guarded Church', defaultTimezone: 'UTC' },
    });
    const campus = await prisma.campus.create({
      data: {
        churchId: church.id,
        name: 'Guarded Campus',
        timezone: 'UTC',
      },
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

    await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Hijacked' })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });

    await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: '  ' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('CAMPUS_NAME_REQUIRED');
      });

    await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ timezone: 'Not/A/Zone' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('INVALID_TIMEZONE');
      });

    await request(app.getHttpServer())
      .patch(`/campuses/${campus.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({})
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('CAMPUS_METADATA_EMPTY');
      });

    await request(app.getHttpServer())
      .patch('/campuses/missing-campus-id')
      .set('X-Volunteer-Id', volunteer.id)
      .send({ name: 'Ghost' })
      .expect(403)
      .expect(({ body }) => {
        expect(body.code).toBe('ADMIN_NOT_ACCREDITED');
      });

    await request(app.getHttpServer())
      .patch('/campuses/missing-campus-id')
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'Ghost' })
      .expect(404)
      .expect(({ body }) => {
        expect(body.code).toBe('CAMPUS_NOT_FOUND');
      });
  });
});
