// Copies the ffmpeg.wasm core (single-threaded build, no COOP/COEP headers
// needed) into public/ffmpeg so the admin can load it same-origin. Runs on
// postinstall; public/ffmpeg is gitignored (the wasm alone is 31 MB).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/@ffmpeg/core/dist/umd");
const dest = join(root, "public/ffmpeg");
if (!existsSync(src)) { console.warn("copy-ffmpeg-core: @ffmpeg/core not installed, skipping"); process.exit(0); }
mkdirSync(dest, { recursive: true });
for (const f of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) copyFileSync(join(src, f), join(dest, f));
console.log("copy-ffmpeg-core: public/ffmpeg ready");
