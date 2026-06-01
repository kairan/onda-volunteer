-- CreateEnum
CREATE TYPE "AdminInviteStatus" AS ENUM ('PENDING', 'FULFILLED', 'REVOKED');

-- CreateTable
CREATE TABLE "AdminInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "status" "AdminInviteStatus" NOT NULL,
    "invitedByVolunteerId" TEXT NOT NULL,
    "fulfilledVolunteerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "AdminInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminInvite_churchId_idx" ON "AdminInvite"("churchId");

-- CreateIndex
CREATE INDEX "AdminInvite_email_status_idx" ON "AdminInvite"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvite_email_churchId_pending_key" ON "AdminInvite"("email", "churchId") WHERE "status" = 'PENDING';

-- AddForeignKey
ALTER TABLE "AdminInvite" ADD CONSTRAINT "AdminInvite_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvite" ADD CONSTRAINT "AdminInvite_invitedByVolunteerId_fkey" FOREIGN KEY ("invitedByVolunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvite" ADD CONSTRAINT "AdminInvite_fulfilledVolunteerId_fkey" FOREIGN KEY ("fulfilledVolunteerId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
