#!/usr/bin/env node
/** Read-only official-C source/thread watch. Never posts, applies patches or edits issue state. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cacheFile = process.env.MANDOS_C_WATCH_CACHE ?? join(root, "artifacts/c-upstream-watch.json");
const catalogue = JSON.parse(readFileSync(join(root, "docs/c-bugs.json"), "utf8"));
const gh = (args) => JSON.parse(execFileSync("gh", args, {
  encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 20000,
}));
let previous = {};
try { previous = JSON.parse(readFileSync(cacheFile, "utf8")); } catch {}
const next = { threads: {}, recent: {} };
const problems = [];
const api = (path) => {
  try { return gh(["api", path]); }
  catch { problems.push("API read failed: " + path); return null; }
};
const head = api("repos/angband/angband/commits/master");
const reference = catalogue.sources.c.commit;
if (head) {
  next.head = head.sha;
  console.log("Official C master: " + head.sha);
  console.log("Catalogue affected/reference pin: " + reference);
  if (head.sha === reference) console.log("Official source still equals the recorded reference.");
  else {
    const diff = api("repos/angband/angband/compare/" + reference + "..." + head.sha + "?per_page=100");
    if (diff) {
      const paths = new Set((diff.files ?? []).map((file) => file.filename));
      if ((diff.files?.length ?? 0) >= 300) problems.push("Compare reached GitHub's file window; source review is incomplete.");
      console.log("Changed C files versus reference: " + paths.size + "; this is a review signal, not proof of a fix.");
      const matched = catalogue.findings.filter((finding) => finding.references.some((ref) => ref.role === "c" && paths.has(ref.path)));
      for (const finding of matched) console.log(finding.id + ": referenced C context changed; review internal issue " + (finding.tracker ?? "93"));
      const borg = [...paths].filter((path) => path.startsWith("src/borg/"));
      console.log("Changed Borg paths: " + (borg.join(", ") || "none; other engine changes can still affect Borg behavior"));
    }
  }
  if (previous.head && previous.head !== head.sha) console.log("MOVED: official C source head.");
}
let issues = [];
try {
  issues = gh(["issue", "list", "--repo", "diegoami/mandos", "--state", "all",
    "--label", "upstream-c", "--limit", "1000", "--json", "number,body,labels,state"]);
  if (issues.length === 1000) problems.push("Internal issue window reached; board review is incomplete.");
} catch { problems.push("Cannot read internal C trackers."); }
const refs = new Map();
for (const issue of issues) {
  const line = issue.body.split("\n").find((line) => line.startsWith("**Threads**:")) ?? "";
  for (const match of line.matchAll(/angband\/angband#(\d+)/g)) {
    const number = Number(match[1]);
    if (!refs.has(number)) refs.set(number, []);
    refs.get(number).push(issue.number);
  }
}
for (const [number, trackers] of refs) {
  const item = api("repos/angband/angband/issues/" + number);
  if (!item) continue;
  const pr = item.pull_request ? api("repos/angband/angband/pulls/" + number) : null;
  const snapshot = { state: pr?.merged_at ? "merged" : item.state,
    updated: item.updated_at, comments: item.comments, head: pr?.head?.sha ?? null };
  next.threads[number] = snapshot;
  const changed = previous.threads?.[number] && JSON.stringify(previous.threads[number]) !== JSON.stringify(snapshot);
  console.log("angband/angband#" + number + ": " + snapshot.state + (changed ? " MOVED" : "") + "; internal " + trackers.join(","));
}
const query = encodeURIComponent("repo:angband/angband is:pr borg");
const recent = api("search/issues?q=" + query + "&sort=updated&order=desc&per_page=100");
if (recent) {
  if (recent.incomplete_results) problems.push("GitHub discovery search returned incomplete results.");
  const changed = [];
  for (const item of recent.items ?? []) {
    const snapshot = { state: item.state, updated: item.updated_at, comments: item.comments };
    next.recent[item.number] = snapshot;
    if (previous.recent && JSON.stringify(previous.recent[item.number]) !== JSON.stringify(snapshot)) changed.push(item);
  }
  console.log("Discovery window: " + (recent.items?.length ?? 0) + " most recently updated Borg PRs of " + recent.total_count + " matching open/closed PRs.");
  console.log("Discovery window is not a complete historical duplicate search; review a finding's older issue/PR history separately.");
  if (!previous.recent) console.log("First discovery baseline recorded; use the official PR board for initial review.");
  for (const item of changed) console.log("REVIEW: " + item.html_url + " — " + item.title + " (" + item.state + ")");
}
console.log("Known official C threads: " + refs.size + "; local C proposals are watched by tools/upstream-watch.mjs.");
console.log("A merged/closed upstream item does not apply a local correction. Internal issues own fixed/carried/partial state.");
console.log("Before closing: inspect the actual correction, adopt with our changes, rebuild and verify. Remove only superseded applied patch hunks.");
if (problems.length) {
  for (const problem of problems) console.error("INCOMPLETE: " + problem);
  console.error("Previous successful watch baseline retained.");
  process.exitCode = 1;
} else {
  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(next, null, 2) + "\n");
}
