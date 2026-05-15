import { Controller, Get, Headers } from '@nestjs/common';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Get('me')
  getMe(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-volunteer-id') volunteerId: string | undefined,
  ) {
    return this.identity.getMe({
      authorizationHeader: authorization,
      devVolunteerIdHeader: volunteerId,
    });
  }
}
