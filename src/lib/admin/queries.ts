import "server-only";
import { prisma } from "@/lib/db";

export type DashboardData = {
  counts: {
    projectsPublished: number;
    projectsDraft: number;
    projectsArchived: number;
    capabilities: number;
    testimonials: number;
    media: number;
  };
  inquiries: { total: number; unread: number };
  recentInquiries: {
    id: string; name: string; email: string; company: string | null; budgetBand: string | null; message: string;
    status: "NEW" | "READ" | "REPLIED" | "QUALIFIED" | "WON" | "LOST"; createdAt: string; sourceProject: { title: string; slug: string } | null;
  }[];
  activity: { id: string; action: string; entity: string; entityId: string | null; createdAt: string; userEmail: string | null; diff: unknown }[];
  lastRevalidation: string | null;
};

export async function getDashboard(): Promise<DashboardData> {
  const [projectsPublished, projectsDraft, projectsArchived, capabilities, testimonials, media, inquiriesTotal, unread, recent, activity, lastRevalidation] =
    await Promise.all([
      prisma.project.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.project.count({ where: { status: "DRAFT", deletedAt: null } }),
      prisma.project.count({ where: { status: "ARCHIVED", deletedAt: null } }),
      prisma.capability.count(),
      prisma.testimonial.count({ where: { deletedAt: null } }),
      prisma.media.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, company: true, budgetBand: true, message: true, status: true, createdAt: true, sourceProject: { select: { title: true, slug: true } } },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, action: true, entity: true, entityId: true, createdAt: true, diff: true, user: { select: { email: true } } } }),
      prisma.auditLog.findFirst({ where: { action: "site.revalidate" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ]);

  return {
    counts: { projectsPublished, projectsDraft, projectsArchived, capabilities, testimonials, media },
    inquiries: { total: inquiriesTotal, unread },
    recentInquiries: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    activity: activity.map((a) => ({ id: a.id, action: a.action, entity: a.entity, entityId: a.entityId, createdAt: a.createdAt.toISOString(), userEmail: a.user?.email ?? null, diff: a.diff })),
    lastRevalidation: lastRevalidation?.createdAt.toISOString() ?? null,
  };
}
