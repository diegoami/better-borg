#!/usr/bin/env node
/**
 * The upstream watch (process.md §7): one command, the state of every thread
 * we hold upstream - our PRs, our proposals, the watchlist seams - and what
 * moved since the last look.
 *
 * THE ROUTINE (owner directive 2026-11-03): run this before any upstream work
 * and at every sync pass. Movement on OUR threads = the maintainer is
 * processing us - engage (address feedback in the same pass) and keep
 * contributing upstream beside the fork; silence = carry in the fork per the
 * doctrine. The cache (.upstream-watch.json, git-ignored) is what turns
 * "state" into "moved since last time"; delete it to reset the baseline.
 *
 * Usage: node tools/upstream-watch.mjs [--reset]
 * Needs `gh` (the repo's documented optional tool).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/** Every thread we hold upstream. Add a row the day we file; drop it when it
 * closes and lands in a sync pass. `what` is for humans; the tool only reads
 * state, comments count and updatedAt. */
const THREADS = [
  { repo: "neostryder/neo-angband", kind: "pr", num: 429, what: "the noteSpot fix (fixes #428)" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 428, what: "the noteSpot gap" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 430, what: "our load-resume proposal" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 431, what: "our seed-exposure ask" },
  { repo: "neostryder/neo-angband", kind: "pr", num: 432, what: "the input-flush fix (fixes #414)" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 414, what: "the input-flush gap" },
  { repo: "neostryder/neo-angband", kind: "pr", num: 433, what: "RunReport carries the seed (fixes #431)" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 418, what: "watchlist seam we depend on" },
  { repo: "neostryder/neo-angband", kind: "issue", num: 385, what: "watchlist seam we depend on" },
  { repo: "neostryder/neo-angband-mod-borg", kind: "issue", num: 21, what: "our track_step finding (the bounce guard was never ported)" },
];

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cachePath = join(root, ".upstream-watch.json");

function ghJson(args) {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
}

if (process.argv.includes("--reset")) {
  try { unlinkSync(cachePath); } catch { /* nothing to reset */ }
}

let previous = {};
try { previous = JSON.parse(readFileSync(cachePath, "utf8")); } catch { /* first run */ }

const rows = [];
for (const t of THREADS) {
  const view = t.kind === "pr" ? ["pr", "view", String(t.num), "--repo", t.repo, "--json", "state,comments,updatedAt"] : ["issue", "view", String(t.num), "--repo", t.repo, "--json", "state,comments,updatedAt"];
  let data;
  try {
    data = ghJson(view);
  } catch {
    rows.push({ ...t, state: "?", comments: -1, updatedAt: "?", moved: false, error: true });
    continue;
  }
  const key = `${t.repo}#${t.num}`;
  const before = previous[key];
  const moved = before !== undefined && (before.state !== data.state || before.comments !== data.comments.length);
  rows.push({ ...t, state: data.state, comments: data.comments.length, updatedAt: data.updatedAt, moved });
}

const cache = {};
for (const r of rows) if (!r.error) cache[`${r.repo}#${r.num}`] = { state: r.state, comments: r.comments };
writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n");

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("thread", 34) + pad("state", 10) + pad("cmnts", 6) + pad("moved", 7) + "what");
for (const r of rows) {
  console.log(pad(`${r.repo.split("/")[1]}#${r.num} ${r.kind}`, 34) + pad(r.state, 10) + pad(r.error ? "-" : String(r.comments), 6) + pad(r.moved ? "YES" : "", 7) + r.what);
}
const movedRows = rows.filter((r) => r.moved);
console.log("");
if (movedRows.length === 0) {
  console.log("No movement since the last watch. Doctrine: carry in the fork; upstream work stays behind our tickets.");
} else {
  console.log(`MOVED: ${movedRows.map((r) => `${r.repo.split("/")[1]}#${r.num}`).join(", ")} - the maintainer is processing us: engage this pass (owner directive 2026-11-03).`);
}
