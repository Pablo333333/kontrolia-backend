-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "subcategoryId" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_subcategoryId_fkey'
  ) THEN
    ALTER TABLE "Ticket"
      ADD CONSTRAINT "Ticket_subcategoryId_fkey"
      FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
