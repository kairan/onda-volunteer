import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

jest.mock('../src/identity/supabase-jwt-verifier', () => ({
  SupabaseJwtVerifier: jest.fn().mockImplementation(() => ({
    verifyBearerToken: jest.fn().mockImplementation(async (authHeader: string) => {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return { sub: payload.sub };
    }),
  })),
}));

import { AppModule } from '../src/app.module';
import { CLOCK } from '../src/common/clock';
import { PrismaService } from '../src/prisma/prisma.service';

const FIXED_NOW = new Date('2026-05-15T12:00:00.000Z');

describe('Volunteer unavailability (e2e)', () => {
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
    await prisma.volunteer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists future unavailability for the signed-in volunteer with ministry names', async () => {
    const church = await prisma.church.create({
      data: { name: 'Time Away Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Sam Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'ACTIVE',
      },
    });
    await prisma.unavailability.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        startsAtUtc: new Date('2026-06-01T10:00:00.000Z'),
        endsAtUtc: new Date('2026-06-01T12:00:00.000Z'),
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/volunteers/${volunteer.id}/unavailability`)
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      ministry: { id: ministry.id, name: 'Greeters' },
      startsAtUtc: '2026-06-01T10:00:00.000Z',
      endsAtUtc: '2026-06-01T12:00:00.000Z',
    });
  });

  it('allows creating unavailability when ministry membership is Pending', async () => {
    const church = await prisma.church.create({
      data: { name: 'Pending Church', defaultTimezone: 'UTC' },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pending Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: ministry.id,
        status: 'PENDING',
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({
        ministryId: ministry.id,
        startsAtUtc: '2026-06-02T14:00:00.000Z',
        endsAtUtc: '2026-06-02T16:00:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      ministryId: ministry.id,
      window: {
        startsAtUtc: '2026-06-02T14:00:00.000Z',
        endsAtUtc: '2026-06-02T16:00:00.000Z',
      },
    });
  });

  it('returns Pending membership status in organization context ministries', async () => {
    const church = await prisma.church.create({
      data: { name: 'Pending Context Church', defaultTimezone: 'UTC' },
    });
    const activeMinistry = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const pendingMinistry = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Pending Context Volunteer' },
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: volunteer.id,
          ministryId: activeMinistry.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: volunteer.id,
          ministryId: pendingMinistry.id,
          status: 'PENDING',
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    const ministries = res.body.churches[0].ministries.sort((a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name),
    );
    expect(ministries).toEqual([
      { id: pendingMinistry.id, name: 'Band', membershipStatus: 'PENDING' },
      { id: activeMinistry.id, name: 'Greeters', membershipStatus: 'ACTIVE' },
    ]);
  });
});
