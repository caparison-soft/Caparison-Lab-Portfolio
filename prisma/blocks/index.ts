import type { Block } from "./types";
import { blocks as home } from "./home";
import { blocks as services } from "./services";
import { blocks as industry } from "./industry";
import { blocks as chat } from "./chat";
import { blocks as pages } from "./pages";
import { blocks as homeBlack } from "./home-black";

/** Redesign copy (owner, 2026-11-05), merged over the base list by key. */
export const redesignBlocks: Block[] = [...home, ...homeBlack, ...services, ...industry, ...chat, ...pages];
export type { Block };
