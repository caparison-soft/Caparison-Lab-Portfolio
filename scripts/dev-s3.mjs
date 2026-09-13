/**
 * Local stand-in for the S3 API that Cloudflare R2 exposes, for development
 * without credentials. Stores objects on disk under .dev-s3/. Implements
 * PUT/GET/HEAD/DELETE object, ListObjectsV2, DeleteObjects, and CORS so the
 * browser can PUT to presigned URLs. Signatures are not verified.
 *
 *   node scripts/dev-s3.mjs        (port 9000)
 *
 * .env points R2_ENDPOINT and NEXT_PUBLIC_CDN_URL here. Never in production.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = Number(process.env.DEV_S3_PORT ?? 9000);
const ROOT = path.resolve(".dev-s3");
fs.mkdirSync(ROOT, { recursive: true });

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "ETag",
};
const safe = (p) => path.normalize(p).replace(/^(\.\.[/\\])+/, "");
const objPath = (bucket, key) => path.join(ROOT, bucket, safe(key));
const metaPath = (bucket, key) => objPath(bucket, key) + ".meta.json";
const xml = (s) => `<?xml version="1.0" encoding="UTF-8"?>${s}`;

function listKeys(bucket, prefix) {
  const base = path.join(ROOT, bucket);
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (!e.name.endsWith(".meta.json")) {
        const key = path.relative(base, full).split(path.sep).join("/");
        if (key.startsWith(prefix)) out.push({ key, size: fs.statSync(full).size, mtime: fs.statSync(full).mtime });
      }
    }
  };
  walk(base);
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const [, bucket, ...rest] = url.pathname.split("/");
  const key = decodeURIComponent(rest.join("/"));
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (!bucket) { res.writeHead(200, cors); return res.end("dev-s3"); }

  // ListObjectsV2
  if (req.method === "GET" && !key && url.searchParams.get("list-type") === "2") {
    const prefix = url.searchParams.get("prefix") ?? "";
    const items = listKeys(bucket, prefix);
    const body = xml(`<ListBucketResult><Name>${bucket}</Name><Prefix>${prefix}</Prefix><KeyCount>${items.length}</KeyCount><MaxKeys>1000</MaxKeys><IsTruncated>false</IsTruncated>${items.map((i) => `<Contents><Key>${i.key}</Key><Size>${i.size}</Size><LastModified>${i.mtime.toISOString()}</LastModified><ETag>"x"</ETag></Contents>`).join("")}</ListBucketResult>`);
    res.writeHead(200, { ...cors, "content-type": "application/xml" }); return res.end(body);
  }
  // DeleteObjects
  if (req.method === "POST" && !key && url.searchParams.has("delete")) {
    let b = ""; for await (const c of req) b += c;
    const keys = [...b.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
    for (const k of keys) { try { fs.rmSync(objPath(bucket, k)); fs.rmSync(metaPath(bucket, k)); } catch {} }
    res.writeHead(200, { ...cors, "content-type": "application/xml" });
    return res.end(xml(`<DeleteResult>${keys.map((k) => `<Deleted><Key>${k}</Key></Deleted>`).join("")}</DeleteResult>`));
  }
  if (!key) { res.writeHead(400, cors); return res.end(); }

  if (req.method === "PUT") {
    const p = objPath(bucket, key);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const chunks = []; for await (const c of req) chunks.push(c);
    fs.writeFileSync(p, Buffer.concat(chunks));
    fs.writeFileSync(metaPath(bucket, key), JSON.stringify({ contentType: req.headers["content-type"] ?? "application/octet-stream", cacheControl: req.headers["cache-control"] ?? null }));
    res.writeHead(200, { ...cors, etag: '"dev"' }); return res.end();
  }
  if (req.method === "GET" || req.method === "HEAD") {
    const p = objPath(bucket, key);
    if (!fs.existsSync(p)) { res.writeHead(404, { ...cors, "content-type": "application/xml" }); return res.end(xml("<Error><Code>NoSuchKey</Code></Error>")); }
    const meta = fs.existsSync(metaPath(bucket, key)) ? JSON.parse(fs.readFileSync(metaPath(bucket, key), "utf8")) : {};
    const size = fs.statSync(p).size;
    res.writeHead(200, { ...cors, "content-type": meta.contentType ?? "application/octet-stream", "content-length": size, "cache-control": meta.cacheControl ?? "no-cache", etag: '"dev"', "accept-ranges": "bytes" });
    if (req.method === "HEAD") return res.end();
    return fs.createReadStream(p).pipe(res);
  }
  if (req.method === "DELETE") {
    try { fs.rmSync(objPath(bucket, key)); fs.rmSync(metaPath(bucket, key)); } catch {}
    res.writeHead(204, cors); return res.end();
  }
  res.writeHead(405, cors); res.end();
}).listen(PORT, "127.0.0.1", () => console.log(`dev-s3 listening on http://127.0.0.1:${PORT}, storing in ${ROOT}`));
