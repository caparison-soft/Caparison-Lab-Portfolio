/**
 * Local stand-in for the Supabase Auth API, for development without Docker.
 * Implements just enough of GoTrue for @supabase/ssr: password sign-in,
 * refresh, get user, sign out, and an empty JWKS so getClaims falls back to
 * server verification. Never used in production; NEXT_PUBLIC_SUPABASE_URL
 * points here only in .env.
 *
 *   node scripts/dev-auth.mjs        (port 54321)
 *
 * Credentials: DEV_AUTH_EMAIL / DEV_AUTH_PASSWORD (defaults below).
 * The user id must exist in local auth.users so the Profile trigger fires.
 */
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.DEV_AUTH_PORT ?? 54321);
const EMAIL = process.env.DEV_AUTH_EMAIL ?? "arif@caparisonsoft.com";
const PASSWORD = process.env.DEV_AUTH_PASSWORD ?? "caparison-dev";
const USER_ID = process.env.DEV_AUTH_USER_ID ?? "11111111-1111-4111-8111-111111111111";
const SECRET = "local-dev-jwt-secret";
const ISS = `http://127.0.0.1:${PORT}/auth/v1`;

const b64 = (s) => Buffer.from(s).toString("base64url");
function sign(payload) {
  const h = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const p = b64(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url");
  return `${h}.${p}.${sig}`;
}
function verify(token) {
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) return null;
  const expect = crypto.createHmac("sha256", SECRET).update(`${h}.${p}`).digest("base64url");
  if (expect !== sig) return null;
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}
const user = () => ({
  id: USER_ID, aud: "authenticated", role: "authenticated", email: EMAIL, email_confirmed_at: "2026-01-01T00:00:00Z",
  phone: "", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [],
  created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z", is_anonymous: false,
});
function session() {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;
  const access_token = sign({ sub: USER_ID, email: EMAIL, aud: "authenticated", role: "authenticated", iss: ISS, iat: now, exp, session_id: crypto.randomUUID(), is_anonymous: false });
  return { access_token, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: crypto.randomBytes(16).toString("hex"), user: user() };
}
const json = (res, code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => { try { r(JSON.parse(d || "{}")); } catch { r({}); } }); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const path = url.pathname;
  if (path === "/auth/v1/.well-known/jwks.json") return json(res, 200, { keys: [] });
  if (path === "/auth/v1/token" && req.method === "POST") {
    const grant = url.searchParams.get("grant_type");
    const body = await readBody(req);
    if (grant === "password") {
      if (body.email === EMAIL && body.password === PASSWORD) return json(res, 200, session());
      return json(res, 400, { code: "invalid_credentials", error_code: "invalid_credentials", msg: "Invalid login credentials" });
    }
    if (grant === "refresh_token") return json(res, 200, session());
    return json(res, 400, { code: "unsupported_grant_type", msg: "Unsupported grant type" });
  }
  if (path === "/auth/v1/user" && req.method === "GET") {
    const auth = req.headers.authorization ?? "";
    const payload = auth.startsWith("Bearer ") ? verify(auth.slice(7)) : null;
    if (!payload) return json(res, 401, { code: "bad_jwt", msg: "invalid JWT" });
    return json(res, 200, user());
  }
  if (path === "/auth/v1/logout" && req.method === "POST") { res.writeHead(204); return res.end(); }
  if (path === "/auth/v1/health") return json(res, 200, { name: "dev-auth", version: "0" });
  json(res, 404, { msg: `dev-auth: no route for ${req.method} ${path}` });
}).listen(PORT, "127.0.0.1", () => console.log(`dev-auth listening on http://127.0.0.1:${PORT} as ${EMAIL}`));
