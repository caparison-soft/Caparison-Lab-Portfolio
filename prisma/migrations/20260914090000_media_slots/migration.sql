-- Media slots: thumbnail (home card), hero (case page top), gallery (carousel), video.
CREATE TYPE "MediaSlot" AS ENUM ('THUMBNAIL', 'HERO', 'GALLERY', 'VIDEO');

ALTER TABLE "Media" ADD COLUMN "slot" "MediaSlot" NOT NULL DEFAULT 'GALLERY';
ALTER TABLE "Media" ADD COLUMN "title" TEXT;
ALTER TABLE "Project" ADD COLUMN "heroMediaId" TEXT;
CREATE UNIQUE INDEX "Project_heroMediaId_key" ON "Project"("heroMediaId");
ALTER TABLE "Project" ADD CONSTRAINT "Project_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Media_projectId_order_idx";
CREATE INDEX "Media_projectId_slot_order_idx" ON "Media"("projectId", "slot", "order");

-- Existing data: the cover image becomes the thumbnail and the hero (the case
-- page showed it at the top); an R2 cover video becomes the hero instead;
-- other videos go to the video section.
UPDATE "Media" m SET "slot" = 'THUMBNAIL' FROM "Project" p WHERE p."coverImageId" = m.id;
UPDATE "Project" p SET "heroMediaId" = p."coverImageId" WHERE p."coverImageId" IS NOT NULL;
UPDATE "Media" m SET "slot" = 'HERO' FROM "Project" p
  WHERE p."videoProvider" = 'R2' AND p."videoUrl" IS NOT NULL AND m."keyPrefix" = p."videoUrl";
UPDATE "Project" p SET "heroMediaId" = m.id FROM "Media" m
  WHERE p."videoProvider" = 'R2' AND p."videoUrl" IS NOT NULL AND m."keyPrefix" = p."videoUrl";
UPDATE "Project" SET "videoUrl" = NULL WHERE "videoProvider" = 'R2';
UPDATE "Media" SET "slot" = 'VIDEO' WHERE "type" = 'VIDEO' AND "slot" = 'GALLERY' AND "projectId" IS NOT NULL;
