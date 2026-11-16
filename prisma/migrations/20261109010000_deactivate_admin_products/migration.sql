-- Admins no longer run shops: take any admin-owned products off sale.
UPDATE "product"
SET "status" = 'inactive'
WHERE "status" = 'active'
  AND "sellerId" IN (SELECT "id" FROM "user" WHERE "role" = 'admin');
