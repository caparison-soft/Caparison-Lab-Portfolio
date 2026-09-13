"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { CACHE_TAGS } from "@/lib/queries/content";
import { deletePrefix, getObjectBuffer, presignPut, putObject } from "@/lib/r2";
import { EXT, IMAGE_MIMES, VIDEO_MIMES, sniffMime, type SniffedMime } from "@/lib/sniff";
import { IMAGE_MAX_BYTES, VIDEO_HARD_BYTES, VIDEO_MAX_HEIGHT, VIDEO_MAX_WIDTH, extractPoster, makeImageVariants, makePoster, probeVideo } from "@/lib/media-processing";
import type { Prisma } from "@/generated/prisma/client";

type Ok<T> = { ok: true } & T;
type Fail = { ok: false; error: string };

const PREFIX_RE = /^(projects\/[a-z0-9]+|library|video)\/[A-Za-z0-9_-]{21}$/;

function bust(projectId?: string | null) {
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath("/admin/media");
  if (projectId) revalidatePath(`/admin/projects/${projectId}`);
}

// ---- 1. Presign --------------------------------------------------------

const requestSchema = z.object({
  filename: z.string().min(1).max(200),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  kind: z.enum(["image", "video", "poster"]),
  projectId: z.string().nullable().optional(),
  /** For posters: the video's key prefix. */
  videoKeyPrefix: z.string().optional(),
});

export type UploadTicket = { uploadUrl: string; key: string; keyPrefix: string; ext: string };

/** Validates type and size from the declaration, then returns a five-minute presigned PUT. The confirm step re-checks everything from the bytes. */
export async function requestUpload(input: z.input<typeof requestSchema>): Promise<Ok<UploadTicket> | Fail> {
  try {
    await assertAdmin();
    const v = requestSchema.parse(input);
    const mime = v.mimeType as SniffedMime;

    if (v.kind === "video") {
      if (!VIDEO_MIMES.includes(mime)) return { ok: false, error: "Video must be MP4 (H.264) or WebM." };
      if (v.size > VIDEO_HARD_BYTES) return { ok: false, error: "Video is over the 60 MB hard cap. Compress it or use a YouTube or Vimeo link." };
      const id = nanoid();
      const keyPrefix = `video/${id}`;
      const key = `${keyPrefix}/source.${EXT[mime]}`;
      return { ok: true, uploadUrl: await presignPut(key, mime), key, keyPrefix, ext: EXT[mime] };
    }

    if (!IMAGE_MIMES.includes(mime)) return { ok: false, error: "Images must be JPEG, PNG, WebP or AVIF." };
    if (v.size > IMAGE_MAX_BYTES) return { ok: false, error: "Image is over 8 MB. Export it smaller." };

    if (v.kind === "poster") {
      if (!v.videoKeyPrefix || !PREFIX_RE.test(v.videoKeyPrefix)) return { ok: false, error: "Poster needs its video." };
      const key = `${v.videoKeyPrefix}/poster-upload.${EXT[mime]}`;
      return { ok: true, uploadUrl: await presignPut(key, mime), key, keyPrefix: v.videoKeyPrefix, ext: EXT[mime] };
    }

    const id = nanoid();
    const keyPrefix = v.projectId ? `projects/${v.projectId}/${id}` : `library/${id}`;
    const key = `${keyPrefix}/original.${EXT[mime]}`;
    return { ok: true, uploadUrl: await presignPut(key, mime), key, keyPrefix, ext: EXT[mime] };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not prepare the upload." };
  }
}

// ---- 2. Confirm --------------------------------------------------------

const confirmSchema = z.object({
  keyPrefix: z.string().regex(PREFIX_RE),
  ext: z.string().min(2).max(5),
  kind: z.enum(["image", "video"]),
  projectId: z.string().nullable().optional(),
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(300).optional(),
  posterExt: z.string().min(2).max(5).optional(),
});

export type ConfirmedMedia = { id: string; type: "IMAGE" | "VIDEO"; keyPrefix: string; posterKey: string | null; alt: string | null; caption: string | null; width: number | null; height: number | null; durationSec: number | null; sizeBytes: number | null; order: number; warning?: string };

/**
 * Fetches the uploaded object, sniffs the real type, enforces the caps,
 * writes the derived files, and creates the Media row. Rejected uploads are
 * deleted from R2 so nothing stray is left behind.
 */
