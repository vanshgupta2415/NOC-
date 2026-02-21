-- CreateTable
CREATE TABLE "StudentRegistry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistry_email_key" ON "StudentRegistry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistry_enrollmentNumber_key" ON "StudentRegistry"("enrollmentNumber");
