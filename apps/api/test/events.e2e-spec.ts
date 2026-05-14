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
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds 404 when no event exists for the id', async () => {
    await request(app.getHttpServer())
      .get('/events/does-not-exist-evt')
      .expect(404);
  });

  it('returns event detail with UTC window and church-default timezone framing for a public event', async () => {
    const church = await prisma.church.create({
      data: {
        name: 'Test Church',
        defaultTimezone: 'America/New_York',
      },
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
      },
      ministry: null,
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
      .expect(200);

    expect(res.body.ministry).toEqual({
      id: ministry.id,
      name: 'Band',
    });
    expect(res.body.event.kind).toBe('PRIVATE');
    expect(res.body.event.framing.churchDefaultTimezone).toBe(
      'America/Los_Angeles',
    );
  });
});
