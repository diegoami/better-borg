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
if (data.schema !== "mandos/c-bugs@1") fail("unsupported schema");
if (data.policy.upstream_c_submissions !== "paused" || data.policy.automatic_upstream_posts !== false) fail("policy must preserve the owner's C submission pause");
const groups = new Map();
for (const group of data.groups) {
  if (groups.has(group.number)) fail("duplicate source group " + group.number);
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
for (const lead of data.related_port_leads) if (!ids.has(lead.related_c_finding)) fail("unknown related C finding " + lead.id);

const tick = String.fromCharCode(96);
const code = (value) => tick + value + tick;
const esc = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const issue = (number) => number ? "[#" + number + "](https://github.com/diegoami/mandos/issues/" + number + ")" : "intake [#102](https://github.com/diegoami/mandos/issues/102)";
const proposals = (finding) => finding.local_fix_proposals.length ? finding.local_fix_proposals.map((pr) => "[" + pr.repository + "#" + pr.number + "](" + pr.url + ") — " + pr.state + ", " + pr.validation).join("; ") : "none";
const cUrl = (finding) => "https://github.com/angband/angband/blob/" + data.sources.c.commit + "/" + finding.site.split(" ")[0].split(":")[0];
const rustUrl = "https://github.com/diegoami/borg-rs/blob/" + data.sources.borg_rs.commit + "/" + data.sources.borg_rs.path;
const proved = data.findings.filter((f) => f.evidence === "c-game-reproduced").length;
const flags = data.findings.filter((f) => f.evidence === "c-game-flags-only").length;
const lines = [
  "# C Borg bugs and candidates",
  "",
  "This is our maintained catalogue, not an upstream C maintenance commitment. **No submissions to angband/angband.** Proposed fixes stay in our repositories; an owner may later choose to share the list.",
  "",
  "Updated " + data.updated + ". Credit: [borg-rs catalogue](" + rustUrl + "), plus our independent source/scenario checks. Intake [#102](https://github.com/diegoami/mandos/issues/102), broader audit [#93](https://github.com/diegoami/mandos/issues/93).",
  "",
  "The source has **" + data.sources.borg_rs.groups + " numbered groups**. There are **" + data.findings.length + " separately tracked C findings** here: " + proved + " native C-game outcome reproduction, " + flags + " C-game flag-only reproduction, and " + (data.findings.length - proved - flags) + " source checks. Other symptoms in the group inventory remain intake leads. These counts are not a count of confirmed gameplay defects.",
  "",
  "Since the prior source pin, groups 1–33 are unchanged. New groups 34 and 35 contain 14 symptoms; the two transaction-history symptoms overlap group33 and are deduplicated. Returned-command stair behavior produces a separately tracked Neo port lead.",
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
  "## Our fix proposals",
  "",
  "C-source PRs target **" + data.policy.local_pr_base.repository + ":" + data.policy.local_pr_base.branch + "** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. Local PRs may remain drafts and never need to be submitted upstream.",
  "",
  "| Finding | Our proposal | Evidence | Applied/carry |",
  "| --- | --- | --- | --- |"
];
for (const f of data.findings.filter((item) => item.local_fix_proposals.length)) lines.push("| " + f.id + " | " + proposals(f) + " | " + f.evidence + " | " + f.carry + " |");
lines.push("", "A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.", "", "## Classified findings", "", "| ID | Symptom | Priority | Evidence | Neo/Mandos | Tracker |", "| --- | --- | --- | --- | --- | --- |");
for (const f of data.findings) lines.push("| [" + f.id + "](#" + f.id.toLowerCase() + ") | " + esc(f.title) + " | " + f.priority + " | " + f.evidence + " | " + f.neo + " | " + issue(f.tracker) + " |");
for (const f of data.findings) {
  lines.push("", "### " + f.id, "", "**" + f.title + "** — " + f.status + "; " + f.carry + ".", "",
    "Reference: [" + esc(f.site) + "](" + cUrl(f) + "); borg-rs group(s) " + f.source_groups.join(", ") + ". Checked " + f.checked + ".",
    "", f.impact.description, "", f.notes, "",
    "Evidence: **" + f.evidence + "**. " + (f.evidence_path ? "[Reproduction report](" + f.evidence_path.replace(/^docs\//, "") + "). " : "") + (f.evidence_url ? "[Related evidence](" + f.evidence_url + "). " : "") + "Neo/Mandos: **" + f.neo + "**.",
    "", "Our proposals: " + proposals(f) + ". Tracker: " + issue(f.tracker) + ".", "", "Next: " + f.next);
}
lines.push("", "## Related port leads", "");
for (const lead of data.related_port_leads) lines.push("- **" + lead.id + "**: " + lead.title + "; related " + lead.related_c_finding + "; " + issue(lead.tracker) + ". " + lead.note);
lines.push("", "## Complete source-group inventory", "", "This covers all 35 source groups. A group can contain several unrelated causes; a linked finding does not validate its other symptoms.", "", "| Group | Area | Intake / latest note | Detailed IDs |", "| --- | --- | --- | --- |");
for (const group of data.groups) lines.push("| " + group.number + " | " + group.area + " | " + esc(group.summary + ". " + group.review) + " | " + (group.findings.join(", ") || "intake only") + " |");
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
