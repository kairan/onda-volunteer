-- CreateTable
CREATE TABLE "SystemAdministrator" (
    "volunteerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAdministrator_pkey" PRIMARY KEY ("volunteerId")
);

-- AddForeignKey
ALTER TABLE "SystemAdministrator" ADD CONSTRAINT "SystemAdministrator_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
