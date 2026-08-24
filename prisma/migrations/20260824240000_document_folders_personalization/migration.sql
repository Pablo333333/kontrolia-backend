-- CreateTable DocumentFolder
CREATE TABLE IF NOT EXISTS "DocumentFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cloudinaryPrefix" TEXT,
    "workGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentFolder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DocumentFolder_workGroupId_name_key" ON "DocumentFolder"("workGroupId", "name");

ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "folderId" TEXT;

DO $$ BEGIN
  ALTER TABLE "DocumentFolder" ADD CONSTRAINT "DocumentFolder_workGroupId_fkey"
    FOREIGN KEY ("workGroupId") REFERENCES "WorkGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Document" ADD CONSTRAINT "Document_folderId_fkey"
    FOREIGN KEY ("folderId") REFERENCES "DocumentFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
