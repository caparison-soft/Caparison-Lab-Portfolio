import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: Prisma.InputJsonValue;
};

/** Append-only activity log. Never throws: a failed log must not fail the action. */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { userId: input.userId ?? null, action: input.action, entity: input.entity, entityId: input.entityId ?? null, diff: input.diff },
    });
  } catch (error) {
    console.error("auditLog.create failed", error);
  }
}
