-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN "authSubjectId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_authSubjectId_key" ON "Volunteer"("authSubjectId");

-- CreateTable
CREATE TABLE "MinistryLeader" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,

    CONSTRAINT "MinistryLeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAccreditation" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "AdminAccreditation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MinistryLeader_ministryId_idx" ON "MinistryLeader"("ministryId");

-- CreateIndex
CREATE UNIQUE INDEX "MinistryLeader_volunteerId_ministryId_key" ON "MinistryLeader"("volunteerId", "ministryId");

-- CreateIndex
CREATE INDEX "AdminAccreditation_churchId_idx" ON "AdminAccreditation"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccreditation_volunteerId_churchId_key" ON "AdminAccreditation"("volunteerId", "churchId");

-- AddForeignKey
ALTER TABLE "MinistryLeader" ADD CONSTRAINT "MinistryLeader_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MinistryLeader" ADD CONSTRAINT "MinistryLeader_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccreditation" ADD CONSTRAINT "AdminAccreditation_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccreditation" ADD CONSTRAINT "AdminAccreditation_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
