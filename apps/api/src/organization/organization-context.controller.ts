import { Controller, Get, Headers } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationContextController {
  constructor(private readonly organization: OrganizationService) {}

  @Get('context')
  getContext(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
  ) {
    return this.organization.getAccessibleOrganizationContext({
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerId,
    });
  }
}
