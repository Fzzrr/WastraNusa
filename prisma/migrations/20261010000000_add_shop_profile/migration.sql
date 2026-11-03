-- CreateTable
CREATE TABLE "shop_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopName" VARCHAR(60) NOT NULL,
    "description" VARCHAR(500),
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(120),
    "address" VARCHAR(255),
    "city" VARCHAR(60),
    "province" VARCHAR(60),
    "logoURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_profile_userId_key" ON "shop_profile"("userId");

-- AddForeignKey
ALTER TABLE "shop_profile" ADD CONSTRAINT "shop_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
