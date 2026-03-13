-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_PIC_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROJECT_PROGRESS_UPDATED';

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "teamId" TEXT NOT NULL,
    "picId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "Task" ADD COLUMN "projectId" TEXT;

-- Create General project per team to backfill existing tasks
INSERT INTO "Project" (
  "id", "name", "description", "status", "progress", "teamId", "createdById", "createdAt", "updatedAt"
)
SELECT
  'proj_' || "id",
  'General Backlog',
  'Auto-generated default project for migrated tasks',
  'IN_PROGRESS',
  0,
  "id",
  "createdById",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Team";

-- Backfill existing tasks into team default project
UPDATE "Task" t
SET "projectId" = 'proj_' || t."teamId"
WHERE t."projectId" IS NULL;

-- Enforce not-null project ownership for tasks
ALTER TABLE "Task" ALTER COLUMN "projectId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_picId_fkey" FOREIGN KEY ("picId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
