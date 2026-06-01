import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemAdminAccreditationService {
  constructor(private readonly prisma: PrismaService) {}

  async grant(input: {
    volunteerId: string;
    churchId: string;
  }): Promise<{ volunteerId: string; churchId: string }> {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: input.volunteerId },
    });
    if (!volunteer) {
      throw new NotFoundException({
        code: 'VOLUNTEER_NOT_FOUND',
        message: 'Volunteer not found.',
      });
    }

    const church = await this.prisma.church.findUnique({
      where: { id: input.churchId },
    });
    if (!church) {
      throw new NotFoundException({
        code: 'CHURCH_NOT_FOUND',
        message: 'Church not found.',
      });
    }

    await this.prisma.adminAccreditation.upsert({
      where: {
        volunteerId_churchId: {
          volunteerId: input.volunteerId,
          churchId: input.churchId,
        },
      },
      create: {
        volunteerId: input.volunteerId,
        churchId: input.churchId,
      },
      update: {},
    });

    return {
      volunteerId: input.volunteerId,
      churchId: input.churchId,
    };
  }

  async revoke(input: {
    volunteerId: string;
    churchId: string;
  }): Promise<{ volunteerId: string; churchId: string }> {
    const accreditation = await this.prisma.adminAccreditation.findUnique({
      where: {
        volunteerId_churchId: {
          volunteerId: input.volunteerId,
          churchId: input.churchId,
        },
      },
    });
    if (!accreditation) {
      throw new NotFoundException({
        code: 'ACCREDITATION_NOT_FOUND',
        message: 'Admin accreditation not found for this volunteer and church.',
      });
    }

    const adminCount = await this.prisma.adminAccreditation.count({
      where: { churchId: input.churchId },
    });
    if (adminCount <= 1) {
      throw new BadRequestException({
        code: 'LAST_ADMIN_ACCREDITATION',
        message:
          'Cannot revoke the last Admin accreditation for this Church.',
      });
    }

    await this.prisma.adminAccreditation.delete({
      where: { id: accreditation.id },
    });

    return {
      volunteerId: input.volunteerId,
      churchId: input.churchId,
    };
  }
}
