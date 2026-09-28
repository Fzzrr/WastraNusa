-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'unisex';

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "gender" DROP NOT NULL;
