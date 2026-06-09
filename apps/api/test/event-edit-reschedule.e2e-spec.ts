import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';

const FIXED_NOW = new Date('2026-06-10T12:00:00.000Z');

describe('PATCH /events/:id (e2e)', () => {
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
    await prisma.event.deleteMany();
    await prisma.adminAccreditation.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedEditFixture() {
    const church = await prisma.church.create({
      data: { name: 'Edit Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Worship', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member' },
    });
    const outsider = await prisma.volunteer.create({
      data: { displayName: 'Outsider' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Guitar', retired: false },
    });
    const publicEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Sunday Service',
        startsAtUtc: new Date('2026-06-15T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-15T17:00:00.000Z'),
        churchId: church.id,
      },
    });
    const privateEvent = await prisma.event.create({
      data: {
        kind: 'PRIVATE',
        title: 'Rehearsal',
        startsAtUtc: new Date('2026-06-15T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-15T17:00:00.000Z'),
        churchId: church.id,
        ministryId: ministry.id,
      },
    });
    const cancelledEvent = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Cancelled Service',
        startsAtUtc: new Date('2026-06-15T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-15T17:00:00.000Z'),
        churchId: church.id,
        cancelledAtUtc: new Date('2026-06-10T10:00:00.000Z'),
      },
    });

    const insideAssignment = await prisma.assignment.create({
      data: {
        eventId: publicEvent.id,
        ministryId: ministry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-15T15:00:00.000Z'),
        endsAtUtc: new Date('2026-06-15T16:00:00.000Z'),
      },
    });
    const outsideAssignment = await prisma.assignment.create({
      data: {
        eventId: publicEvent.id,
        ministryId: ministry.id,
        volunteerId: leader.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-15T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-15T15:00:00.000Z'),
      },
    });

    return {
      church,
      ministry,
      admin,
      leader,
      member,
      outsider,
      role,
      publicEvent,
      privateEvent,
      cancelledEvent,
      insideAssignment,
      outsideAssignment,
    };
  }

  it('admin edits title — 200 with voidedAssignmentCount: 0', async () => {
    const { admin, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ title: 'Updated Service' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: publicEvent.id,
      title: 'Updated Service',
      voidedAssignmentCount: 0,
    });

    const updated = await prisma.event.findUnique({ where: { id: publicEvent.id } });
    expect(updated?.title).toBe('Updated Service');
  });

  it('leader edits own private event title — 200', async () => {
    const { leader, privateEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${privateEvent.id}`)
      .set('X-Volunteer-Id', leader.id)
      .send({ title: 'Updated Rehearsal' })
      .expect(200);

    expect(res.body).toMatchObject({
      title: 'Updated Rehearsal',
      voidedAssignmentCount: 0,
    });
  });

  it('leader cannot edit public event — 403', async () => {
    const { leader, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', leader.id)
      .send({ title: 'Nope' })
      .expect(403);

    expect(res.body).toMatchObject({
      code: 'LEADER_CANNOT_EDIT_PUBLIC_EVENT',
    });
  });

  it('reschedule narrows window — orphaned assignment voided, voidedAssignmentCount: 1', async () => {
    const { admin, publicEvent, insideAssignment, outsideAssignment } =
      await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({
        startsAtUtc: '2026-06-15T14:30:00.000Z',
        endsAtUtc: '2026-06-15T17:00:00.000Z',
      })
      .expect(200);

    expect(res.body.voidedAssignmentCount).toBe(1);

    const voided = await prisma.assignment.findUnique({
      where: { id: outsideAssignment.id },
    });
    expect(voided?.voidedAtUtc).toEqual(FIXED_NOW);

    const kept = await prisma.assignment.findUnique({
      where: { id: insideAssignment.id },
    });
    expect(kept?.voidedAtUtc).toBeNull();
  });

  it('reschedule with all assignments in window — voidedAssignmentCount: 0', async () => {
    const { admin, publicEvent, insideAssignment, outsideAssignment } =
      await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({
        startsAtUtc: '2026-06-15T13:00:00.000Z',
        endsAtUtc: '2026-06-15T18:00:00.000Z',
      })
      .expect(200);

    expect(res.body.voidedAssignmentCount).toBe(0);

    const a1 = await prisma.assignment.findUnique({ where: { id: insideAssignment.id } });
    const a2 = await prisma.assignment.findUnique({ where: { id: outsideAssignment.id } });
    expect(a1?.voidedAtUtc).toBeNull();
    expect(a2?.voidedAtUtc).toBeNull();
  });

  it('cancelled event edit — 400 EVENT_ALREADY_CANCELLED', async () => {
    const { admin, cancelledEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${cancelledEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ title: 'Nope' })
      .expect(400);

    expect(res.body).toMatchObject({ code: 'EVENT_ALREADY_CANCELLED' });
  });

  it('empty body — 400 EVENT_EDIT_EMPTY', async () => {
    const { admin, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({})
      .expect(400);

    expect(res.body).toMatchObject({ code: 'EVENT_EDIT_EMPTY' });
  });

  it('startsAtUtc >= endsAtUtc — 400 INVALID_EVENT_WINDOW', async () => {
    const { admin, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({
        startsAtUtc: '2026-06-15T17:00:00.000Z',
        endsAtUtc: '2026-06-15T14:00:00.000Z',
      })
      .expect(400);

    expect(res.body).toMatchObject({ code: 'INVALID_EVENT_WINDOW' });
  });

  it('title too long — 400 EVENT_TITLE_TOO_LONG', async () => {
    const { admin, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ title: 'A'.repeat(201) })
      .expect(400);

    expect(res.body).toMatchObject({ code: 'EVENT_TITLE_TOO_LONG' });
  });

  it('empty title — 400 EVENT_TITLE_REQUIRED', async () => {
    const { admin, publicEvent } = await seedEditFixture();

    const res = await request(app.getHttpServer())
      .patch(`/events/${publicEvent.id}`)
      .set('X-Volunteer-Id', admin.id)
      .send({ title: '   ' })
      .expect(400);

    expect(res.body).toMatchObject({ code: 'EVENT_TITLE_REQUIRED' });
  });

  it('non-existent event — 404', async () => {
    const { admin } = await seedEditFixture();

    await request(app.getHttpServer())
      .patch('/events/non-existent-id')
      .set('X-Volunteer-Id', admin.id)
      .send({ title: 'Nope' })
      .expect(404);
  });
});
