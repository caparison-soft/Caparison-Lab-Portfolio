-- The case-page body becomes two named fields beside a picture, with the side
-- the picture sits on set in the admin (owner, 2026-09-16). "body" stays as the
-- fallback for anything not yet moved across.
ALTER TABLE "Project" ADD COLUMN "brief" JSONB;
ALTER TABLE "Project" ADD COLUMN "whatWeBuilt" JSONB;
ALTER TABLE "Project" ADD COLUMN "storyImageId" TEXT;
ALTER TABLE "Project" ADD COLUMN "storySide" TEXT NOT NULL DEFAULT 'LEFT';

CREATE UNIQUE INDEX "Project_storyImageId_key" ON "Project"("storyImageId");
ALTER TABLE "Project" ADD CONSTRAINT "Project_storyImageId_fkey"
  FOREIGN KEY ("storyImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One more single-item slot alongside THUMBNAIL and HERO.
ALTER TYPE "MediaSlot" ADD VALUE IF NOT EXISTS 'STORY';
