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

  it('lists events across churches for system admin without churchId', async () => {
    await seedSystemAdmin();

    const churchA = await prisma.church.create({
      data: { name: 'Alpha Church', defaultTimezone: 'UTC' },
    });
    const churchB = await prisma.church.create({
      data: { name: 'Beta Church', defaultTimezone: 'UTC' },
    });
    const ministryB = await prisma.ministry.create({
      data: { name: 'Kids', churchId: churchB.id },
    });

    const publicA = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Alpha Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchA.id,
      },
    });
    const privateB = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Kids Prep',
        startsAtUtc: new Date('2026-06-02T18:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T20:00:00.000Z'),
        churchId: churchB.id,
        ministryId: ministryB.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get('/events')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: publicA.id,
          title: 'Alpha Service',
          church: { id: churchA.id, name: 'Alpha Church' },
        }),
        expect.objectContaining({
          id: privateB.id,
          title: 'Kids Prep',
          church: { id: churchB.id, name: 'Beta Church' },
        }),
      ]),
    );
  });

  it('filters events by churchId for system admin', async () => {
    await seedSystemAdmin();

    const churchA = await prisma.church.create({
      data: { name: 'Alpha Church', defaultTimezone: 'UTC' },
    });
    const churchB = await prisma.church.create({
      data: { name: 'Beta Church', defaultTimezone: 'UTC' },
    });

    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Alpha Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchA.id,
      },
    });
    await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Beta Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: churchB.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get('/events')
      .query({ churchId: churchA.id })
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Alpha Service');
    expect(res.body[0].church).toBeUndefined();
  });

  it('returns event detail for system admin on private events in any church', async () => {
    await seedSystemAdmin();

    const church = await prisma.church.create({
      data: { name: 'Support Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Band Rehearsal',
        startsAtUtc: new Date('2026-06-02T18:00:00.000Z'),
        endsAtUtc: new Date('2026-06-02T20:00:00.000Z'),
        churchId: church.id,
        ministryId: ministry.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(200);

    expect(res.body.event.title).toBe('Band Rehearsal');
    expect(res.body.church.name).toBe('Support Church');
  });

  it('rejects assignment creation for system admin with SYSTEM_ADMIN_READ_ONLY', async () => {
    await seedSystemAdmin();

    const church = await prisma.church.create({
      data: { name: 'Schedule Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Main Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Alex Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Door holder', retired: false },
    });

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-06-01T14:30:00.000Z',
        endsAtUtc: '2026-06-01T15:30:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('SYSTEM_ADMIN_READ_ONLY');
  });

  it('rejects public event creation for system admin', async () => {
    await seedSystemAdmin();

    const church = await prisma.church.create({
      data: { name: 'New Church', defaultTimezone: 'UTC' },
    });

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .send({
        kind: 'PUBLIC',
        churchId: church.id,
        title: 'Sunday Service',
        startsAtUtc: '2026-06-01T14:00:00.000Z',
        endsAtUtc: '2026-06-01T16:00:00.000Z',
      })
      .expect(403);

    expect(res.body.code).toBe('SYSTEM_ADMIN_READ_ONLY');
  });

  it('rejects event cancel for system admin', async () => {
    await seedSystemAdmin();

    const church = await prisma.church.create({
      data: { name: 'Cancel Church', defaultTimezone: 'UTC' },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Main Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/cancel`)
      .set('X-Volunteer-Id', 'seed-volunteer-system-admin')
      .expect(403);

    expect(res.body.code).toBe('SYSTEM_ADMIN_READ_ONLY');
  });
});
