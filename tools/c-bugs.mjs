#!/usr/bin/env node
/** Local C-bug catalogue renderer. Offline; never posts, fetches or applies patches. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const input = join(root, "docs/c-bugs.json");
const output = join(root, "docs/C-BUGS.md");
const data = JSON.parse(readFileSync(input, "utf8"));
const fail = (message) => { throw new Error("c-bugs: " + message); };
if (data.schema !== "mandos/c-bugs@2") fail("unsupported schema");
if (data.policy.upstream_c_submissions !== "paused" || data.policy.automatic_upstream_posts !== false) fail("policy must preserve the owner's C submission pause");
const referenceRoles = new Set(["c", "neo", "mandos", "borg_rs"]);
function checkReference(ref, id) {
  if (!ref || !referenceRoles.has(ref.role) || !/^[0-9a-f]{40}$/.test(ref.commit)
    || !Number.isInteger(ref.start) || !Number.isInteger(ref.end)
    || ref.start < 1 || ref.end < ref.start || !ref.path || ref.path.includes(".."))
    fail("missing/invalid pinned line reference " + id);
  const source = ref.role === "neo" ? data.sources.neo_borg : data.sources[ref.role];
  if (ref.repository !== source.repository || ref.commit !== source.commit)
    fail("reference disagrees with source pin " + id);
}
const groups = new Map();
for (const group of data.groups) {
  if (groups.has(group.number)) fail("duplicate source group " + group.number);
  checkReference(group.discovery_reference, "group " + group.number);
  groups.set(group.number, group);
}
if (groups.size !== data.sources.borg_rs.groups) fail("source group count differs");
for (let n = 1; n <= groups.size; n++) if (!groups.has(n)) fail("missing source group " + n);
const ids = new Set();
const levels = new Set(["source-checked", "c-game-reproduced", "c-game-flags-only"]);
const statuses = new Set(["investigate", "local-proposal", "held-impact", "review-only"]);
for (const finding of data.findings) {
  if (!/^CBUG-\d{4}$/.test(finding.id) || ids.has(finding.id)) fail("invalid/duplicate finding " + finding.id);
  ids.add(finding.id);
  if (!finding.references?.some((ref) => ref.role === "c")) fail("no C code reference " + finding.id);
  for (const ref of finding.references) checkReference(ref, finding.id);
  if (!levels.has(finding.evidence) || !statuses.has(finding.status)) fail("unknown evidence/status " + finding.id);
  if (!["high", "med", "low"].includes(finding.priority)) fail("unknown priority " + finding.id);
  if (!["carried", "not-carried", "partially-carried"].includes(finding.carry)) fail("missing carry " + finding.id);
  for (const number of finding.source_groups) if (!groups.has(number)) fail("unknown source group " + finding.id);
  if (finding.evidence_path && !existsSync(join(root, finding.evidence_path))) fail("missing evidence " + finding.id);
  if (finding.patch && !existsSync(join(root, finding.patch))) fail("missing patch " + finding.id);
  for (const pr of finding.local_fix_proposals) {
    if (!pr.repository.startsWith(data.owner + "/")) fail("C fix proposal is outside our repositories: " + finding.id);
    if (pr.url !== "https://github.com/" + pr.repository + "/pull/" + pr.number) fail("PR URL/repository mismatch " + finding.id);
    if (pr.repository === data.policy.local_pr_base.repository && pr.base !== data.policy.local_pr_base.branch) fail("C-source PR has wrong base " + finding.id);
    if (pr.applied && finding.carry === "not-carried") fail("application/carry mismatch " + finding.id);
  }
}
for (const group of data.groups) for (const id of group.findings) {
  const finding = data.findings.find((item) => item.id === id);
  if (!finding || !finding.source_groups.includes(group.number)) fail("broken group/finding link " + id);
}
for (const finding of data.findings) for (const n of finding.source_groups) {
  if (!groups.get(n).findings.includes(finding.id)) fail("missing reverse group link " + finding.id);
}
for (const lead of data.related_port_leads) {
  if (!ids.has(lead.related_c_finding)) fail("unknown related C finding " + lead.id);
  for (const ref of lead.references ?? []) checkReference(ref, lead.id);
}

const tick = String.fromCharCode(96);
const code = (value) => tick + value + tick;
const esc = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const issue = (number) => number ? "[#" + number + "](https://github.com/diegoami/mandos/issues/" + number + ")" : "carry queue [#111](https://github.com/diegoami/mandos/issues/111)";
const proposals = (finding) => finding.local_fix_proposals.length ? finding.local_fix_proposals.map((pr) => "[" + pr.repository + "#" + pr.number + "](" + pr.url + ") — " + pr.state + ", " + pr.validation).join("; ") : "none";
const refUrl = (ref) => "https://github.com/" + ref.repository + "/blob/" + ref.commit + "/" + ref.path + "#L" + ref.start + (ref.end === ref.start ? "" : "-L" + ref.end);
const roleName = { c: "C", neo: "Neo", mandos: "Mandos", borg_rs: "borg-rs" };
const refLink = (ref) => "[" + roleName[ref.role] + " " + ref.path + ":" + ref.start + (ref.end === ref.start ? "" : "–" + ref.end) + "](" + refUrl(ref) + ")";
const compactRefs = (finding) => ["c", "neo", "mandos"].map((role) => finding.references.find((ref) => ref.role === role)).filter(Boolean).map(refLink).join("<br>");
const readable = (value) => String(value).replaceAll("-", " ");
const applicabilityNames = {
  shared: "present in both",
  "no-counterpart": "no corresponding port path",
  "absent-different-pipeline": "C only; different port pipeline",
  "absent-value-simulation": "C only; port uses value simulation",
  "absent-different-ring-simulation": "C only; different ring trial",
  "absent-per-ware-reset": "C only; port resets per ware",
  "no-equivalent-swap-subsystem": "port subsystem missing",
  "absent-no-full-mana-assignment": "C only; no pretend-mana mutation",
  "different-port-defect": "different port defect",
  "partially-shared": "partly shared",
  "shared-helper-semantics": "same guarded condition"
};
const applicability = (finding) => finding.neo === finding.mandos
  ? (applicabilityNames[finding.neo] ?? readable(finding.neo))
  : "Neo: " + (applicabilityNames[finding.neo] ?? readable(finding.neo)) + "; Mandos: " + (applicabilityNames[finding.mandos] ?? readable(finding.mandos));
const rustUrl = "https://github.com/diegoami/borg-rs/blob/" + data.sources.borg_rs.commit + "/" + data.sources.borg_rs.path;
const proved = data.findings.filter((f) => f.evidence === "c-game-reproduced").length;
const flags = data.findings.filter((f) => f.evidence === "c-game-flags-only").length;
const lines = [
  "# C Borg bugs and candidates",
  "",
  "This is our maintained catalogue, not an upstream C maintenance commitment. **No submissions to angband/angband.** Proposed fixes stay in our repositories; an owner may later choose to share the list.",
  "",
  "Updated " + data.updated + ". Credit: [borg-rs catalogue](" + rustUrl + "), plus our independent source/scenario checks. Current refresh [#110](https://github.com/diegoami/mandos/issues/110), carry queue [#111](https://github.com/diegoami/mandos/issues/111), broader audit [#93](https://github.com/diegoami/mandos/issues/93).",
  "",
  "The source has **" + data.sources.borg_rs.groups + " numbered groups**. There are **" + data.findings.length + " separately tracked C findings** here: " + proved + " native C-game outcome reproduction, " + flags + " C-game flag-only reproduction, and " + (data.findings.length - proved - flags) + " source checks. Other symptoms in the group inventory remain intake leads. These counts are not a count of confirmed gameplay defects.",
  "",
  data.source_changes.summary,
  "",
  "A source check establishes code/predicate/state flow, not legal reachability or a changed outcome. Priority ranks validation work. Harmless/dead branches and unproven stacked-ring reachability are explicitly kept below demonstrated failures.",
  "",
  "## Reference pins",
  "",
  "- C: " + code(data.sources.c.commit) + ". The imported 4.2.6 snapshot is a different reference.",
  "- Neo Borg: " + code(data.sources.neo_borg.commit) + ".",
  "- Mandos runtime source checked: " + code(data.sources.mandos.commit) + ".",
  "- Rust source: " + code(data.sources.borg_rs.commit) + "; prior " + code(data.sources.borg_rs.previous_commit) + ".",
  "",
  "## Local fix workflow",
  "",
  "C-source PRs target **" + data.policy.local_pr_base.repository + ":" + data.policy.local_pr_base.branch + "** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. Local PRs may remain drafts and never need to be submitted upstream.",
  "",
  "Current implementation priority: carry validated fixes from both C and Neo in each applicable consumer (tracking [#111](https://github.com/diegoami/mandos/issues/111)). A draft or an absent counterpart does not count as an applied fix."
];
lines.push("", "A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.", "", "## Classified findings", "", "| ID | Finding | Priority | Evidence | Pinned references | Neo/Mandos | Fix proposal | Carry | Tracker |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const f of data.findings) lines.push("| [" + f.id + "](#" + f.id.toLowerCase() + ") | " + esc(f.title) + " | " + f.priority + " | " + readable(f.evidence) + " | " + compactRefs(f) + " | " + applicability(f) + " | " + proposals(f) + " | " + readable(f.carry) + " | " + issue(f.tracker) + " |");
for (const f of data.findings) {
  lines.push("", "### " + f.id, "", "**" + f.title + "** — " + readable(f.status) + "; " + readable(f.carry) + ".", "",
    "Checked " + f.checked + "; borg-rs group(s) " + f.source_groups.join(", ") + ".", "", "Pinned source references:", "");
  for (const ref of f.references) lines.push("- " + refLink(ref) + " — " + esc(ref.description));
  lines.push("", f.impact.description, "", f.notes, "",
    "Evidence: **" + readable(f.evidence) + "**. " + (f.evidence_path ? "[Reproduction report](" + f.evidence_path.replace(/^docs\//, "") + "). " : "") + (f.evidence_url ? "[Related evidence](" + f.evidence_url + "). " : "") + "Neo/Mandos: **" + applicability(f) + "**.",
    "", "Fix proposal: " + proposals(f) + ". Tracker: " + issue(f.tracker) + ".", "", "Next: " + f.next);
}
lines.push("", "## Related port leads", "");
for (const lead of data.related_port_leads) {
  lines.push("- **" + lead.id + "**: " + lead.title + "; related " + lead.related_c_finding + "; " + issue(lead.tracker) + ". " + lead.note);
  for (const ref of lead.references) lines.push("  - " + refLink(ref));
}
lines.push("", "## Complete source-group inventory", "", "This covers all " + data.groups.length + " source groups. A group can contain several unrelated causes; a linked finding does not validate its other symptoms.", "", "| Group | Source reference | Area | Intake / latest note | Detailed IDs |", "| --- | --- | --- | --- | --- |");
for (const group of data.groups) lines.push("| " + group.number + " | " + refLink(group.discovery_reference) + " | " + group.area + " | " + esc(group.summary + ". " + group.review) + " | " + (group.findings.join(", ") || "intake only") + " |");
lines.push("", "## Maintenance", "",
  "Canonical data: [c-bugs.json](c-bugs.json). Regenerate with " + code("node tools/c-bugs.mjs --write") + "; verify with " + code("node tools/c-bugs.mjs --check") + ". The tool is offline and never posts or applies a fix.",
  "",
  "On a borg-rs/source update, compare pinned content (including edits within existing groups), split independent causes, deduplicate shared callers, recheck C/Neo/Mandos separately and update checked dates. Revisit after a local proposal changes, a fix merges, a consumer adopts/reverts it, or an upstream reference changes. A new file or PR is not proof of application.",
  "",
  "Keep local PR ownership/base/head and before/after/control receipts visible. Native C evidence is required before calling a C-game consequence reproduced. If impact is missing, keep the proposal explicitly unvalidated. Local-only C policy is in [RULES.md](../RULES.md), [process](process.md) and [UPSTREAM.md](UPSTREAM.md). No background poller or automatic submission is created.",
  ""
);
const rendered = lines.join("\n");
if (process.argv.includes("--write")) writeFileSync(output, rendered);
else if (!process.argv.includes("--check")) fail("use --write or --check");
else if (!existsSync(output) || readFileSync(output, "utf8") !== rendered) fail("generated catalogue is stale; run --write");
console.log("c-bugs: " + data.groups.length + " groups, " + data.findings.length + " findings, " + data.related_port_leads.length + " related port lead; local-only policy valid");
