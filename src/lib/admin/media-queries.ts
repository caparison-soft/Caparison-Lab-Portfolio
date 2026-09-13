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
      include: { project: { select: { id: true, title: true, slug: true } }, coverOf: { select: { id: true, title: true } } },
    }),
    inlineUsage(),
  ]);
  return rows.map((m) => {
    const usedInlineBy = inline.get(m.keyPrefix) ?? [];
    const usedAsCoverBy = m.coverOf ? [m.coverOf] : [];
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
  id: string; type: "IMAGE" | "VIDEO"; keyPrefix: string; posterKey: string | null; alt: string | null; caption: string | null;
  width: number | null; height: number | null; durationSec: number | null; sizeBytes: number | null; order: number;
};

export async function getProjectMedia(projectId: string): Promise<{ items: ProjectMediaItem[]; coverImageId: string | null; videoKeyPrefix: string | null }> {
  const [items, p] = await Promise.all([
    prisma.media.findMany({ where: { projectId }, orderBy: { order: "asc" }, select: { id: true, type: true, keyPrefix: true, posterKey: true, alt: true, caption: true, width: true, height: true, durationSec: true, sizeBytes: true, order: true } }),
    prisma.project.findUnique({ where: { id: projectId }, select: { coverImageId: true, videoUrl: true, videoProvider: true } }),
  ]);
  return { items, coverImageId: p?.coverImageId ?? null, videoKeyPrefix: p?.videoProvider === "R2" ? (p.videoUrl ?? null) : null };
}

export type ReconcileReport = { at: string; orphanPrefixes: { prefix: string; objects: number; bytes: number }[]; missingObjects: { mediaId: string; keyPrefix: string }[]; totalObjects: number; totalBytes: number };

export async function getLatestReconcile(): Promise<ReconcileReport | null> {
  const row = await prisma.auditLog.findFirst({ where: { action: "media.reconcile" }, orderBy: { createdAt: "desc" }, select: { diff: true } });
  return (row?.diff as ReconcileReport | null) ?? null;
}
