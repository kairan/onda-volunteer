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
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('adds, renames, and retires roles; rejects assign with retired role', async () => {
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

    await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles/${created.body.id}/retire`)
      .set('X-Leader-Ministry-Id', ministry.id)
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

    await request(app.getHttpServer())
      .post(`/events/${event.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: member.id,
        ministryId: ministry.id,
        roleId: created.body.id,
        startsAtUtc: '2026-09-01T18:30:00.000Z',
        endsAtUtc: '2026-09-01T19:30:00.000Z',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.code).toBe('ROLE_RETIRED');
      });
  });
});
