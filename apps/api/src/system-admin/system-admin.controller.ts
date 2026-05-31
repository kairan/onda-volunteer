import { Controller, Get } from '@nestjs/common';
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';

@Controller('system-admin')
export class SystemAdminController {
  @Get('health')
  async health(@AuthContext() auth: AuthenticatedRequestContext) {
    const volunteer = await auth.assertSystemAdmin();
    return {
      ok: true,
      volunteerId: volunteer.id,
    };
  }
}
