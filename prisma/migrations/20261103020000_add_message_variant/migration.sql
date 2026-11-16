-- AlterTable
ALTER TABLE "message" ADD COLUMN "variantId" TEXT;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
