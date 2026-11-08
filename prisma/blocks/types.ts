/** One ContentBlock row as the seed writes it. */
export type Block = { key: string; group: string; label: string; value: string; helpText?: string; type?: "TEXT" | "RICHTEXT" | "URL" | "NUMBER" | "IMAGE" };
