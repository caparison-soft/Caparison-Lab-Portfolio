import "server-only";
import { validateEnv } from "./schema";

/** Typed, validated environment. Server-only: never import from a client component. */
export const env = validateEnv(process.env);
