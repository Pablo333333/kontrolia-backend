-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "parentTicketId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "rootTicketId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "isContinuation" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_parentTicketId_fkey"
    FOREIGN KEY ("parentTicketId") REFERENCES "Ticket"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Ticket_rootTicketId_idx" ON "Ticket"("rootTicketId");
CREATE INDEX IF NOT EXISTS "Ticket_parentTicketId_idx" ON "Ticket"("parentTicketId");
