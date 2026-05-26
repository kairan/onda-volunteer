import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('ministries/:ministryId/roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  list(
    @Param('ministryId') ministryId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.roles.listRoles({
      ministryId,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('ministryId') ministryId: string,
    @Body() body: { name: string },
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.roles.createRole({
      ministryId,
      name: body.name,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Patch(':roleId')
  rename(
    @Param('ministryId') ministryId: string,
    @Param('roleId') roleId: string,
    @Body() body: { name: string },
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.roles.renameRole({
      ministryId,
      roleId,
      name: body.name,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }

  @Post(':roleId/retire')
  @HttpCode(HttpStatus.OK)
  retire(
    @Param('ministryId') ministryId: string,
    @Param('roleId') roleId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-leader-ministry-id') leaderMinistryId: string | undefined,
  ) {
    return this.roles.retireRole({
      ministryId,
      roleId,
      authorizationHeader: authorization,
      leaderMinistryIdHeader: leaderMinistryId,
    });
  }
}
