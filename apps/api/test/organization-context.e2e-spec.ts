import 'reflect-metadata';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GET /organization/context (e2e)', () => {
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

  it('responds 401 when the caller is not authenticated', async () => {
    await request(app.getHttpServer())
      .get('/organization/context')
      .expect(401);
  });

  it('returns churches, campuses, and ministries in scope across multiple churches', async () => {
    const churchAlpha = await prisma.church.create({
      data: {
        name: 'Alpha Church',
        defaultTimezone: 'America/Sao_Paulo',
        campuses: {
          create: [
            { name: 'Sede', timezone: 'America/Sao_Paulo' },
            { name: 'Zona Sul', timezone: 'America/Sao_Paulo' },
          ],
        },
      },
      include: { campuses: true },
    });
    const churchBeta = await prisma.church.create({
      data: {
        name: 'Beta Church',
        defaultTimezone: 'America/Manaus',
        campuses: {
          create: [{ name: 'Único', timezone: 'America/Manaus' }],
        },
      },
      include: { campuses: true },
    });
    await prisma.church.create({
      data: { name: 'Out of scope', defaultTimezone: 'UTC' },
    });

    const ministryAlpha = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: churchAlpha.id },
    });
    const ministryBeta = await prisma.ministry.create({
      data: { name: 'Band', churchId: churchBeta.id },
    });
    const volunteer = await prisma.volunteer.create({
      data: { displayName: 'Multi Church Volunteer' },
    });
    await prisma.ministryMembership.createMany({
      data: [
        {
          volunteerId: volunteer.id,
          ministryId: ministryAlpha.id,
          status: 'ACTIVE',
        },
        {
          volunteerId: volunteer.id,
          ministryId: ministryBeta.id,
          status: 'ACTIVE',
        },
      ],
    });

    const [alphaCampusSede, alphaCampusSul] = churchAlpha.campuses.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const betaCampus = churchBeta.campuses[0];

    const res = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', volunteer.id)
      .expect(200);

    expect(res.body.churches).toHaveLength(2);
    expect(res.body).toEqual({
      churches: [
        {
          id: churchAlpha.id,
          name: 'Alpha Church',
          defaultTimezone: 'America/Sao_Paulo',
          campuses: [
            {
              id: alphaCampusSede.id,
              name: 'Sede',
              timezone: 'America/Sao_Paulo',
            },
            {
              id: alphaCampusSul.id,
              name: 'Zona Sul',
              timezone: 'America/Sao_Paulo',
            },
          ],
          ministries: [{ id: ministryAlpha.id, name: 'Greeters', membershipStatus: 'ACTIVE' }],
        },
        {
          id: churchBeta.id,
          name: 'Beta Church',
          defaultTimezone: 'America/Manaus',
          campuses: [
            {
              id: betaCampus.id,
              name: 'Único',
              timezone: 'America/Manaus',
            },
          ],
          ministries: [{ id: ministryBeta.id, name: 'Band', membershipStatus: 'ACTIVE' }],
        },
      ],
    });
  });

  it('marks church admin accreditation on ministries without hiding member ministries', async () => {
    const church = await prisma.church.create({
      data: { name: 'Admin Member Church', defaultTimezone: 'UTC' },
    });
    const greeters = await prisma.ministry.create({
      data: { name: 'Greeters', churchId: church.id },
    });
    const band = await prisma.ministry.create({
      data: { name: 'Band', churchId: church.id },
    });
    const admin = await prisma.volunteer.create({
      data: { displayName: 'Admin Member' },
    });
    await prisma.adminAccreditation.create({
      data: { volunteerId: admin.id, churchId: church.id },
    });
    await prisma.ministryMembership.create({
      data: {
        volunteerId: admin.id,
        ministryId: greeters.id,
        status: 'ACTIVE',
      },
    });

    const res = await request(app.getHttpServer())
      .get('/organization/context')
      .set('X-Volunteer-Id', admin.id)
      .expect(200);

    expect(res.body.churches).toEqual([
      {
        id: church.id,
        name: 'Admin Member Church',
        defaultTimezone: 'UTC',
        campuses: [],
        ministries: [
          {
            id: band.id,
            name: 'Band',
            isChurchAdmin: true,
          },
          {
            id: greeters.id,
            name: 'Greeters',
            membershipStatus: 'ACTIVE',
            isChurchAdmin: true,
          },
        ],
      },
    ]);
  });
});
