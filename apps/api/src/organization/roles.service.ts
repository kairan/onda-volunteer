import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from '../identity/authenticated-request-context';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoles(input: {
    ministryId: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);

    const roles = await this.prisma.ministryRole.findMany({
      where: { ministryId: input.ministryId },
      orderBy: [{ retired: 'asc' }, { name: 'asc' }],
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      retired: role.retired,
    }));
  }

  async createRole(input: {
    ministryId: string;
    name: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);

    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException({
        code: 'ROLE_NAME_REQUIRED',
        message: 'Role name is required.',
      });
    }

    const duplicate = await this.prisma.ministryRole.findFirst({
      where: { ministryId: input.ministryId, name },
    });
    if (duplicate) {
      throw new BadRequestException({
        code: 'ROLE_NAME_CONFLICT',
        message: 'A role with this name already exists in the ministry.',
      });
    }

    const role = await this.prisma.ministryRole.create({
      data: { ministryId: input.ministryId, name, retired: false },
    });

    return { id: role.id, name: role.name, retired: role.retired };
  }

  async renameRole(input: {
    ministryId: string;
    roleId: string;
    name: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);

    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException({
        code: 'ROLE_NAME_REQUIRED',
        message: 'Role name is required.',
      });
    }

    const role = await this.prisma.ministryRole.findUnique({
      where: { id: input.roleId },
    });
    if (!role || role.ministryId !== input.ministryId) {
      throw new NotFoundException();
    }

    const duplicate = await this.prisma.ministryRole.findFirst({
      where: {
        ministryId: input.ministryId,
        name,
        NOT: { id: role.id },
      },
    });
    if (duplicate) {
      throw new BadRequestException({
        code: 'ROLE_NAME_CONFLICT',
        message: 'A role with this name already exists in the ministry.',
      });
    }

    const updated = await this.prisma.ministryRole.update({
      where: { id: role.id },
      data: { name },
    });

    return { id: updated.id, name: updated.name, retired: updated.retired };
  }

  async retireRole(input: {
    ministryId: string;
    roleId: string;
    auth: AuthenticatedRequestContext;
  }) {
    await input.auth.assertLeaderCanActOnMinistry(input.ministryId);

    const role = await this.prisma.ministryRole.findUnique({
      where: { id: input.roleId },
    });
    if (!role || role.ministryId !== input.ministryId) {
      throw new NotFoundException();
    }
    if (role.retired) {
      throw new BadRequestException({
        code: 'ROLE_ALREADY_RETIRED',
        message: 'Role is already retired.',
      });
    }

    const updated = await this.prisma.ministryRole.update({
      where: { id: role.id },
      data: { retired: true },
    });

    return { id: updated.id, name: updated.name, retired: updated.retired };
  }
}
