import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export type VerifiedAccessToken = {
  sub: string;
};

const client = jwksClient({
  jwksUri: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

// Solução do Erro 1 & 2: Tipamos explicitamente como jwt.GetPublicKeyOrSecret e validamos o header
const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
  if (!header || !header.kid) {
    return callback(new Error('Token inválido: cabeçalho ou kid em falta.'));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      return callback(err || new Error('Chave JWK não encontrada ou inválida.'));
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

@Injectable()
export class SupabaseJwtVerifier {
  async verifyBearerToken(authorizationHeader: string | undefined): Promise<VerifiedAccessToken> {
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

    return new Promise((resolve, reject) => {
      // Usamos o "as any" ou o overload correto para o jwt.verify aceitar o callback sem chiar dos tipos
      jwt.verify(token, getKey, { algorithms: ['ES256'] }, (err, payload) => {
        if (err || !payload || typeof payload === 'string' || !payload.sub) {
          return reject(
            new UnauthorizedException({
              code: 'AUTH_INVALID',
              message: 'Access token is invalid or expired.',
            })
          );
        }
        resolve({ sub: payload.sub });
      });
    });
  }
}