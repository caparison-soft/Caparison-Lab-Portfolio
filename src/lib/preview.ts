import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Signed token for "preview as visitor" links to draft projects. */
export function signPreview(slug: string): string {
  return createHmac("sha256", env.DRAFT_PREVIEW_SECRET).update(`preview:${slug}`).digest("base64url").slice(0, 32);
}

export function verifyPreview(slug: string, token: string | undefined): boolean {
  if (!token || token.length !== 32) return false;
  const expected = Buffer.from(signPreview(slug));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
