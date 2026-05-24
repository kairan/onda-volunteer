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

  it('bulk mirror creates one unavailability per ministry for the same UTC window', async () => {
    const church = await prisma.church.create({
      data: { name: 'Bulk Mirror Church', defaultTimezone: 'UTC' },
    });
    const greeters = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const band = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Multi Ministry Volunteer' },
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: volunteer.id,
          ministryId: greeters.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: volunteer.id,
          ministryId: band.id,
          status: 'PENDING',
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability/bulk`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({
        ministryIds: [greeters.id, band.id],
        startsAtUtc: '2026-06-10T09:00:00.000Z',
        endsAtUtc: '2026-06-10T17:00:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      createdCount: 2,
      created: expect.arrayContaining([
        expect.objectContaining({ ministryId: greeters.id }),
        expect.objectContaining({ ministryId: band.id }),
      ]),
      failed: [],
    });

    const rows = await prisma.unavailability.findMany({
      where: { volunteerId: volunteer.id },
      orderBy: { ministryId: 'asc' },
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.ministryId).sort()).toEqual(
      [greeters.id, band.id].sort(),
    );
    for (const row of rows) {
      expect(row.startsAtUtc.toISOString()).toBe('2026-06-10T09:00:00.000Z');
      expect(row.endsAtUtc.toISOString()).toBe('2026-06-10T17:00:00.000Z');
    }
  });

  it('bulk mirror reports ineligible ministries without rolling back successful rows', async () => {
    const church = await prisma.church.create({
      data: { name: 'Partial Bulk Church', defaultTimezone: 'UTC' },
    });
    const eligible = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const ineligible = await prisma.ministry.create({
      data: { name: 'Outsiders', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Partial Bulk Volunteer' },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: volunteer.id,
        ministryId: eligible.id,
        status: 'ACTIVE',
      },
    });

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability/bulk`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({
        ministryIds: [eligible.id, ineligible.id],
        startsAtUtc: '2026-06-11T09:00:00.000Z',
        endsAtUtc: '2026-06-11T17:00:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      createdCount: 1,
      created: [expect.objectContaining({ ministryId: eligible.id })],
      failed: [
        expect.objectContaining({
          ministryId: ineligible.id,
          code: 'MEMBERSHIP_REQUIRED',
        }),
      ],
    });

    const rows = await prisma.unavailability.findMany({
      where: { volunteerId: volunteer.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].ministryId).toBe(eligible.id);
  });

  it('bulk mirror returns 200 when every ministry is ineligible', async () => {
    const church = await prisma.church.create({
      data: { name: 'All Failed Bulk Church', defaultTimezone: 'UTC' },
    });
    const ineligibleA = await prisma.ministry.create({
      data: { name: 'Outsiders A', churchId: church.id },
    });
    const ineligibleB = await prisma.ministry.create({
      data: { name: 'Outsiders B', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'All Failed Bulk Volunteer' },
    });

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability/bulk`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({
        ministryIds: [ineligibleA.id, ineligibleB.id],
        startsAtUtc: '2026-06-12T09:00:00.000Z',
        endsAtUtc: '2026-06-12T17:00:00.000Z',
      })
      .expect(200);

    expect(res.body).toMatchObject({
      createdCount: 0,
      created: [],
      failed: expect.arrayContaining([
        expect.objectContaining({
          ministryId: ineligibleA.id,
          code: 'MEMBERSHIP_REQUIRED',
        }),
        expect.objectContaining({
          ministryId: ineligibleB.id,
          code: 'MEMBERSHIP_REQUIRED',
        }),
      ]),
    });

    const rows = await prisma.unavailability.findMany({
      where: { volunteerId: volunteer.id },
    });
    expect(rows).toHaveLength(0);
  });

  it('bulk mirror reports inactive membership without creating a row', async () => {
    const church = await prisma.church.create({
      data: { name: 'Inactive Bulk Church', defaultTimezone: 'UTC' },
    });
    const active = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const inactive = await prisma.ministry.create({
      data: { name: 'Alumni', churchId: church.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Inactive Bulk Volunteer' },
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: volunteer.id,
          ministryId: active.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: volunteer.id,
          ministryId: inactive.id,
          status: 'INACTIVE',
        },
      ],
    });

    const res = await request(app.getHttpServer())
      .post(`/volunteers/${volunteer.id}/unavailability/bulk`)
      .set('X-Volunteer-Id', volunteer.id)
      .send({
        ministryIds: [active.id, inactive.id],
        startsAtUtc: '2026-06-13T09:00:00.000Z',
        endsAtUtc: '2026-06-13T17:00:00.000Z',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      createdCount: 1,
      created: [expect.objectContaining({ ministryId: active.id })],
      failed: [
        expect.objectContaining({
          ministryId: inactive.id,
          code: 'MEMBERSHIP_NOT_ACTIVE',
        }),
      ],
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