export async function confirmUpload(input: z.input<typeof confirmSchema>): Promise<Ok<{ media: ConfirmedMedia }> | Fail> {
  const user = await assertAdmin();
  const v = confirmSchema.parse(input);
  const sourceKey = v.kind === "video" ? `${v.keyPrefix}/source.${v.ext}` : `${v.keyPrefix}/original.${v.ext}`;

  const fail = async (error: string): Promise<Fail> => {
    try { await deletePrefix(v.keyPrefix); } catch (e) { console.error("cleanup failed", e); }
    return { ok: false, error };
  };

  try {
    const { body, size } = await getObjectBuffer(sourceKey);
    const mime = sniffMime(body);
    const last = await prisma.media.aggregate({ _max: { order: true }, where: { projectId: v.projectId ?? null } });
    const order = (last._max.order ?? 0) + 1;

    if (v.kind === "image") {
      if (!mime || !IMAGE_MIMES.includes(mime)) return fail("That file isn't a JPEG, PNG, WebP or AVIF image.");
      if (size > IMAGE_MAX_BYTES) return fail("Image is over 8 MB.");
      if (!v.alt || v.alt.length === 0) return fail("Alt text is required for every image.");
      const out = await makeImageVariants(body);
      await Promise.all(out.files.map((f) => putObject(`${v.keyPrefix}/${f.name}`, f.body, "image/webp")));
      const variants: Record<string, string> = Object.fromEntries(out.files.map((f) => [f.name.replace(".webp", ""), `${v.keyPrefix}/${f.name}`]));
      const media = await prisma.media.create({
        data: {
          keyPrefix: v.keyPrefix, type: "IMAGE", variants, alt: v.alt, caption: v.caption || null, width: out.width, height: out.height,
          sizeBytes: size, mimeType: mime, blurDataUrl: out.blurDataUrl, order, projectId: v.projectId ?? null,
        },
      });
      await logAudit({ userId: user.id, action: "media.upload", entity: "Media", entityId: media.id, diff: { type: "IMAGE", keyPrefix: v.keyPrefix, bytes: size } });
      bust(v.projectId);
      return { ok: true, media: { ...media, order: media.order } };
    }

    // Video
    if (!mime || !VIDEO_MIMES.includes(mime)) return fail("That file isn't an MP4 or WebM video.");
    if (size > VIDEO_HARD_BYTES) return fail("Video is over the 60 MB hard cap.");
    const probe = await probeVideo(body, EXT[mime]);
    if (probe.height > VIDEO_MAX_HEIGHT || probe.width > VIDEO_MAX_WIDTH) return fail(`Video is ${probe.width}x${probe.height}. 1080p is the maximum; export it at 1920x1080 or smaller.`);

    let poster: Buffer;
    if (v.posterExt) {
      const uploaded = await getObjectBuffer(`${v.keyPrefix}/poster-upload.${v.posterExt}`);
      const pm = sniffMime(uploaded.body);
      if (!pm || !IMAGE_MIMES.includes(pm)) return fail("The poster isn't an image.");
      poster = await makePoster(uploaded.body);
    } else {
      poster = await extractPoster(body, EXT[mime]);
    }
    const posterKey = `${v.keyPrefix}/poster.jpg`;
    await putObject(posterKey, poster, "image/jpeg");

    const media = await prisma.media.create({
      data: {
        keyPrefix: v.keyPrefix, type: "VIDEO", posterKey, alt: v.alt || null, caption: v.caption || null, width: probe.width, height: probe.height,
        durationSec: probe.durationSec, sizeBytes: size, mimeType: mime, order, projectId: v.projectId ?? null,
      },
    });
    await logAudit({ userId: user.id, action: "media.upload", entity: "Media", entityId: media.id, diff: { type: "VIDEO", keyPrefix: v.keyPrefix, bytes: size, durationSec: probe.durationSec } });
    bust(v.projectId);
    const warning = size > 15 * 1024 * 1024 ? "Over 15 MB. On mobile data this will be slow to start; consider a shorter or more compressed export." : undefined;
    return { ok: true, media: { ...media, warning } };
  } catch (error) {
    console.error("confirmUpload", error);
    return fail(error instanceof Error ? error.message : "Could not process the upload.");
  }
}

// ---- Edits -------------------------------------------------------------

