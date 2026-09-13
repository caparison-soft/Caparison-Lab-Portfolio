import "server-only";
import { prisma } from "@/lib/db";
import { headObject, listAll } from "@/lib/r2";
import { logAudit } from "@/lib/audit";
import type { ReconcileReport } from "@/lib/admin/media-queries";

/**
 * Lists R2, groups objects by their media folder, and diffs against Media
 * rows. Reports only; never deletes. Backups and reports are ignored.
 */
export async function reconcileMedia(): Promise<ReconcileReport> {
  const objects = (await listAll("")).filter((o) => !o.key.startsWith("backups/") && !o.key.startsWith("reports/"));
  const byPrefix = new Map<string, { objects: number; bytes: number }>();
  for (const o of objects) {
    const parts = o.key.split("/");
    const prefix = parts.slice(0, parts.length - 1).join("/");
    const cur = byPrefix.get(prefix) ?? { objects: 0, bytes: 0 };
    cur.objects++;
    cur.bytes += o.size;
    byPrefix.set(prefix, cur);
  }
  const media = await prisma.media.findMany({ select: { id: true, keyPrefix: true, type: true, mimeType: true } });
  const known = new Set(media.map((m) => m.keyPrefix));
  const orphanPrefixes = Array.from(byPrefix.entries()).filter(([p]) => !known.has(p)).map(([prefix, v]) => ({ prefix, ...v }));

  const missingObjects: { mediaId: string; keyPrefix: string }[] = [];
  for (const m of media) {
    const probe = m.type === "VIDEO" ? `${m.keyPrefix}/poster.jpg` : `${m.keyPrefix}/w400.webp`;
    if (!(await headObject(probe))) missingObjects.push({ mediaId: m.id, keyPrefix: m.keyPrefix });
  }

  const report: ReconcileReport = {
    at: new Date().toISOString(),
    orphanPrefixes,
    missingObjects,
    totalObjects: objects.length,
    totalBytes: objects.reduce((s, o) => s + o.size, 0),
  };
  await logAudit({ action: "media.reconcile", entity: "Media", diff: report });
  return report;
}
