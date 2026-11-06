# Death reports: offline intake and attributed analysis

[Task #166](https://github.com/diegoami/mandos/issues/166) tracks the complete
capture -> report -> diagnosis -> action loop. The [plan](../tasks/death-corpus-plan.md)
separates existing replay tools from missing operational capture.

The first offline slice is `tools/deaths.mjs`. It creates discoverable death-case
reports from **already exported public** `better-borg/runs@1` records, appends
attributed analysis revisions and derives a case/cohort/action index. It does
not play/replay a game, record video, export a browser profile, call a model or
GitHub, file issues, or automatically capture/diagnose every live death.

## Intake

From the repository, use Node22+; no packages or engine are needed by this CLI:

```sh
node tools/deaths.mjs --help
node tools/deaths.mjs ingest --record docs/runs/2026-11-05-b99-desktop-death-replay/runs.json --corpus artifacts/death-corpus --source-ref 2690ae09c4166332fa9f5ff8f032e0fb52327bcc
node tools/deaths.mjs index --corpus artifacts/death-corpus
```

Choose a separate corpus directory, initially empty. Never use a source-record
parent, a nonempty unrelated directory or a symlinked path. The source is read
only; no neighboring files are searched or copied. Explicit `--source-locator`
can supply a safe relative path or durable HTTPS URL. An immutable `--source-ref`
is declared source provenance, not a Git/network lookup. The input's SHA-256
always identifies the actual bytes read. Locators outside this checkout are not
guessed from workstation paths. Use `--repository owner/name` for another
record owner and `--origin public-namespace` to separate producer identities.

Legacy rows use source-record hash plus row identity, so repeated seeds across
lives/classes/cohorts do not overwrite one another. An additive nonempty `runKey`
explicitly declares a trusted host event key, unique within `origin`. Do not
reuse a generic profile/character nickname as a global event key. Identical
trusted-key payloads deduplicate; conflicting facts fail visibly. Input keys are
not inferred from seed/name alone. Different raw records remain separate source
occurrences even when they reference one trusted event.

Each death gets an immutable `cases/<id>/case.json` and readable `report.md`.
Unknown context, unattempted/diverged replay and unavailable recording/save
references remain explicit. All non-death outcomes are retained in coverage
receipts: stall, retirement, cap survivor, survived slice, crash, timeout,
failure and unknown. A malformed record/importer failure exits nonzero; it is
not recast as a survivor or successful analysis.

`records/<id>.json` publishes a completed ingestion only after its case files
exist. Interrupted writes can leave harmless orphan files, which are not counted
as completed deaths and are reused on retry. Re-run the same command and then
`index`; it neither deletes nor overwrites immutable facts. The derived index
can always be regenerated. Corrupted content, wrong schemas, invalid analysis
chains and unexpected persisted filenames fail rather than silently vanish.
Hidden pending temporary files are ignored until a complete file is published.
Persisted digests detect accidental modification; they are not signatures or
proof of an author's identity. Keep one coordinated writer per corpus.

## Analysis and linked actions

Write an attributed JSON analysis; [the worked legacy import](example-analysis-input.json)
is an input example. Then:

```sh
node tools/deaths.mjs analyse --corpus <corpus-directory> --case <case-id-from-index> --analysis <analysis-json>
```

Required fields: author, basis (`observed` or `legacy-import`), summary,
disposition, confidence, separate observations/hypotheses, replay status,
evidence references and action references. Optional tool/mechanism describe
provenance and a proposed cause. Supported dispositions are needs-evidence,
hypothesis, confirmed-defect, design-proposal, ordinary-loss and no-bug-found.
A confirmed claim requires observations, assessed confidence and hashed evidence;
the CLI checks structure, not the truth of causal reasoning. Exact replay claims
need an evidence reference and an explicit scope note; the CLI does not verify
a game trajectory. An analysis author remains responsible for those assertions.

Evidence references distinguish `character-known`, `terminal-revealed`,
`engine-diagnostic` and `unspecified` information. Terminal revealed gear is not
proof the Borg knew its properties while deciding. Availability is attributed
and can be present, local-only, unverified, missing or not-captured. The tool
**never follows artifact locators**, reads referenced files or fetches URLs.
A declared availability/hash is not a tool-generated download/load verification.
Only the explicitly selected record/analysis JSON files are read. Absolute,
traversal, file-scheme and authenticated/query-string locators are refused.

Each revision is immutable and hash-chained. Re-importing the same analysis is
idempotent; changing a diagnosis appends another revision. Case facts are never
relabelled as a new analysis. The index shows pending cases, legacy imports,
observed/assessed analyses, dispositions and replay statuses independently.
Unassessed legacy reasoning is not a newly completed diagnosis.

Aggregate mechanism groups keep confirmed defects separate from hypotheses and
design proposals. Linked issue URLs are deduplicated; relationships distinguish
proposed/confirmed actions from historical follow-ups. The CLI does not inspect
live issue states or automatically open/reopen anything. Check the canonical
issue before acting. Per-record cohorts/outcome denominators remain visible;
no pooled survival rate, new fix benefit or causal conclusion is inferred.

## Worked public example

[Example index](example/index.md) imports two **existing committed** records:
the older stage baseline and B99 desktop replay fixture. It contains five
recorded events: three death cases and two retirements, not five deaths. One
legacy diagnosis is imported by reference with unassessed confidence and no
new replay attempt; two cases remain pending. The known historical action is
linked rather than filed again. Nothing was re-diagnosed or played for this
example. The original dirty-build/legacy context and raw causes are preserved.

To reconstruct its deterministic output in a new directory, run the two ingest
commands with those source paths and the same source ref, then append the input
JSON to the seed34/life3 case ID shown in the resulting index. Output location
is not part of case identity. The committed example and its machine-readable
index are small reports, not a recording or private backup.

Bulky videos, traces and saves stay external with content hashes and availability
status. A local artifacts path is not off-machine recovery. Run the existing
public-data scan before publishing generated reports. This CLI is not a general
sanitizer for arbitrary private exports; inputs must be selected public data.

Still open: per-life terminal outbox/crash reconciliation, desktop export,
replay/analysis task execution and verified durable recording transport. A plan
or successful intake cannot claim those bridges exist. Existing replay paths
are unchanged, including the named seed-only collision follow-up. New gameplay
strategy, cheat death and fatal-save changes remain separate work.
