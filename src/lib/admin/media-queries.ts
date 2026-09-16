import "server-only";
import { prisma } from "@/lib/db";

export type MediaRow = {
  id: string;
  type: "IMAGE" | "VIDEO";
  keyPrefix: string;
  posterKey: string | null;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  sizeBytes: number | null;
  mimeType: string | null;
  blurDataUrl: string | null;
  variants: Record<string, string> | null;
  order: number;
  createdAt: string;
  project: { id: string; title: string; slug: string } | null;
  usedAsCoverBy: { id: string; title: string }[];
  usedInlineBy: { id: string; title: string }[];
  isOrphan: boolean;
};

async function inlineUsage(): Promise<Map<string, { id: string; title: string }[]>> {
  // Bodies are JSON; an inline image src contains the media key prefix.
  const rows = await prisma.$queryRaw<{ id: string; title: string; body: string }[]>`select id, title, body::text as body from "Project" where body is not null and "deletedAt" is null`;
  const map = new Map<string, { id: string; title: string }[]>();
  const media = await prisma.media.findMany({ select: { keyPrefix: true } });
  for (const m of media) {
    for (const r of rows) {
      if (r.body.includes(m.keyPrefix)) {
        const list = map.get(m.keyPrefix) ?? [];
        list.push({ id: r.id, title: r.title });
        map.set(m.keyPrefix, list);
      }
    }
  }
  return map;
}

export async function getMediaRows(): Promise<MediaRow[]> {
  const [rows, inline] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, title: true, slug: true } }, coverOf: { select: { id: true, title: true } }, heroOf: { select: { id: true, title: true } }, capabilityOf: { select: { id: true, title: true } } },
    }),
    inlineUsage(),
  ]);
  return rows.map((m) => {
    const usedInlineBy = inline.get(m.keyPrefix) ?? [];
    const usedAsCoverBy = [...(m.coverOf ? [m.coverOf] : []), ...(m.heroOf && m.heroOf.id !== m.coverOf?.id ? [m.heroOf] : []), ...(m.capabilityOf ? [{ id: m.capabilityOf.id, title: `${m.capabilityOf.title} (capability)` }] : [])];
    return {
      id: m.id, type: m.type, keyPrefix: m.keyPrefix, posterKey: m.posterKey, alt: m.alt, caption: m.caption, width: m.width, height: m.height,
      durationSec: m.durationSec, sizeBytes: m.sizeBytes, mimeType: m.mimeType, blurDataUrl: m.blurDataUrl,
      variants: (m.variants as Record<string, string> | null) ?? null, order: m.order, createdAt: m.createdAt.toISOString(),
      project: m.project, usedAsCoverBy, usedInlineBy,
      isOrphan: !m.project && usedAsCoverBy.length === 0 && usedInlineBy.length === 0,
    };
  });
}

export type ProjectMediaItem = {
  id: string; type: "IMAGE" | "VIDEO"; slot: "THUMBNAIL" | "HERO" | "GALLERY" | "VIDEO" | "STORY"; keyPrefix: string; posterKey: string | null;
  title: string | null; alt: string | null; caption: string | null;
  width: number | null; height: number | null; durationSec: number | null; sizeBytes: number | null; order: number;
};

export type ProjectMediaState = { items: ProjectMediaItem[]; coverImageId: string | null; heroMediaId: string | null; storyImageId: string | null };

export async function getProjectMedia(projectId: string): Promise<ProjectMediaState> {
  const [items, p] = await Promise.all([
    prisma.media.findMany({ where: { projectId }, orderBy: [{ slot: "asc" }, { order: "asc" }], select: { id: true, type: true, slot: true, keyPrefix: true, posterKey: true, title: true, alt: true, caption: true, width: true, height: true, durationSec: true, sizeBytes: true, order: true } }),
    prisma.project.findUnique({ where: { id: projectId }, select: { coverImageId: true, heroMediaId: true, storyImageId: true } }),
  ]);
  return { items, coverImageId: p?.coverImageId ?? null, heroMediaId: p?.heroMediaId ?? null, storyImageId: p?.storyImageId ?? null };
}

export type ReconcileReport = { at: string; orphanPrefixes: { prefix: string; objects: number; bytes: number }[]; missingObjects: { mediaId: string; keyPrefix: string }[]; totalObjects: number; totalBytes: number };

export async function getLatestReconcile(): Promise<ReconcileReport | null> {
  const row = await prisma.auditLog.findFirst({ where: { action: "media.reconcile" }, orderBy: { createdAt: "desc" }, select: { diff: true } });
  return (row?.diff as ReconcileReport | null) ?? null;
}
