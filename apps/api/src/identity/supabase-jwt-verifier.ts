import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export type VerifiedAccessToken = {
  sub: string;
};

@Injectable()
export class SupabaseJwtVerifier {
  verifyBearerToken(authorizationHeader: string | undefined): VerifiedAccessToken {
    // Require a Bearer token in the Authorization header
    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Missing or invalid Authorization header (expected Bearer token).',
      });
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Missing Bearer token.',
      });
    }

    // Symmetric verification (HS256), same secret Supabase uses for user access tokens in this setup
    const secret = process.env.SUPABASE_JWT_SECRET?.trim();
    if (!secret) {
      throw new UnauthorizedException({
        code: 'AUTH_MISCONFIGURED',
        message: 'SUPABASE_JWT_SECRET is not configured.',
      });
    }

    try {
      const payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      });
      if (typeof payload === 'string' || !payload.sub) {
        throw new Error('missing sub');
      }
      return { sub: payload.sub };
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID',
        message: 'Access token is invalid or expired.',
      });
    }
  }
}
