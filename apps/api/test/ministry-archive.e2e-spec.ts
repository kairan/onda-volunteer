import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

describe('Ministry archive (e2e)', () => {
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
    })
      .overrideProvider(CLOCK)
      .useValue({ now: () => FIXED_NOW })
      .compile();

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
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('archives ministry, voids future assignments, blocks writes, allows cleanup', async () => {
    const church = await prisma.church.create({
      data: { name: 'Archive Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Pat Admin' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Lee Leader' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Val Member' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: member.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door', retired: false },
    });
    const futureEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Sunday',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const pastEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Past',
        startsAtUtc: new Date('2026-05-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-05-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const futureAssignment = await prisma.assignment.create({
      data: {
        eventId: futureEvent.id,
        ministryId: ministry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });
    const pastAssignment = await prisma.assignment.create({
      data: {
        eventId: pastEvent.id,
        ministryId: ministry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-05-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-05-01T15:30:00.000Z'),
      },
    });
    const unavailability = await prisma.unavailability.create({
      data: {
        volunteerId: member.id,
        ministryId: ministry.id,
        startsAtUtc: new Date('2026-06-10T10:00:00.000Z'),
        endsAtUtc: new Date('2026-06-10T12:00:00.000Z'),
      },
    });

    const archived = await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/archive`)
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    expect(archived.body).toMatchObject({
      id: ministry.id,
      churchId: church.id,
      name: 'Greeters',
      archivedAt: FIXED_NOW.toISOString(),
    });

    const voidedFuture = await prisma.assignment.findUnique({
      where: { id: futureAssignment.id },
    });
    expect(voidedFuture?.voidedAtUtc?.toISOString()).toBe(
      FIXED_NOW.toISOString(),
    );
    const untouchedPast = await prisma.assignment.findUnique({
      where: { id: pastAssignment.id },
    });
    expect(untouchedPast?.voidedAtUtc).toBeNull();

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/archive`)
      .set('X-Volunteer-Id', admin.id)
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ALREADY_ARCHIVED');
      });

    const context = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', admin.id)
      .expect(200);
    const contextMinistry = context.body.churches[0].ministries.find(
      (m: { id: string }) => m.id === ministry.id,
    );
    expect(contextMinistry.archivedAt).toBe(FIXED_NOW.toISOString());

    await request(app.getHttpServer())
      .post('/events')
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: ministry.id,
        title: 'Blocked',
        startsAtUtc: '2026-07-01T14:00:00.000Z',
        endsAtUtc: '2026-07-01T16:00:00.000Z',
      })
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      });

    await request(app.getHttpServer())
      .post(`/events/${futureEvent.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        ministryId: ministry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/memberships`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ volunteerId: leader.id, status: 'ACTIVE' })
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ name: 'New Role' })
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      });

    await request(app.getHttpServer())
      .post(`/volunteers/${member.id}/unavailability`)
      .set('X-Volunteer-Id', member.id)
      .send({
        ministryId: ministry.id,
        startsAtUtc: '2026-08-01T10:00:00.000Z',
        endsAtUtc: '2026-08-01T12:00:00.000Z',
      })
      .expect(400)
      .then((res) => {
        expect(res.body.code).toBe('MINISTRY_ARCHIVED');
      });

    await request(app.getHttpServer())
      .patch(`/unavailability/${unavailability.id}`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        startsAtUtc: '2026-06-10T11:00:00.000Z',
        endsAtUtc: '2026-06-10T13:00:00.000Z',
      })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/unavailability/${unavailability.id}`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/ministries/${ministry.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ name: 'Welcome Team' })
      .expect(200)
      .then((res) => {
        expect(res.body.name).toBe('Welcome Team');
      });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/archive`)
      .set('X-Volunteer-Id', leader.id)
      .expect(403)
      .then((res) => {
        expect(res.body.code).toBe('ADMIN_NOT_ACCREDITED');
      });
  });
});
