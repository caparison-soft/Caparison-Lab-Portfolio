/**
 * Verifies Row Level Security by connecting as the table owner and then
 * switching to the `anon` role (what the browser-side Supabase key uses).
 *
 *   npx tsx scripts/verify-rls.ts
 *
 * Expects: Inquiry, ContentBlock, Profile, AuditLog unreadable; draft
 * projects invisible; published projects visible; writes rejected.
 */
import "dotenv/config";
import { Client } from "pg";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL is required.");

type Check = { name: string; pass: boolean; detail: string };
const results: Check[] = [];

async function main() {
  const owner = new Client({ connectionString: url });
  await owner.connect();

  const ownerCounts = {
    inquiries: Number((await owner.query('select count(*) from "Inquiry"')).rows[0].count),
    blocks: Number((await owner.query('select count(*) from "ContentBlock"')).rows[0].count),
    projectsAll: Number((await owner.query('select count(*) from "Project"')).rows[0].count),
    projectsPublished: Number((await owner.query(`select count(*) from "Project" where status = 'PUBLISHED' and "deletedAt" is null`)).rows[0].count),
  };

  const rlsOff = await owner.query(`
    select c.relname from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false
    order by 1`);
  results.push({
    name: "RLS enabled on every public table",
    pass: rlsOff.rowCount === 0,
    detail: rlsOff.rowCount === 0 ? "all tables" : `missing on: ${rlsOff.rows.map((r) => r.relname).join(", ")}`,
  });

  const anon = new Client({ connectionString: url });
  await anon.connect();
  await anon.query("set role anon");

  async function count(table: string): Promise<number | string> {
    try {
      return Number((await anon.query(`select count(*) from "${table}"`)).rows[0].count);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  const anonInquiries = await count("Inquiry");
  results.push({ name: "anon cannot read Inquiry", pass: anonInquiries === 0, detail: `anon sees ${anonInquiries}, owner sees ${ownerCounts.inquiries}` });

  const anonBlocks = await count("ContentBlock");
  results.push({ name: "anon cannot read ContentBlock", pass: anonBlocks === 0, detail: `anon sees ${anonBlocks}, owner sees ${ownerCounts.blocks}` });

  const anonProfiles = await count("Profile");
  results.push({ name: "anon cannot read Profile", pass: anonProfiles === 0, detail: `anon sees ${anonProfiles}` });

  const anonAudit = await count("AuditLog");
  results.push({ name: "anon cannot read AuditLog", pass: anonAudit === 0, detail: `anon sees ${anonAudit}` });

  const anonProjects = await count("Project");
  results.push({
    name: "anon sees only published projects",
    // Needs at least one unpublished project to prove the filter; a fresh
    // production database has none, so equality alone passes there.
    pass: anonProjects === ownerCounts.projectsPublished,
    detail: `anon sees ${anonProjects}, published ${ownerCounts.projectsPublished}, total ${ownerCounts.projectsAll}${ownerCounts.projectsAll === ownerCounts.projectsPublished ? " (no drafts to test against)" : ""}`,
  });

  const anonDrafts = await (async () => {
    try {
      return Number((await anon.query(`select count(*) from "Project" where status = 'DRAFT'`)).rows[0].count);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  })();
  results.push({ name: "anon cannot read draft projects", pass: anonDrafts === 0, detail: `anon sees ${anonDrafts} drafts` });

  let insertRejected = false;
  let insertDetail = "";
  try {
    await anon.query(`insert into "Inquiry" (id, name, email, message, "updatedAt") values ('rls-test', 'x', 'x@x.com', 'x', now())`);
    insertDetail = "insert succeeded (BAD)";
    await owner.query(`delete from "Inquiry" where id = 'rls-test'`);
  } catch (e) {
    insertRejected = true;
    insertDetail = e instanceof Error ? e.message : String(e);
  }
  results.push({ name: "anon cannot insert into Inquiry", pass: insertRejected, detail: insertDetail });

  let updateRejected = false;
  let updateDetail = "";
  try {
    const r = await anon.query(`update "Project" set title = title where status = 'PUBLISHED'`);
    updateRejected = r.rowCount === 0;
    updateDetail = `updated ${r.rowCount} rows`;
  } catch (e) {
    updateRejected = true;
    updateDetail = e instanceof Error ? e.message : String(e);
  }
  results.push({ name: "anon cannot update published projects", pass: updateRejected, detail: updateDetail });

  await anon.end();
  await owner.end();

  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed++;
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  —  ${r.detail}`);
  }
  console.log(failed === 0 ? "\nRLS: all checks passed." : `\nRLS: ${failed} check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
