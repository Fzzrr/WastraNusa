-- AlterTable
ALTER TABLE "message" ADD COLUMN "productId" TEXT;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