export async function updateMedia(id: string, patch: { alt?: string; caption?: string }): Promise<Ok<object> | Fail> {
  try {
    const user = await assertAdmin();
    const m = await prisma.media.findUnique({ where: { id }, select: { type: true, projectId: true } });
    if (!m) return { ok: false, error: "That media item no longer exists." };
    const alt = patch.alt?.trim();
    if (m.type === "IMAGE" && alt !== undefined && alt.length === 0) return { ok: false, error: "Alt text is required for every image." };
    await prisma.media.update({ where: { id }, data: { ...(alt !== undefined ? { alt } : {}), ...(patch.caption !== undefined ? { caption: patch.caption.trim() || null } : {}) } });
    await logAudit({ userId: user.id, action: "media.update", entity: "Media", entityId: id, diff: patch as Prisma.InputJsonObject });
    bust(m.projectId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save." };
  }
}

export async function reorderMedia(projectId: string, ids: string[]): Promise<Ok<object> | Fail> {
  try {
    const user = await assertAdmin();
    await prisma.$transaction(ids.map((id, i) => prisma.media.update({ where: { id, projectId }, data: { order: i + 1 } })));
    await logAudit({ userId: user.id, action: "media.reorder", entity: "Project", entityId: projectId, diff: { ids } });
    bust(projectId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not reorder." };
  }
}

export async function setCover(projectId: string, mediaId: string | null): Promise<Ok<object> | Fail> {
  try {
    const user = await assertAdmin();
    if (mediaId) {
      const m = await prisma.media.findUnique({ where: { id: mediaId }, select: { type: true, projectId: true } });
      if (!m || m.type !== "IMAGE") return { ok: false, error: "Only an image can be the cover." };
    }
    await prisma.project.update({ where: { id: projectId }, data: { coverImageId: mediaId } });
    await logAudit({ userId: user.id, action: "project.cover", entity: "Project", entityId: projectId, diff: { mediaId } });
    bust(projectId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not set the cover." };
  }
}

export async function setCoverVideo(projectId: string, mediaId: string | null): Promise<Ok<object> | Fail> {
  try {
    const user = await assertAdmin();
    let videoUrl: string | null = null;
    if (mediaId) {
      const m = await prisma.media.findUnique({ where: { id: mediaId }, select: { type: true, keyPrefix: true } });
      if (!m || m.type !== "VIDEO") return { ok: false, error: "That item isn't a video." };
      videoUrl = m.keyPrefix;
    }
    await prisma.project.update({ where: { id: projectId }, data: { videoUrl, videoProvider: "R2" } });
    await logAudit({ userId: user.id, action: "project.coverVideo", entity: "Project", entityId: projectId, diff: { mediaId } });
    bust(projectId);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not set the video." };
  }
}

/**
 * Deletes the row and every object under its prefix in one go. Refuses when
 * the item is a cover, is used inline in a body, or (from the library) is
 * attached to a project, and names the projects.
 */
export async function deleteMedia(id: string, opts?: { fromProjectId?: string }): Promise<Ok<object> | Fail> {
  try {
    const user = await assertAdmin();
    const m = await prisma.media.findUnique({ where: { id }, include: { coverOf: { select: { id: true, title: true } }, project: { select: { id: true, title: true } } } });
    if (!m) return { ok: false, error: "That media item no longer exists." };

    const blockers: string[] = [];
    if (m.coverOf) blockers.push(`it is the cover of "${m.coverOf.title}"`);
    const inline = await prisma.$queryRaw<{ title: string }[]>`select title from "Project" where "deletedAt" is null and body::text like ${"%" + m.keyPrefix + "%"}`;
    if (inline.length > 0) blockers.push(`it appears inside ${inline.map((p) => `"${p.title}"`).join(", ")}`);
    const usedAsVideo = await prisma.project.findFirst({ where: { videoUrl: m.keyPrefix, deletedAt: null }, select: { title: true } });
    if (usedAsVideo) blockers.push(`it is the cover video of "${usedAsVideo.title}"`);
    if (m.project && m.project.id !== opts?.fromProjectId) blockers.push(`it is in the gallery of "${m.project.title}"`);
    if (blockers.length > 0) return { ok: false, error: `Can't delete: ${blockers.join("; ")}. Remove it there first.` };

    const deleted = await deletePrefix(m.keyPrefix);
    await prisma.media.delete({ where: { id } });
    await logAudit({ userId: user.id, action: "media.delete", entity: "Media", entityId: id, diff: { keyPrefix: m.keyPrefix, objectsDeleted: deleted } });
    bust(m.projectId);
    return { ok: true };
  } catch (error) {
    console.error("deleteMedia", error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not delete." };
  }
}
