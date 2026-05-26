import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('POST /events private create + assign (e2e)', () => {
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
    await prisma.event.deleteMany();
    await prisma.ministryMembership.deleteMany();
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('leader creates private event and assigns on roster', async () => {
    const church = await prisma.church.create({
      data: { name: 'Private Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader' },
    });
    const member = await prisma.volunteer.create({
      data: { displayName: 'Member' },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });
    await prisma.ministryMembership.create({
      data: { volunteerId: member.id, ministryId: ministry.id, status: 'ACTIVE' },
    });
    const role = await prisma.ministryRole.create({
      data: { ministryId: ministry.id, name: 'Keys', retired: false },
    });

    const created = await request(app.getHttpServer())
      .post('/events')
      .set('X-Volunteer-Id', leader.id)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        kind: 'PRIVATE',
        ministryId: ministry.id,
        title: 'Rehearsal',
        startsAtUtc: '2026-08-01T18:00:00.000Z',
        endsAtUtc: '2026-08-01T20:00:00.000Z',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/events/${created.body.id}/assignments`)
      .set('X-Leader-Ministry-Id', ministry.id)
      .send({
        volunteerId: member.id,
        ministryId: ministry.id,
        roleId: role.id,
        startsAtUtc: '2026-08-01T18:30:00.000Z',
        endsAtUtc: '2026-08-01T19:30:00.000Z',
      })
      .expect(201);
  });
});
