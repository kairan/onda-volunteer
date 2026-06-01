import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';

export async function assertSchedulingWriteAllowed(
  auth: AuthenticatedRequestContext,
): Promise<void> {
  if (await auth.isSystemAdmin()) {
    throw new ForbiddenException({
      code: 'SYSTEM_ADMIN_READ_ONLY',
      message: 'System Admin accounts have read-only access to scheduling.',
    });
  }
}
