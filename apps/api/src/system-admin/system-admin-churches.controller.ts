import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { AuthContext } from '../identity/auth-context.decorator';
import { SystemAdminChurchesService } from './system-admin-churches.service';

type CreateChurchBody = {
  name?: unknown;
  defaultTimezone?: unknown;
  campus?: { name?: unknown; timezone?: unknown };
};

@Controller('system-admin/churches')
export class SystemAdminChurchesController {
  constructor(private readonly churches: SystemAdminChurchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateChurchBody,
    @AuthContext() auth: AuthenticatedRequestContext,
  ) {
    await auth.assertSystemAdmin();
    return this.churches.create(body);
  }

  @Get()
  async list(
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
    return this.churches.list({
      q,
      cursor,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
  }
}
