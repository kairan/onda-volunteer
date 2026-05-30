-- Case-insensitive unique ministry display name within a Church.
CREATE UNIQUE INDEX "Ministry_churchId_name_lower_key" ON "Ministry"("churchId", LOWER("name"));
