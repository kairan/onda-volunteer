import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { OrganizationService } from './organization.service';

@Controller('churches/:churchId/ministries')
export class ChurchMinistriesController {
  constructor(private readonly organization: OrganizationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('churchId') churchId: string,
    @Body() body: { name?: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.organization.createMinistry({
      churchId,
      name: body.name,
      auth,
    });
  }
}
