-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "voidedAtUtc" TIMESTAMPTZ;
