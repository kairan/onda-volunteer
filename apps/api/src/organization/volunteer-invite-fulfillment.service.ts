import { Injectable } from '@nestjs/common';
import { VolunteerInviteStatus, type Volunteer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VolunteerInviteFulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  async fulfillPendingInvites(input: {
    email: string;
    volunteer: Volunteer;
  }): Promise<{ ministryId: string; ministryName: string }[]> {
    const email = input.email.trim().toLowerCase();
    if (!email) {
      return [];
    }

    const now = new Date();
    const pendingInvites = await this.prisma.volunteerInvite.findMany({
      where: {
        email,
        status: VolunteerInviteStatus.PENDING,
        expiresAtUtc: { gt: now },
      },
      include: { ministry: { select: { id: true, name: true, archivedAt: true } } },
    });

    if (pendingInvites.length === 0) {
      return [];
    }

    const fulfilled: { ministryId: string; ministryName: string }[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const invite of pendingInvites) {
        if (invite.ministry.archivedAt !== null) {
          await tx.volunteerInvite.update({
            where: { id: invite.id },
            data: { status: VolunteerInviteStatus.EXPIRED },
          });
          continue;
        }

        const existingMembership = await tx.ministryMembership.findUnique({
          where: {
            volunteerId_ministryId: {
              volunteerId: input.volunteer.id,
              ministryId: invite.ministryId,
            },
          },
        });

        if (!existingMembership) {
          await tx.ministryMembership.create({
            data: {
              volunteerId: input.volunteer.id,
              ministryId: invite.ministryId,
              status: 'PENDING',
            },
          });
        }

        await tx.volunteerInvite.update({
          where: { id: invite.id },
          data: {
            status: VolunteerInviteStatus.ACCEPTED,
            acceptedAtUtc: now,
          },
        });

        fulfilled.push({
          ministryId: invite.ministry.id,
          ministryName: invite.ministry.name,
        });
      }
    });

    return fulfilled;
  }
}
