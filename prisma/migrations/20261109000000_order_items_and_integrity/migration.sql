-- AlterTable
ALTER TABLE "customer_address" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "imageURL" TEXT,
    "province" TEXT NOT NULL,
    "clothingType" TEXT NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_productId_idx" ON "order_item"("productId");

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill order_item from the JSON snapshot that checkout used to write into
-- "customerNotes" ("checkout_items=[...] | checkout_cart_item_ids=[...] | note").
-- An order whose snapshot is missing or unreadable gets one line built from
-- its own product columns ("productPrice" held the subtotal).
DO $$
DECLARE
  r RECORD;
  items JSONB;
  inserted INTEGER;
BEGIN
  FOR r IN SELECT * FROM "order" LOOP
    inserted := 0;
    BEGIN
      items := substring(r."customerNotes" from 'checkout_items=(\[.*?\])(?: \| |$)')::jsonb;
      IF jsonb_typeof(items) = 'array' THEN
        INSERT INTO "order_item" ("id", "orderId", "productId", "variantId", "productName", "variantName", "quantity", "unitPrice", "imageURL", "province", "clothingType")
        SELECT gen_random_uuid()::text, r."id", p."id", v."id",
               COALESCE(e->>'productName', p."name"), v."name",
               (e->>'quantity')::int,
               COALESCE((e->>'unitPrice')::numeric, v."price", p."price"),
               COALESCE(e->>'imageURL', p."imageURL"),
               COALESCE(e->>'province', p."province"),
               COALESCE(e->>'clothingType', p."clothingType")
        FROM jsonb_array_elements(items) e
        JOIN "product" p ON p."id" = e->>'productId'
        LEFT JOIN "product_variant" v ON v."id" = e->>'variantId'
        WHERE (e->>'quantity')::int > 0;
        GET DIAGNOSTICS inserted = ROW_COUNT;
      END IF;
    EXCEPTION WHEN others THEN
      inserted := 0;
    END;

    IF inserted = 0 THEN
      INSERT INTO "order_item" ("id", "orderId", "productId", "variantId", "productName", "variantName", "quantity", "unitPrice", "imageURL", "province", "clothingType")
      SELECT gen_random_uuid()::text, r."id", p."id", r."variantId",
             p."name", r."variantName", r."quantity",
             r."productPrice" / GREATEST(r."quantity", 1),
             p."imageURL", p."province", p."clothingType"
      FROM "product" p
      WHERE p."id" = r."productId";
    END IF;
  END LOOP;
END $$;

-- Keep only the buyer's own note.
UPDATE "order"
SET "customerNotes" = NULLIF(
  regexp_replace(
    regexp_replace("customerNotes", '^checkout_items=\[.*?\](?: \| |$)', ''),
    '^checkout_cart_item_ids=\[.*?\](?: \| |$)', ''
  ),
  ''
)
WHERE "customerNotes" LIKE 'checkout\_%';

-- "sold" was never incremented; derive it from paid orders.
UPDATE "product" p
SET "sold" = s."total"
FROM (
  SELECT i."productId", SUM(i."quantity") AS "total"
  FROM "order_item" i
  JOIN "order" o ON o."id" = i."orderId"
  WHERE o."paymentStatus" = 'paid' AND o."orderStatus" <> 'cancelled'
  GROUP BY i."productId"
) s
WHERE p."id" = s."productId";

-- Drop duplicate likes (double clicks raced past the old check), then resync counts.
DELETE FROM "user_article_like" a
USING "user_article_like" b
WHERE a."articleId" = b."articleId"
  AND a."userId" = b."userId"
  AND (a."createdAt", a."id") > (b."createdAt", b."id");

UPDATE "article_engagement" e
SET "likeCount" = (
  SELECT COUNT(*) FROM "user_article_like" l WHERE l."articleId" = e."articleId"
);

-- CreateIndex
CREATE UNIQUE INDEX "user_article_like_articleId_userId_key" ON "user_article_like"("articleId", "userId");
