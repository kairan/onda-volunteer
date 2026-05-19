export class SupabaseJwtVerifier {
  async verifyBearerToken(authHeader: string) {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    ) as { sub: string };
    return { sub: payload.sub };
  }
}
