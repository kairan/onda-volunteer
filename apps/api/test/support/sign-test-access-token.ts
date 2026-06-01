import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET ??
  'test-supabase-jwt-secret-at-least-32-chars';

export function signTestAccessToken(
  authSubjectId: string,
  options: { email?: string } = {},
): string {
  return jwt.sign(
    {
      role: 'authenticated',
      ...(options.email ? { email: options.email } : {}),
    },
    TEST_JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: authSubjectId,
      expiresIn: '2h',
    },
  );
}
