import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { isValidIanaTimezone } from '../common/iana-timezone';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CAMPUS_NAME = 'Principal';
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

export type SystemAdminChurchRow = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: { id: string; name: string; timezone: string }[];
};

export type SystemAdminChurchListPage = {
  items: SystemAdminChurchRow[];
  nextCursor: string | null;
};

@Injectable()
export class SystemAdminChurchesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseChurchName(name: unknown): string {
    const parsed = typeof name === 'string' ? name.trim() : '';
    if (!parsed) {
      throw new BadRequestException({
        code: 'CHURCH_NAME_REQUIRED',
        message: 'Church name is required.',
      });
    }
    return parsed;
  }

  private parseTimezone(label: string, timezone: unknown): string {
    const parsed = typeof timezone === 'string' ? timezone.trim() : '';
    if (!parsed) {
      throw new BadRequestException({
        code: 'INVALID_TIMEZONE',
        message: `${label} is required.`,
      });
    }
    if (!isValidIanaTimezone(parsed)) {
      throw new BadRequestException({
        code: 'INVALID_TIMEZONE',
        message: `${label} must be a valid IANA timezone.`,
      });
    }
    return parsed;
  }

  private toRow(church: {
    id: string;
    name: string;
    defaultTimezone: string;
    campuses: { id: string; name: string; timezone: string }[];
  }): SystemAdminChurchRow {
    return {
      id: church.id,
      name: church.name,
      defaultTimezone: church.defaultTimezone,
      campuses: church.campuses.map((campus) => ({
        id: campus.id,
        name: campus.name,
        timezone: campus.timezone,
      })),
    };
  }

  async create(input: {
    name?: unknown;
    defaultTimezone?: unknown;
    campus?: { name?: unknown; timezone?: unknown };
  }): Promise<SystemAdminChurchRow> {
    const name = this.parseChurchName(input.name);
    const defaultTimezone = this.parseTimezone(
      'defaultTimezone',
      input.defaultTimezone,
    );

    const campusName =
      typeof input.campus?.name === 'string' && input.campus.name.trim()
        ? input.campus.name.trim()
        : DEFAULT_CAMPUS_NAME;
    const campusTimezone = input.campus?.timezone
      ? this.parseTimezone('campus.timezone', input.campus.timezone)
      : defaultTimezone;

    const church = await this.prisma.$transaction(async (tx) => {
      const created = await tx.church.create({
        data: {
          name,
          defaultTimezone,
          campuses: {
            create: {
              name: campusName,
              timezone: campusTimezone,
            },
          },
        },
        include: { campuses: true },
      });
      return created;
    });

    return this.toRow(church);
  }

  async list(input: {
    q?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SystemAdminChurchListPage> {
    const q = input.q?.trim();
    const limit = Math.min(
      Math.max(input.limit ?? DEFAULT_LIST_LIMIT, 1),
      MAX_LIST_LIMIT,
    );
    const cursor = input.cursor?.trim() || undefined;

    const rows = await this.prisma.church.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      orderBy: { id: 'asc' },
      take: limit + 1,
      include: {
        campuses: { orderBy: { name: 'asc' } },
      },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: page.map((row) => this.toRow(row)),
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    };
  }

  async getChurch(churchId: string): Promise<SystemAdminChurchRow> {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      include: { campuses: { orderBy: { name: 'asc' } } },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }
    return this.toRow(church);
  }

}
