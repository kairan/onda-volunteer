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
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { SystemAdminAccreditationService } from './system-admin-accreditation.service';
import { SystemAdminVolunteersService } from './system-admin-volunteers.service';

@Controller('system-admin/volunteers')
export class SystemAdminVolunteersController {
  constructor(
    private readonly volunteers: SystemAdminVolunteersService,
    private readonly accreditation: SystemAdminAccreditationService,
  ) {}

  @Get()
  async search(
    @Query('q') q: string | undefined,
    @Query('limit') limitRaw: string | undefined,
    @Query('cursor') cursor: string | undefined,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    const limit =
      limitRaw !== undefined && limitRaw !== ''
        ? Number.parseInt(limitRaw, 10)
        : undefined;
    return this.volunteers.list({
      q,
      cursor,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
  }

  @Get(':volunteerId')
  async detail(
    @Param('volunteerId') volunteerId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    return this.volunteers.getById(volunteerId);
  }

  @Put(':volunteerId/churches/:churchId/admin-accreditation')
  @HttpCode(HttpStatus.OK)
  async grantAccreditation(
    @Param('volunteerId') volunteerId: string,
    @Param('churchId') churchId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    return this.accreditation.grant({ volunteerId, churchId });
  }

  @Delete(':volunteerId/churches/:churchId/admin-accreditation')
  @HttpCode(HttpStatus.OK)
  async revokeAccreditation(
    @Param('volunteerId') volunteerId: string,
    @Param('churchId') churchId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    return this.accreditation.revoke({ volunteerId, churchId });
  }
}
