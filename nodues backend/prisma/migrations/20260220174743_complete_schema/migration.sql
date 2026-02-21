/*
  Warnings:

  - The `department` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `branch` on the `StudentProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ApprovalStage" DROP CONSTRAINT "ApprovalStage_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";

-- AlterTable
ALTER TABLE "NoDuesApplication" ADD COLUMN     "pausedById" TEXT,
ALTER COLUMN "libraryDues" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "branch",
ADD COLUMN     "branch" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
ADD COLUMN     "department" TEXT;

-- DropEnum
DROP TYPE "ApplicationStage";

-- DropEnum
DROP TYPE "Department";

-- CreateIndex
CREATE INDEX "ApprovalStage_applicationId_role_idx" ON "ApprovalStage"("applicationId", "role");

-- CreateIndex
CREATE INDEX "ApprovalStage_applicationId_status_idx" ON "ApprovalStage"("applicationId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "NoDuesApplication_studentId_idx" ON "NoDuesApplication"("studentId");

-- CreateIndex
CREATE INDEX "NoDuesApplication_status_currentStage_idx" ON "NoDuesApplication"("status", "currentStage");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoDuesApplication" ADD CONSTRAINT "NoDuesApplication_pausedById_fkey" FOREIGN KEY ("pausedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStage" ADD CONSTRAINT "ApprovalStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NoDuesApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NoDuesApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
