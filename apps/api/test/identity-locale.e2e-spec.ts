import 'reflect-metadata';
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
import { PrismaService } from '../src/prisma/prisma.service';
import { signTestAccessToken } from './support/sign-test-access-token';
import { SupabaseJwtVerifier } from '../src/identity/supabase-jwt-verifier';

describe('Identity Locale (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = 'test-supabase-jwt-secret-at-least-32-chars';
    process.env.AUTH_ALLOW_DEV_HEADERS = 'false';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseJwtVerifier)
      .useValue({
        verifyBearerToken: async (token: string) => {
          if (token.includes('invalid')) throw new Error('Invalid token');
          // Extract sub from token (simplified for test)
          // In real tests, signTestAccessToken encodes the sub
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          return { sub: payload.sub };
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.volunteer.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns uiLocale in /identity/me', async () => {
    const authSubjectId = '11111111-1111-1111-1111-111111111111';
    await prisma.volunteer.create({
      data: {
        displayName: 'Test Volunteer',
        authSubjectId,
        uiLocale: 'en',
      },
    });
    const token = signTestAccessToken(authSubjectId);

    const res = await request(app.getHttpServer())
      .get('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.volunteer.uiLocale).toBe('en');
  });

  it('updates uiLocale via PATCH /identity/me', async () => {
    const authSubjectId = '22222222-2222-2222-2222-222222222222';
    const volunteer = await prisma.volunteer.create({
      data: {
        displayName: 'Test Volunteer',
        authSubjectId,
      },
    });
    const token = signTestAccessToken(authSubjectId);

    await request(app.getHttpServer())
      .patch('/identity/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ uiLocale: 'pt-BR' })
      .expect(200);

    const updated = await prisma.volunteer.findUnique({
      where: { id: volunteer.id },
    });
    expect(updated?.uiLocale).toBe('pt-BR');
  });
});
