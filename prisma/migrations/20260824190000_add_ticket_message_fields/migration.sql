-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "destinatarioId" TEXT,
ADD COLUMN     "messageType" TEXT,
ADD COLUMN     "tramiteSubtype" TEXT,
ADD COLUMN     "responseUrgency" TEXT,
ADD COLUMN     "fechaLimite" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
