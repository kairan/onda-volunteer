import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Ministry role catalog (e2e)', () => {
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
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds, renames, and retires roles; preserves historical assignments; rejects assign with retired role', async () => {
    const church = await prisma.church.create({
      data: { name: 'Role Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });

    const created = await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ name: 'Guitar' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/ministries/${ministry.id}/roles/${created.body.id}`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ name: 'Lead Guitar' })
      .expect(200);

    const member = await prisma.volunteer.create({
      data: { displayName: 'Player' },
    });
    await prisma.ministryMembership.create({
      data: { volunteerId: member.id, ministryId: ministry.id, status: 'ACTIVE' },
    });
    const event = await prisma.event.create({
      data: {
        kind: 'PUBLIC',
        title: 'Gig',
        startsAtUtc: new Date('2026-09-01T18:00:00.000Z'),
        endsAtUtc: new Date('2026-09-01T20:00:00.000Z'),
        churchId: church.id,
      },
    });

    const assignStart = '2026-09-01T18:30:00.000Z';
    const assignEnd = '2026-09-01T19:30:00.000Z';

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: member.id,
        ministryId: ministry.id,
        roleId: created.body.id,
        startsAtUtc: assignStart,
        endsAtUtc: assignEnd,
      })
      .expect(201);

    const beforeRetire = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', member.id)
      .expect(200);

    expect(beforeRetire.body.assignments).toHaveLength(1);
    expect(beforeRetire.body.assignments[0]).toMatchObject({
      role: { id: created.body.id, name: 'Lead Guitar' },
      window: { startsAtUtc: assignStart, endsAtUtc: assignEnd },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles/${created.body.id}/retire`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .expect(200);

    const afterRetire = await request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .set('X-Volunteer-Id', member.id)
      .expect(200);

    expect(afterRetire.body.assignments).toHaveLength(1);
    expect(afterRetire.body.assignments[0]).toMatchObject({
      role: { id: created.body.id, name: 'Lead Guitar' },
      window: { startsAtUtc: assignStart, endsAtUtc: assignEnd },
    });

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: member.id,
        ministryId: ministry.id,
        roleId: created.body.id,
        startsAtUtc: '2026-09-01T19:00:00.000Z',
        endsAtUtc: '2026-09-01T19:45:00.000Z',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('ROLE_RETIRED');
      });
  });

  it('rejects duplicate role names within a ministry', async () => {
    const church = await prisma.church.create({
      data: { name: 'Dup Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    await prisma.ministryLeader.create({
      data: {
        volunteerId: (
          await prisma.volunteer.create({ data: { displayName: 'Leader' } })
        ).id,
        ministryId: ministry.id,
      },
    });

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ name: 'Guitar' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({ name: 'Guitar' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('ROLE_NAME_CONFLICT');
      });
  });
});
