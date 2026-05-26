import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { RolesService } from './roles.service';

@Controller('ministries/:ministryId/roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  list(
    @Param('ministryId') ministryId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.roles.listRoles({ ministryId, auth });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('ministryId') ministryId: string,
    @Body() body: { name: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.roles.createRole({ ministryId, name: body.name, auth });
  }

  @Patch(':roleId')
  rename(
    @Param('ministryId') ministryId: string,
    @Param('roleId') roleId: string,
    @Body() body: { name: string },
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.roles.renameRole({
      ministryId,
      roleId,
      name: body.name,
      auth,
    });
  }

  @Post(':roleId/retire')
  @HttpCode(HttpStatus.OK)
  retire(
    @Param('ministryId') ministryId: string,
    @Param('roleId') roleId: string,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    return this.roles.retireRole({ ministryId, roleId, auth });
  }
}
