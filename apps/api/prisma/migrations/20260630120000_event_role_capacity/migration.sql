-- EventRoleCapacity: per-event slot count per (event, ministry, role).
-- Backfill for existing private events:
--   capacity = GREATEST(1, count of active assignments per role+event)
--   plus capacity=1 rows for active roles with no assignments.

CREATE TABLE "EventRoleCapacity" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "EventRoleCapacity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventRoleCapacity_eventId_ministryId_roleId_key" ON "EventRoleCapacity"("eventId", "ministryId", "roleId");
CREATE INDEX "EventRoleCapacity_eventId_ministryId_idx" ON "EventRoleCapacity"("eventId", "ministryId");

ALTER TABLE "EventRoleCapacity" ADD CONSTRAINT "EventRoleCapacity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRoleCapacity" ADD CONSTRAINT "EventRoleCapacity_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRoleCapacity" ADD CONSTRAINT "EventRoleCapacity_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "MinistryRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from active assignments on private events
INSERT INTO "EventRoleCapacity" ("id", "eventId", "ministryId", "roleId", "capacity")
SELECT
    gen_random_uuid()::text,
    a."eventId",
    a."ministryId",
    a."roleId",
    GREATEST(1, COUNT(*)::int)
FROM "Assignment" a
INNER JOIN "Event" e ON e."id" = a."eventId"
WHERE a."voidedAtUtc" IS NULL
  AND e."kind" = 'PRIVATE'
  AND e."ministryId" IS NOT NULL
GROUP BY a."eventId", a."ministryId", a."roleId";

-- Seed capacity=1 for active roles on private events missing a row
INSERT INTO "EventRoleCapacity" ("id", "eventId", "ministryId", "roleId", "capacity")
SELECT
    gen_random_uuid()::text,
    e."id",
    e."ministryId",
    r."id",
    1
FROM "Event" e
INNER JOIN "MinistryRole" r ON r."ministryId" = e."ministryId" AND r."retired" = false
WHERE e."kind" = 'PRIVATE'
  AND e."ministryId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "EventRoleCapacity" erc
    WHERE erc."eventId" = e."id"
      AND erc."ministryId" = e."ministryId"
      AND erc."roleId" = r."id"
  );
