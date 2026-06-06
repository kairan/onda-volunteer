import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export async function assertMinistryAcceptsWrites(
  prisma: PrismaService,
  ministryId: string,
): Promise<{
  id: string;
  churchId: string;
  name: string;
  archivedAt: Date | null;
}> {
  const ministry = await prisma.ministry.findUnique({
    where: { id: ministryId },
    select: { id: true, churchId: true, name: true, archivedAt: true },
  });
  if (!ministry) {
    throw new NotFoundException();
  }
  if (ministry.archivedAt !== null) {
    throw new BadRequestException({
      code: 'MINISTRY_ARCHIVED',
      message: 'This ministry is archived and cannot accept new writes.',
    });
  }
  return ministry;
}
