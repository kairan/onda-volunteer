import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';

const FIXED_NOW = new Date('2026-05-20T12:00:00.000Z');

describe('POST /events/:id/cancel (e2e)', () => {
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
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('cancels event and voids assignments', async () => {
    const church = await prisma.church.create({
      data: { name: 'Cancel Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Team', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Role', retired: false },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Service',
        startsAtUtc: new Date('2026-06-01T14:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T16:00:00.000Z'),
        churchId: church.id,
      },
    });
    const assignment = await prisma.assignment.create({
      data: {
        eventId: event.id,
        ministryId: ministry.id,
        volunteerId: member.id,
        roleId: role.id,
        startsAtUtc: new Date('2026-06-01T14:30:00.000Z'),
        endsAtUtc: new Date('2026-06-01T15:30:00.000Z'),
      },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/cancel`)
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    const updatedEvent = await prisma.event.findUnique({ where: { id: event.id } });
    const updatedAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
    });
    expect(updatedEvent?.cancelledAtUtc).toEqual(FIXED_NOW);
    expect(updatedAssignment?.voidedAtUtc).toEqual(FIXED_NOW);
  });
});
