import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

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
import { PrismaService } from '../src/prisma/prisma.service';
import { signTestAccessToken } from './support/sign-test-access-token';

describe('Role Catalog (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-at-least-32-chars';
    process.env.AUTH_ALLOW_DEV_HEADERS = 'false';

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
    await prisma.ministryRole.deleteMany();
    await prisma.ministryLeader.deleteMany();
    await prisma.ministry.deleteMany();
    await prisma.volunteer.deleteMany();
    await prisma.church.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows Leader to add, rename and retire roles', async () => {
    const authSubId = 'leader-auth-sub';
    const church = await prisma.church.create({
      data: { name: 'Church', defaultTimezone: 'UTC' },
    });
    const leader = await prisma.volunteer.create({
      data: { displayName: 'Leader', authSubjectId: authSubId },
    });
    const ministry = await prisma.ministry.create({
      data: { name: 'Music', churchId: church.id },
    });
    await prisma.ministryLeader.create({
      data: { volunteerId: leader.id, ministryId: ministry.id },
    });

    const token = signTestAccessToken(authSubId);

    // 1. Add
    const resAdd = await request(app.getHttpServer())
      .post(`/ministries/${ministry.id}/roles`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Singer' })
      .expect(201);

    const roleId = resAdd.body.id;

    // 2. Rename
    await request(app.getHttpServer())
      .patch(`/ministries/${ministry.id}/roles/${roleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lead Singer' })
      .expect(200);

    const renamed = await prisma.ministryRole.findUnique({ where: { id: roleId } });
    expect(renamed?.name).toBe('Lead Singer');

    // 3. Retire
    await request(app.getHttpServer())
      .patch(`/ministries/${ministry.id}/roles/${roleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ retired: true })
      .expect(200);

    const retired = await prisma.ministryRole.findUnique({ where: { id: roleId } });
    expect(retired?.retired).toBe(true);
  });
});
