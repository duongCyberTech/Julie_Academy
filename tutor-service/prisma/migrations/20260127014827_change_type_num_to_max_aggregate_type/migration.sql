/*
  Warnings:

  - The values [num] on the enum `AggregateType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AggregateType_new" AS ENUM ('sum', 'avg', 'max', 'incre');
ALTER TABLE "Badge" ALTER COLUMN "func_type" TYPE "AggregateType_new" USING ("func_type"::text::"AggregateType_new");
ALTER TYPE "AggregateType" RENAME TO "AggregateType_old";
ALTER TYPE "AggregateType_new" RENAME TO "AggregateType";
DROP TYPE "public"."AggregateType_old";
COMMIT;
