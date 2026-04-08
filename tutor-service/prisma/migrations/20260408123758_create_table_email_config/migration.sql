-- CreateEnum
CREATE TYPE "Period" AS ENUM ('daily', 'weekly', 'monthly', 'none');

-- CreateTable
CREATE TABLE "EmailConfig" (
    "config_id" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "use_template" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" "Period" NOT NULL DEFAULT 'monthly',
    "day_of_week" INTEGER,
    "day_of_month" INTEGER,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("config_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfig_class_id_key" ON "EmailConfig"("class_id");

-- AddForeignKey
ALTER TABLE "EmailConfig" ADD CONSTRAINT "EmailConfig_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;
