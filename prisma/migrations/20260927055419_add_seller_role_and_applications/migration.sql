-- CreateEnum
CREATE TYPE "SellerApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "sellerId" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "sellerId" TEXT;

-- CreateTable
CREATE TABLE "seller_application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "description" TEXT,
    "phoneNumber" TEXT,
    "status" "SellerApplicationStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_application_userId_key" ON "seller_application"("userId");

-- CreateIndex
CREATE INDEX "seller_application_status_idx" ON "seller_application"("status");

-- CreateIndex
CREATE INDEX "order_sellerId_idx" ON "order"("sellerId");

-- CreateIndex
CREATE INDEX "product_sellerId_idx" ON "product"("sellerId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_application" ADD CONSTRAINT "seller_application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_application" ADD CONSTRAINT "seller_application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
