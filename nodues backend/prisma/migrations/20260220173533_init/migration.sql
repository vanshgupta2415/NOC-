-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Student', 'Faculty', 'ClassCoordinator', 'HOD', 'HostelWarden', 'LibraryAdmin', 'WorkshopAdmin', 'TPOfficer', 'GeneralOffice', 'AccountsOfficer', 'SuperAdmin');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ComputerScience', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'InformationTechnology', 'Central');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Submitted', 'UnderReview', 'Paused', 'Approved', 'CertificateIssued', 'Rejected');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('Faculty', 'ClassCoordinator', 'HOD', 'HostelWarden', 'LibraryAdmin', 'WorkshopAdmin', 'TPOfficer', 'GeneralOffice', 'AccountsOfficer', 'Completed');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Pending', 'Approved', 'Paused', 'Skipped');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" "Department",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "branch" "Department" NOT NULL,
    "address" TEXT NOT NULL,
    "passOutYear" INTEGER NOT NULL,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoDuesApplication" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Submitted',
    "currentStage" TEXT NOT NULL DEFAULT 'Faculty',
    "hostelInvolved" BOOLEAN NOT NULL DEFAULT false,
    "cautionMoneyRefund" BOOLEAN NOT NULL DEFAULT false,
    "exitSurveyCompleted" BOOLEAN NOT NULL DEFAULT false,
    "feeDuesCleared" BOOLEAN NOT NULL DEFAULT false,
    "projectReportSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "pausedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "libraryDues" TEXT NOT NULL DEFAULT 'Nil',
    "tcNumber" TEXT,
    "tcDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoDuesApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalStage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "officeName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "stageOrder" INTEGER NOT NULL,
    "remarks" TEXT,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedByEmail" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "passOutYear" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfPath" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "regenerationCount" INTEGER NOT NULL DEFAULT 0,
    "lastRegeneratedAt" TIMESTAMP(3),
    "regeneratedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "feeReceiptsPDF_filename" TEXT,
    "feeReceiptsPDF_path" TEXT,
    "feeReceiptsPDF_size" INTEGER,
    "feeReceiptsPDF_uploadedAt" TIMESTAMP(3),
    "marksheetsPDF_filename" TEXT,
    "marksheetsPDF_path" TEXT,
    "marksheetsPDF_size" INTEGER,
    "marksheetsPDF_uploadedAt" TIMESTAMP(3),
    "bankProofImage_filename" TEXT,
    "bankProofImage_path" TEXT,
    "bankProofImage_size" INTEGER,
    "bankProofImage_uploadedAt" TIMESTAMP(3),
    "idProofImage_filename" TEXT,
    "idProofImage_path" TEXT,
    "idProofImage_size" INTEGER,
    "idProofImage_uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_enrollmentNumber_key" ON "StudentProfile"("enrollmentNumber");

-- CreateIndex
CREATE INDEX "NoDuesApplication_status_idx" ON "NoDuesApplication"("status");

-- CreateIndex
CREATE INDEX "NoDuesApplication_currentStage_idx" ON "NoDuesApplication"("currentStage");

-- CreateIndex
CREATE INDEX "NoDuesApplication_createdAt_idx" ON "NoDuesApplication"("createdAt");

-- CreateIndex
CREATE INDEX "ApprovalStage_status_idx" ON "ApprovalStage"("status");

-- CreateIndex
CREATE INDEX "ApprovalStage_role_idx" ON "ApprovalStage"("role");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_applicationId_key" ON "Certificate"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "Certificate_studentId_idx" ON "Certificate"("studentId");

-- CreateIndex
CREATE INDEX "Certificate_issuedAt_idx" ON "Certificate"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_applicationId_key" ON "Documents"("applicationId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoDuesApplication" ADD CONSTRAINT "NoDuesApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoDuesApplication" ADD CONSTRAINT "NoDuesApplication_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStage" ADD CONSTRAINT "ApprovalStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NoDuesApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalStage" ADD CONSTRAINT "ApprovalStage_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NoDuesApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_regeneratedById_fkey" FOREIGN KEY ("regeneratedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "NoDuesApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
