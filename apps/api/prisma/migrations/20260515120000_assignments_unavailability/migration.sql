-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinistryMembership" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL,

    CONSTRAINT "MinistryMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinistryRole" (
    "id" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "retired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MinistryRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "startsAtUtc" TIMESTAMPTZ NOT NULL,
    "endsAtUtc" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unavailability" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "startsAtUtc" TIMESTAMPTZ NOT NULL,
    "endsAtUtc" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Unavailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MinistryMembership_volunteerId_ministryId_key" ON "MinistryMembership"("volunteerId", "ministryId");

-- CreateIndex
CREATE INDEX "MinistryMembership_ministryId_idx" ON "MinistryMembership"("ministryId");

-- CreateIndex
CREATE INDEX "MinistryRole_ministryId_idx" ON "MinistryRole"("ministryId");

-- CreateIndex
CREATE INDEX "Assignment_eventId_idx" ON "Assignment"("eventId");

-- CreateIndex
CREATE INDEX "Assignment_volunteerId_ministryId_idx" ON "Assignment"("volunteerId", "ministryId");

-- CreateIndex
CREATE INDEX "Unavailability_volunteerId_ministryId_idx" ON "Unavailability"("volunteerId", "ministryId");

-- AddForeignKey
ALTER TABLE "MinistryMembership" ADD CONSTRAINT "MinistryMembership_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MinistryMembership" ADD CONSTRAINT "MinistryMembership_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MinistryRole" ADD CONSTRAINT "MinistryRole_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "MinistryRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Unavailability" ADD CONSTRAINT "Unavailability_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Unavailability" ADD CONSTRAINT "Unavailability_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
