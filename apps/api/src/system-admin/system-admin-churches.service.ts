import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { parseIanaTimezone } from '../common/iana-timezone';
import { PrismaService } from '../prisma/prisma.service';

export type CreateSystemAdminChurchInput = {
  name?: string;
  defaultTimezone?: string;
  campus?: {
    name?: string;
    timezone?: string;
  };
};

@Injectable()
export class SystemAdminChurchesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseChurchName(name: string | undefined): string {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      throw new BadRequestException({
        code: 'CHURCH_NAME_REQUIRED',
        message: 'Church name is required.',
      });
    }
    return trimmed;
  }

  async createChurch(input: CreateSystemAdminChurchInput) {
    const name = this.parseChurchName(input.name);
    const defaultTimezone = parseIanaTimezone(input.defaultTimezone, 'defaultTimezone');
    const campusName =
      typeof input.campus?.name === 'string' && input.campus.name.trim()
        ? input.campus.name.trim()
        : 'Principal';
    const campusTimezone = input.campus?.timezone
      ? parseIanaTimezone(input.campus.timezone, 'campus.timezone')
      : defaultTimezone;

    return this.prisma.$transaction(async (tx) => {
      const church = await tx.church.create({
        data: { name, defaultTimezone },
      });
      const campus = await tx.campus.create({
        data: {
          churchId: church.id,
          name: campusName,
          timezone: campusTimezone,
        },
      });
      return {
        id: church.id,
        name: church.name,
        defaultTimezone: church.defaultTimezone,
        campuses: [
          {
            id: campus.id,
            name: campus.name,
            timezone: campus.timezone,
          },
        ],
      };
    });
  }

  async listChurches() {
    return this.prisma.church.findMany({
      select: {
        id: true,
        name: true,
        defaultTimezone: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getChurch(churchId: string) {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      select: {
        id: true,
        name: true,
        defaultTimezone: true,
      },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }
    return church;
  }
}
