import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { SystemAdminVolunteersService } from './system-admin-volunteers.service';

@Controller('system-admin/volunteers')
export class SystemAdminVolunteersController {
  constructor(private readonly volunteers: SystemAdminVolunteersService) {}

  @Get()
  async search(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    await auth.assertSystemAdmin();
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return this.volunteers.searchVolunteers({
      q,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    });
  }

  @Get(':volunteerId')
  async getOne(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('volunteerId') volunteerId: string,
  ) {
    await auth.assertSystemAdmin();
    return this.volunteers.getVolunteer(volunteerId);
  }

  @Put(':volunteerId/churches/:churchId/admin-accreditation')
  @HttpCode(HttpStatus.OK)
  async grantAdmin(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('volunteerId') volunteerId: string,
    @Param('churchId') churchId: string,
  ) {
    await auth.assertSystemAdmin();
    return this.volunteers.grantAdminAccreditation({ volunteerId, churchId });
  }

  @Delete(':volunteerId/churches/:churchId/admin-accreditation')
  @HttpCode(HttpStatus.OK)
  async revokeAdmin(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('volunteerId') volunteerId: string,
    @Param('churchId') churchId: string,
  ) {
    await auth.assertSystemAdmin();
    return this.volunteers.revokeAdminAccreditation({ volunteerId, churchId });
  }
}
