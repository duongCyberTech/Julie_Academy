-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'tutor', 'student', 'parents');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "public"."User" (
    "uid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fname" TEXT NOT NULL,
    "mname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'student',
    "status" "public"."AccountStatus" NOT NULL DEFAULT 'inactive',
    "avata_url" TEXT,
    "description" TEXT,
    "DoB" TIMESTAMP(3),
    "phone_number" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
