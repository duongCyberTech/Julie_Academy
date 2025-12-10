-- CreateEnum
CREATE TYPE "public"."EnrollStatus" AS ENUM ('pending', 'accepted', 'cancelled', 'completed');

-- AlterTable
ALTER TABLE "public"."Learning" ADD COLUMN     "status" "public"."EnrollStatus" NOT NULL DEFAULT 'pending';
