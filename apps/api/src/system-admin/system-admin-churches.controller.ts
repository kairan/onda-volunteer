import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { AuthContext } from '../identity/auth-context.decorator';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import {
  SystemAdminChurchesService,
  type CreateSystemAdminChurchInput,
} from './system-admin-churches.service';

@Controller('system-admin/churches')
export class SystemAdminChurchesController {
  constructor(private readonly churches: SystemAdminChurchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Body() body: CreateSystemAdminChurchInput,
  ) {
    await auth.assertSystemAdmin();
    return this.churches.createChurch(body);
  }

  @Get()
  async list(@AuthContext() auth: AuthenticatedRequestContext) {
    await auth.assertSystemAdmin();
    return this.churches.listChurches();
  }

  @Get(':churchId')
  async getOne(
    @AuthContext() auth: AuthenticatedRequestContext,
    @Param('churchId') churchId: string,
  ) {
    await auth.assertSystemAdmin();
    return this.churches.getChurch(churchId);
  }
}
