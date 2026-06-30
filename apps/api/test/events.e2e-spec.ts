import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GET /events/:id (e2e)', () => {
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
    await prisma.eventRoleCapacity.deleteMany();
    await prisma.unavailability.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds 401 when fetching event detail without authentication', async () => {
    const church = await prisma.church.create({
      data: { name: 'Auth Church', defaultTimezone: 'UTC' },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Service',
        startsAtUtc: new Date('2026-03-01T18:00:00.000Z'),
        endsAtUtc: new Date('2026-03-01T19:30:00.000Z'),
        churchId: church.id,
      },
    });

    await request(app.getHttpServer()).get(`/events/${event.id}`).expect(401);
  });

  it('responds 404 when no event exists for the id', async () => {
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Lookup Volunteer' },
    });

    await request(app.getHttpServer())
      .get('/events/does-not-exist-evt')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(404);
  });

  it('returns event detail with UTC window and church-default timezone framing for a public event', async () => {
    const church = await prisma.church.create({
      data: {
        name: 'Test Church',
        defaultTimezone: 'America/New_York',
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Public Viewer' },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Community Meal',
        startsAtUtc: new Date('2026-03-01T18:00:00.000Z'),
        endsAtUtc: new Date('2026-03-01T19:30:00.000Z'),
        churchId: church.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(res.body).toEqual({
      church: {
        id: church.id,
        name: 'Test Church',
        defaultTimezone: 'America/New_York',
      },
      event: {
        id: event.id,
        kind: 'PUBLIC',
        title: 'Community Meal',
        window: {
          startsAtUtc: '2026-03-01T18:00:00.000Z',
          endsAtUtc: '2026-03-01T19:30:00.000Z',
        },
        framing: {
          churchDefaultTimezone: 'America/New_York',
          startsDisplayInChurchTz: '2026-03-01T13:00:00-05:00',
          endsDisplayInChurchTz: '2026-03-01T14:30:00-05:00',
        },
        cancelledAtUtc: null,
      },
      ministry: null,
      assignments: [],
      roleCapacities: [],
    });
  });

  it('includes owning ministry on the payload for a private event', async () => {
    const church = await prisma.church.create({
      data: {
        name: 'West Campus',
        defaultTimezone: 'America/Los_Angeles',
      },
    });
    const ministry = await prisma.ministry.create({
      data: {
        name: 'Band',
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Band Member' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Rehearsal',
        startsAtUtc: new Date('2026-04-10T02:00:00.000Z'),
        endsAtUtc: new Date('2026-04-10T03:30:00.000Z'),
        churchId: church.id,
        ministryId: ministry.id,
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(res.body.ministry).toEqual({
      id: ministry.id,
      name: 'Band',
    });
    expect(res.body.assignments).toEqual([]);
    expect(res.body.event.kind).toBe('PRIVATE');
    expect(res.body.event.framing.churchDefaultTimezone).toBe(
      'America/Los_Angeles',
    );
  });

  it('responds 404 for a private event when the volunteer lacks ministry access', async () => {
    const church = await prisma.church.create({
      data: { name: 'Private Church', defaultTimezone: 'UTC' },
    });
    const band = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const outsider = await prisma.volunteer.create({
      data: { displayName: 'Outsider' },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Closed Rehearsal',
        startsAtUtc: new Date('2026-05-01T18:00:00.000Z'),
        endsAtUtc: new Date('2026-05-01T20:00:00.000Z'),
        churchId: church.id,
        ministryId: band.id,
      },
    });

    await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', outsider.id)
      .expect(404);
  });
});

describe('POST /events/:id/assignments (e2e)', () => {
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
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an assignment on a public event and returns it on the event read model', async () => {
    const church = await prisma.church.create({
      data: {
        name: 'Schedule Church',
        defaultTimezone: 'UTC',
      },
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

    const assignStart = '2026-06-01T14:30:00.000Z';
    const assignEnd = '2026-06-01T15:30:00.000Z';

    const post = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: assignStart,
        endsAtUtc: assignEnd,
      })
      .expect(201);

    expect(post.body).toMatchObject({
      volunteerId: volunteer.id,
      ministryId: ministry.id,
      roleId: role.id,
      window: { startsAtUtc: assignStart, endsAtUtc: assignEnd },
    });
    expect(post.body.id).toEqual(expect.any(String));

    const detail = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(detail.body.assignments).toHaveLength(1);
    expect(detail.body.assignments[0]).toMatchObject({
      volunteer: { id: volunteer.id, displayName: 'Alex Volunteer' },
      ministry: { id: ministry.id, name: 'Greeters' },
      role: { id: role.id, name: 'Door holder' },
      window: { startsAtUtc: assignStart, endsAtUtc: assignEnd },
    });
  });

  it('rejects assignment when X-Leader-Ministry-Id does not match the assignment ministry', async () => {
    const church = await prisma.church.create({
      data: { name: 'C', defaultTimezone: 'UTC' },
    });
    const mA = await prisma.ministry.create({
      data: { name: 'A', churchId: church.id },
    });
    const mB = await prisma.ministry.create({
      data: { name: 'B', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Svc',
        startsAtUtc: new Date('2026-07-01T10:00:00.000Z'),
        endsAtUtc: new Date('2026-07-01T12:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: mA.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: mA.id, name: 'Host', retired: false },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', mB.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: mA.id,
        roleId: role.id,
        startsAtUtc: '2026-07-01T10:30:00.000Z',
        endsAtUtc: '2026-07-01T11:00:00.000Z',
      })
      .expect(403);
  });

  it('rejects assignment when volunteer has unavailability overlapping half-open window', async () => {
    const church = await prisma.church.create({
      data: { name: 'Avail Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Kids', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'VBS',
        startsAtUtc: new Date('2026-08-01T13:00:00.000Z'),
        endsAtUtc: new Date('2026-08-01T18:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Jordan' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Helper', retired: false },
    });
    await prisma.unavailability.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        startsAtUtc: new Date('2026-08-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-08-01T15:00:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-08-01T14:30:00.000Z',
        endsAtUtc: '2026-08-01T15:30:00.000Z',
      })
      .expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      code: 'UNAVAILABILITY_BLOCKS_ASSIGN',
      message: expect.stringContaining('unavailable'),
    });
  });

  it('rejects assignment when volunteer already has overlapping assignment in another ministry (UTC half-open)', async () => {
    const church = await prisma.church.create({
      data: { name: 'Multi Ministry Church', defaultTimezone: 'UTC' },
    });
    const mGreeters = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const mBand = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Joint Service',
        startsAtUtc: new Date('2026-10-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-10-01T18:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Chris DoubleBook' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: mGreeters.id,
        status: 'ACTIVE',
      },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: mBand.id,
        status: 'ACTIVE',
      },
    });
    const roleGreeter = await prisma.ministryRole.create({
      data: { ministryId: mGreeters.id, name: 'Door', retired: false },
    });
    const roleBand = await prisma.ministryRole.create({
      data: { ministryId: mBand.id, name: 'Keys', retired: false },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', mBand.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: mBand.id,
        roleId: roleBand.id,
        startsAtUtc: '2026-10-01T15:00:00.000Z',
        endsAtUtc: '2026-10-01T16:00:00.000Z',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', mGreeters.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: mGreeters.id,
        roleId: roleGreeter.id,
        startsAtUtc: '2026-10-01T15:30:00.000Z',
        endsAtUtc: '2026-10-01T16:30:00.000Z',
      })
      .expect(409);

    expect(res.body).toMatchObject({
      statusCode: 409,
      code: 'CROSS_MINISTRY_DOUBLE_BOOKING',
      message: expect.stringMatching(/overlap|roster|ministry/i),
    });
  });

  it('allows cross-ministry assignment when other ministry window ends exactly when new one starts (half-open)', async () => {
    const church = await prisma.church.create({
      data: { name: 'Boundary Multi', defaultTimezone: 'UTC' },
    });
    const mA = await prisma.ministry.create({
      data: { name: 'A', churchId: church.id },
    });
    const mB = await prisma.ministry.create({
      data: { name: 'B', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'All-day',
        startsAtUtc: new Date('2026-11-01T12:00:00.000Z'),
        endsAtUtc: new Date('2026-11-01T20:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Taylor' },
    });
    for (const mid of [mA.id, mB.id]) {
      await prisma.ministryMembership.create({
        data: {
          volunteerId: volunteer.id,
          ministryId: mid,
          status: 'ACTIVE',
        },
      });
    }
    const roleA = await prisma.ministryRole.create({
      data: { ministryId: mA.id, name: 'R-A', retired: false },
    });
    const roleB = await prisma.ministryRole.create({
      data: { ministryId: mB.id, name: 'R-B', retired: false },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', mA.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: mA.id,
        roleId: roleA.id,
        startsAtUtc: '2026-11-01T14:00:00.000Z',
        endsAtUtc: '2026-11-01T15:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', mB.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: mB.id,
        roleId: roleB.id,
        startsAtUtc: '2026-11-01T15:00:00.000Z',
        endsAtUtc: '2026-11-01T16:00:00.000Z',
      })
      .expect(201);
  });

  it('allows assignment starting when unavailability ends (half-open boundary)', async () => {
    const church = await prisma.church.create({
      data: { name: 'Boundary Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'AV', churchId: church.id },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'All day',
        startsAtUtc: new Date('2026-09-01T12:00:00.000Z'),
        endsAtUtc: new Date('2026-09-01T20:00:00.000Z'),
        churchId: church.id,
      },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Riley' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Runner', retired: false },
    });
    await prisma.unavailability.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        startsAtUtc: new Date('2026-09-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-09-01T15:00:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-09-01T15:00:00.000Z',
        endsAtUtc: '2026-09-01T16:00:00.000Z',
      })
      .expect(201);
  });
});
