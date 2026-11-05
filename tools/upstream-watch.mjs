#!/usr/bin/env node
/** Read-only upstream/carry audit. See docs/UPSTREAM.md and process sections 6–7. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TRACKER = "diegoami/mandos";
const CARRY_LABELS = ["fixed", "carried", "not-carried", "partially-carried"];
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cachePath = process.env.MANDOS_UPSTREAM_WATCH_CACHE ?? join(root, ".upstream-watch.json");
const ghJson = (args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
const labelsOf = (issue) => issue.labels.map((label) => typeof label === "string" ? label : label.name);

if (process.argv.includes("--reset")) {
  try { unlinkSync(cachePath); } catch { /* no baseline */ }
}
let previous = {};
try { previous = JSON.parse(readFileSync(cachePath, "utf8")); } catch { /* first run */ }

let tracking;
try {
  tracking = ghJson(["issue", "list", "--repo", TRACKER, "--state", "all", "--limit", "1000", "--json", "number,title,body,labels,state"])
    .filter((issue) => labelsOf(issue).some((label) => label === "upstream" || label === "upstream-c"))
    .filter((issue) => issue.state !== "CLOSED" || labelsOf(issue).includes("patch-active"));
} catch {
  console.error("upstream-watch: cannot read Mandos tracking issues; check gh access");
  process.exitCode = 1;
  tracking = [];
}

const threads = [];
const candidates = [];
const problems = [];
for (const issue of tracking) {
  const selected = CARRY_LABELS.filter((label) => labelsOf(issue).includes(label));
  const carry = selected.length === 1 ? selected[0] : selected.length === 0 ? "MISSING" : "CONFLICT";
  if (selected.length !== 1) problems.push(`#${issue.number}: carry status ${carry}${selected.length ? ` (${selected.join(", ")})` : ""}`);
  if (carry === "fixed" && issue.state === "OPEN")
    problems.push("#" + issue.number + ": fixed tracker is still open; review closure");
  const local = { number: issue.number, carry, what: `our #${issue.number}: ${issue.title}` };
  const line = issue.body.split("\n").find((text) => text.startsWith("**Threads**:"));
  if (line === undefined) problems.push(`#${issue.number}: missing **Threads**: line (use 'none yet' for an internal candidate)`);
  const refs = [...(line ?? "").matchAll(/([\w.-]+\/[\w.-]+)#(\d+)/g)];
  if (refs.length === 0) candidates.push(local);
  for (const match of refs) threads.push({ ...local, repo: match[1], num: Number(match[2]) });
}

const rows = [];
for (const thread of threads) {
  const key = `${thread.repo}#${thread.num}`;
  try {
    const issue = ghJson(["api", `repos/${thread.repo}/issues/${thread.num}`]);
    const pr = issue.pull_request ? ghJson(["api", `repos/${thread.repo}/pulls/${thread.num}`]) : null;
    const state = pr?.merged_at ? "MERGED" : String(issue.state).toUpperCase();
    const head = pr?.head?.sha ?? null;
    const before = previous[key];
    const moved = before !== undefined && (before.state !== state || before.comments !== issue.comments
      || (before.updatedAt !== undefined && before.updatedAt !== issue.updated_at)
      || (before.head !== undefined && before.head !== head));
    rows.push({ ...thread, kind: pr ? "pr" : "issue", state, head, comments: issue.comments, updatedAt: issue.updated_at, moved });
  } catch {
    problems.push(`${key}: upstream API read failed; previous baseline retained`);
    rows.push({ ...thread, kind: "?", state: "UNKNOWN", moved: false, error: true });
  }
}

if (tracking.length > 0) {
  const cache = {};
  for (const row of rows) {
    const key = `${row.repo}#${row.num}`;
    if (row.error) { if (previous[key]) cache[key] = previous[key]; }
    else cache[key] = { state: row.state, comments: row.comments, updatedAt: row.updatedAt, head: row.head };
  }
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");
}

const pad = (value, width) => String(value).padEnd(width);
console.log(pad("thread", 42) + pad("upstream", 10) + pad("Mandos state", 20) + pad("moved", 7) + "tracker");
for (const row of rows) {
  console.log(pad(`${row.repo}#${row.num} ${row.kind}`, 42) + pad(row.state, 10)
    + pad(row.carry, 20) + pad(row.moved ? "YES" : "", 7) + row.what);
}
if (candidates.length) {
  console.log("\nTrackers without external issue/PR links (may include accepted-commit patches):");
  for (const candidate of candidates) console.log(`${pad(`#${candidate.number}`, 8)}${pad(candidate.carry, 20)}${candidate.what}`);
}
console.log(`\nAudited ${tracking.length} trackers (open or patch-active); ${threads.length} upstream references; ${candidates.length} internal candidates.`);
const moved = rows.filter((row) => row.moved);
console.log(moved.length
  ? `MOVED: ${moved.map((row) => `${row.repo}#${row.num}`).join(", ")} — inspect the changes and update our tracker in this pass; activity may be ours, a maintainer's or a bot's.`
  : rows.some((row) => row.error) || process.exitCode
    ? "No confirmed movement; the upstream audit is incomplete."
    : "No upstream movement since the last baseline.");
console.log("Upstream state and Mandos carry status are independent. Verify release adoption and consumer coverage; this report never changes labels or removes patches.");
if (problems.length) {
  console.log("\nAudit problems:\n" + problems.map((problem) => `- ${problem}`).join("\n"));
  process.exitCode = 1;
}
