-- Case story: outcome line, our part, platforms, stage, launch date, after-launch
-- note; key decisions and timeline phases per project; team members on a
-- project; metric period and source. Written by hand (migrate diff cannot
-- introspect this database because of the auth.users reference).

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('LIVE', 'BETA', 'RETIRED');

-- AlterTable
ALTER TABLE "Project"
  ADD COLUMN "outcome" VARCHAR(200),
  ADD COLUMN "role" TEXT,
  ADD COLUMN "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "stage" "ProjectStage",
  ADD COLUMN "launchedAt" TIMESTAMP(3),
  ADD COLUMN "afterNote" TEXT;

-- AlterTable
ALTER TABLE "ProjectMetric"
  ADD COLUMN "period" TEXT,
  ADD COLUMN "source" TEXT;

-- CreateTable
CREATE TABLE "ProjectDecision" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectDecision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProjectDecision_projectId_order_idx" ON "ProjectDecision"("projectId", "order");
ALTER TABLE "ProjectDecision" ADD CONSTRAINT "ProjectDecision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "ProjectPhase" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "when" TEXT NOT NULL,
  "note" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProjectPhase_projectId_order_idx" ON "ProjectPhase"("projectId", "order");
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable (implicit many-to-many Project <-> TeamMember)
CREATE TABLE "_ProjectToTeamMember" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_ProjectToTeamMember_AB_pkey" PRIMARY KEY ("A", "B")
);
CREATE INDEX "_ProjectToTeamMember_B_index" ON "_ProjectToTeamMember"("B");
ALTER TABLE "_ProjectToTeamMember" ADD CONSTRAINT "_ProjectToTeamMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProjectToTeamMember" ADD CONSTRAINT "_ProjectToTeamMember_B_fkey" FOREIGN KEY ("B") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: deny by default, public read only for published projects.
ALTER TABLE public."ProjectDecision"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectPhase"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_ProjectToTeamMember" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decisions of published projects are public"
  ON public."ProjectDecision" FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public."Project" p WHERE p.id = "ProjectDecision"."projectId" AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL));

CREATE POLICY "phases of published projects are public"
  ON public."ProjectPhase" FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public."Project" p WHERE p.id = "ProjectPhase"."projectId" AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL));

CREATE POLICY "team of published projects is public"
  ON public."_ProjectToTeamMember" FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public."Project" p WHERE p.id = "_ProjectToTeamMember"."A" AND p.status = 'PUBLISHED' AND p."deletedAt" IS NULL));
