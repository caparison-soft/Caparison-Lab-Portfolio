import type { Block } from "./types";

/**
 * Home on black, the lower sections (2026-11-07). Copy those sections need
 * that had no block before. Register in prisma/blocks/index.ts.
 */
export const blocks: Block[] = [
  { key: "home.cta.button", group: "Homepage", label: "Closing: main button", value: "Get a free website review", helpText: "Opens the contact page with the review option picked." },
];
