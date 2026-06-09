-- CreateEnum
CREATE TYPE "VolunteerInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN "email" TEXT;

-- CreateTable
CREATE TABLE "VolunteerInvite" (
    "id" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedByVolunteerId" TEXT NOT NULL,
    "sentAtUtc" TIMESTAMPTZ NOT NULL,
    "acceptedAtUtc" TIMESTAMPTZ,
    "expiresAtUtc" TIMESTAMPTZ NOT NULL,
    "status" "VolunteerInviteStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "VolunteerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolunteerInvite_email_status_idx" ON "VolunteerInvite"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerInvite_ministryId_email_key" ON "VolunteerInvite"("ministryId", "email");

-- AddForeignKey
ALTER TABLE "VolunteerInvite" ADD CONSTRAINT "VolunteerInvite_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerInvite" ADD CONSTRAINT "VolunteerInvite_invitedByVolunteerId_fkey" FOREIGN KEY ("invitedByVolunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
