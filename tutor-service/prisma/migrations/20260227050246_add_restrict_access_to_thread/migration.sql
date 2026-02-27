-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "is_restricted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "open_list" JSONB NOT NULL DEFAULT '[]';
