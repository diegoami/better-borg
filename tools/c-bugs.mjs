#!/usr/bin/env node
/** Local C-bug catalogue renderer. Offline; never posts, fetches or applies patches. */
import { validateSourceSnapshot } from "./c-bugs-source.mjs";
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
function checkReference(ref, id, baseline = true) {
  if (!ref || !referenceRoles.has(ref.role) || !/^[0-9a-f]{40}$/.test(ref.commit)
    || !Number.isInteger(ref.start) || !Number.isInteger(ref.end)
    || ref.start < 1 || ref.end < ref.start || !ref.path || ref.path.includes(".."))
    fail("missing/invalid pinned line reference " + id);
  const source = ref.role === "neo" ? data.sources.neo_borg : data.sources[ref.role];
  if (baseline && (ref.repository !== source.repository || ref.commit !== source.commit))
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
const levels = new Set(["reported-lead", "source-checked", "c-game-reproduced", "c-game-flags-only"]);
const statuses = new Set(["investigate", "local-proposal", "held-impact", "review-only"]);
for (const finding of data.findings) {
  if (finding.origin !== "upstream-c") fail("port omissions belong on internal issues, not this C catalogue: " + finding.id);
  if (!/^CBUG-\d{4}$/.test(finding.id) || ids.has(finding.id)) fail("invalid/duplicate finding " + finding.id);
  ids.add(finding.id);
  if (!finding.references?.some((ref) => ref.role === "c")) fail("no C code reference " + finding.id);
  for (const ref of finding.references) checkReference(ref, finding.id);
  if (!levels.has(finding.evidence) || !statuses.has(finding.status)) fail("unknown evidence/status " + finding.id);
  if (!["high", "med", "low"].includes(finding.priority)) fail("unknown priority " + finding.id);
  for (const number of finding.source_groups) if (!groups.has(number)) fail("unknown source group " + finding.id);
  if (finding.evidence_path && !existsSync(join(root, finding.evidence_path))) fail("missing evidence " + finding.id);
  if (finding.patch && !existsSync(join(root, finding.patch))) fail("missing patch " + finding.id);
  for (const pr of finding.local_fix_proposals) {
    if (!pr.repository.startsWith(data.owner + "/")) fail("C fix proposal is outside our repositories: " + finding.id);
    if (pr.url !== "https://github.com/" + pr.repository + "/pull/" + pr.number) fail("PR URL/repository mismatch " + finding.id);
    if (pr.repository === data.policy.local_pr_base.repository && pr.base !== data.policy.local_pr_base.branch) fail("C-source PR has wrong base " + finding.id);
  }
}
for (const group of data.groups) for (const id of group.findings) {
  const finding = data.findings.find((item) => item.id === id);
  if (!finding || !finding.source_groups.includes(group.number)) fail("broken group/finding link " + id);
}
for (const finding of data.findings) for (const n of finding.source_groups) {
  if (!groups.get(n).findings.includes(finding.id)) fail("missing reverse group link " + finding.id);
}
if (data.related_port_leads?.length) fail("port leads must stay on internal issues, not the C community list");
for (const claim of data.report_coverage.source_claims) {
  if (!groups.has(claim.group) || claim.start < 1 || claim.end < claim.start || !claim.finding_ids.length)
    fail("invalid reported-claim coverage");
  for (const id of claim.finding_ids) if (!ids.has(id)) fail("reported claim has no finding: " + id);
}
for (const group of data.groups) if (!data.report_coverage.source_claims.some((claim) => claim.group === group.number))
  fail("uncovered source group " + group.number);

validateSourceSnapshot(data, readFileSync(join(root, data.sources.borg_rs.snapshot.path), "utf8"));

const tick = String.fromCharCode(96);
const code = (value) => tick + value + tick;
const esc = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const issue = (number) => number ? "[#" + number + "](https://github.com/diegoami/mandos/issues/" + number + ")" : "intake [#93](https://github.com/diegoami/mandos/issues/93)";
const proposals = (finding) => (finding.local_fix_proposals ?? []).length ? finding.local_fix_proposals.map((pr) => "[" + pr.repository + "#" + pr.number + "](" + pr.url + ") — " + pr.validation).join("; ") : "none";
const refUrl = (ref) => "https://github.com/" + ref.repository + "/blob/" + ref.commit + "/" + ref.path + "#L" + ref.start + (ref.end === ref.start ? "" : "-L" + ref.end);
const roleName = { c: "C", neo: "Neo", mandos: "Mandos", borg_rs: "borg-rs" };
const refLink = (ref) => "[" + roleName[ref.role] + " " + ref.path + ":" + ref.start + (ref.end === ref.start ? "" : "–" + ref.end) + "](" + refUrl(ref) + ")";
const compactRefs = (finding) => {
  const refs = ["c", "neo", "mandos"].map((role) => finding.references.find((ref) => ref.role === role)).filter(Boolean);
  return (refs.length ? refs : finding.references.filter((ref) => ref.role === "borg_rs").slice(0, 1)).map(refLink).join("<br>");
};
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
const checked = data.findings.filter((f) => f.evidence === "source-checked").length;
const reported = data.findings.filter((f) => f.evidence === "reported-lead").length;
const lines = [
  "# C Borg bugs and candidates",
  "",
  "[Findings](#classified-findings) · [Reuse a fix](#reusing-a-local-c-fix) · [Source inventory](#complete-source-group-inventory)",
  "",
  "This is the C-only catalogue for eventual Angband community use. Port omissions stay on our internal issues. **We make no submissions to angband/angband now**; another developer may reuse our linked local proposals. Lead sources may be borg-rs, our own audits/runs or community reports, and validation attribution is kept separate.",
  "",
  "Updated " + data.updated + ". Credit: [borg-rs catalogue](" + rustUrl + "), plus our independent source/scenario checks. Current refresh [#110](https://github.com/diegoami/mandos/issues/110), carry queue [#111](https://github.com/diegoami/mandos/issues/111), broader audit [#93](https://github.com/diegoami/mandos/issues/93).",
  "",
  "The source has **" + data.sources.borg_rs.groups + " numbered groups**. This page maps all **" + data.report_coverage.leaf_reports + " substantive leaf reports** to **" + data.findings.length + " C findings/observations**: " + proved + " native C-game outcome reproduction, " + flags + " flags-only reproduction, " + checked + " source checks and " + reported + " reported leads. Some reports contain related sub-symptoms; shared causes are deduplicated. These are not counts of independently confirmed gameplay bugs.",
  "",
  data.source_changes.summary,
  "",
  "A source check establishes code/predicate/state flow, not legal reachability or a changed outcome. Priority ranks validation work. Harmless/dead branches and unproven stacked-ring reachability are explicitly kept below demonstrated failures.",
  "",
  "## Reference pins",
  "",
  "These pins identify affected/reference code. Fix links identify correction proposals. Our internal issue labels and bodies are the source of truth for current carry/application status; this catalogue does not duplicate that live status.",
  "",
  "- C: " + code(data.sources.c.commit) + ". The imported 4.2.6 snapshot is a different reference.",
  "- Neo Borg: " + code(data.sources.neo_borg.commit) + ".",
  "- Mandos affected baseline inspected: " + code(data.sources.mandos.commit) + ".",
  "- Rust source: " + code(data.sources.borg_rs.commit) + "; prior " + code(data.sources.borg_rs.previous_commit) + ".",
  "",
  "## Local fix workflow",
  "",
  "C-source PRs target **" + data.policy.local_pr_base.repository + ":" + data.policy.local_pr_base.branch + "** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. C proposals use c-proposal/postponed labels and may stay closed/unmerged while their commits, branches and patches remain reusable.",
  "",
  "Current priority: board status first, then triage/catalogue maintenance, then Neo port fixes. With no actionable port bugs, complete the C local-proposal pass; carry validated C corrections in a second pass. Internal issues own current state."
];
lines.push("", readFileSync(join(root, "docs/c-fix-handoff.md"), "utf8"));
lines.push("", "A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.", "", "## Classified findings", "", "| ID | Finding | Priority | Evidence | Pinned references | Neo/Mandos | Fix proposal | Internal issue (status) |", "| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const f of data.findings) lines.push("| [" + f.id + "](#" + f.id.toLowerCase() + ") | " + esc(f.title) + " | " + f.priority + " | " + readable(f.evidence) + " | " + compactRefs(f) + " | " + applicability(f) + " | " + proposals(f) + " | " + issue(f.tracker) + " |");
for (const f of data.findings) {
  lines.push("", "### " + f.id, "", "**" + f.title + "**", "",
    "Checked " + f.checked + "; borg-rs group(s) " + f.source_groups.join(", ") + ".", "", "Pinned source references:", "");
  for (const ref of f.references) lines.push("- " + refLink(ref) + " — " + esc(ref.description));
  if (f.reported_sources?.length) {
    lines.push("", "Reported by borg-rs (lead text, not independent validation):", "");
    for (const report of f.reported_sources) {
      lines.push(refLink(report.reference), "");
      for (const line of report.text.split("\n")) lines.push("> " + line);
      lines.push("");
    }
  }
  if (f.verification_sources?.length) lines.push("", "Independent validation: " + f.verification_sources.map((item) => item.kind + " (" + issue(item.tracker) + ")").join("; ") + ".");
  lines.push("", f.impact.description, "", f.notes, "",
    "Evidence: **" + readable(f.evidence) + "**. " + (f.evidence_path ? "[Reproduction report](" + f.evidence_path.replace(/^docs\//, "") + "). " : "") + (f.evidence_url ? "[Related evidence](" + f.evidence_url + "). " : "") + "Neo/Mandos: **" + applicability(f) + "**.",
    "", "Fix proposal: " + proposals(f) + ". Tracker: " + issue(f.tracker) + ".", "", "Next: " + f.next);
}
lines.push("", "## Complete source-group inventory", "", "All substantive source reports are mapped below. A source report can contain related sub-symptoms; the exact report text and line reference remain available in the linked findings. A reported lead is not silently promoted to a checked defect.", "", "| Group | Source reference | Area | Intake / latest note | Detailed IDs |", "| --- | --- | --- | --- | --- |");
for (const group of data.groups) lines.push("| " + group.number + " | " + refLink(group.discovery_reference) + " | " + group.area + " | " + esc(group.summary + ". " + group.review) + " | " + (group.findings.join(", ") || "intake only") + " |");
lines.push("", "## Maintenance", "",
  "Board/source review: " + code("node tools/upstream-watch.mjs") + " and " + code("node tools/c-upstream-watch.mjs") + ". Review signals never close bugs or apply patches automatically.",
  "",
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
console.log("c-bugs: " + data.groups.length + " groups, " + data.report_coverage.leaf_reports + " source reports, " + data.findings.length + " C findings/observations; C-only/local-only policy valid");
