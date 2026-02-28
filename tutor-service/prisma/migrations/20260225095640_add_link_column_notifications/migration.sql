-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'exam';

-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "link_partial_id" TEXT,
ADD COLUMN     "link_primary_id" TEXT;
