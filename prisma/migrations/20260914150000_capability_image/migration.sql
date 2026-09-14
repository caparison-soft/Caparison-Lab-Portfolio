-- Capability image: shown on the home page hover slider.
ALTER TABLE "Capability" ADD COLUMN "imageId" TEXT;
CREATE UNIQUE INDEX "Capability_imageId_key" ON "Capability"("imageId");
ALTER TABLE "Capability" ADD CONSTRAINT "Capability_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
