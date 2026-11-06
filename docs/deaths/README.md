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
only; no neighboring files are searched or copied. Only the explicit
`better-borg/runs@1` format is supported; older pre-schema documents fail
visibly rather than being guessed into a different record shape. Explicit `--source-locator`
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
occurrences even when they reference one trusted event. The uniqueEvents field
counts these declared intake identities, not independently proven natural
deaths; fallback record hashes cannot identify every historical alias.

Each death gets an immutable `cases/<id>/case.json` and readable `report.md`.
Missing or null legacy context, unattempted/diverged replay and unavailable recording/save
references remain explicit. All non-death outcomes are retained in coverage
receipts: stall, retirement, cap survivor, survived slice, crash, timeout,
failure and unknown. A malformed record/importer failure exits nonzero; it is
not recast as a survivor or successful analysis.

`records/<id>.json` publishes a completed ingestion only after its case files
exist. Interrupted writes can leave harmless orphan files, which are not counted
as completed deaths and are reused on retry. Normal exceptions release the
writer lock; after any required recovery, re-run the same command and then
`index`. Neither operation deletes or overwrites immutable facts. The derived index
can always be regenerated. Corrupted content, wrong schemas, invalid analysis
chains and unexpected persisted filenames fail rather than silently vanish.
Hidden pending temporary files are ignored until a complete file is published.
Explicit input files and each managed immutable JSON/report have an 8 MiB UTF-8
byte limit; expanded output is checked before publication, so an oversized
receipt cannot poison subsequent reads. The final receipt is preflighted before
any case file is written, avoiding large orphan batches. Derived indexes are rebuildable views.
Persisted digests detect accidental modification; they are not signatures or
proof of an author's identity.

All mutations, including index regeneration, acquire one atomic corpus writer
lock. A competing process fails visibly instead of racing analysis revision
numbers or publishing a stale index. Locks contain temporary PID/host/token
metadata and are ignored by Git along with unpublished temporary files. They
are not report provenance or a distributed coordination service. Keep one
coordinated writer per corpus; do not transfer an actively written corpus.

A killed process can leave a stale lock. Confirm the original writer has stopped,
then inspect and explicitly recover the **same token**:

```sh
node tools/deaths.mjs inspect-lock --corpus <corpus-directory>
node tools/deaths.mjs recover-lock --corpus <corpus-directory> --token <inspected-token> --stopped yes
```

A still-present local PID is refused; no writer is automatically killed or lock
stolen. If that PID was reused or the lock came from another host, independently
verify the actual stopped owner before manual/operator recovery. Interrupted
recovery claims or malformed metadata require explicit inspection; the tool does
not silently delete them. Successful recovery only unlocks; retrying intake and
`index` completes the receipt-last transaction. These are process-crash controls,
not a claim of power-loss or private off-machine backup verification.

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
The observed basis means a new attributed review of supplied evidence, not
automatically a fresh game or replay. A confirmed claim requires observations,
assessed confidence and hashed evidence;
the CLI checks structure, not the truth of causal reasoning. Exact replay claims
need a usable (`present` or `local-only`) hashed evidence locator and an explicit
scope note; the CLI does not verify
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
Unassessed legacy reasoning is not a newly completed diagnosis. Initial capture
artifact availability stays visible separately from later analysis evidence;
adding an assessment does not erase a missing recording or save marker.
The initial not-captured markers mean the selected raw record supplied no such
artifact to this intake; they are not a search of all historical files. Later
analysis can link an existing trace separately without rewriting initial facts.

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
legacy diagnosis is imported by reference with unassessed confidence. A separate
[actual offline B99 assessment](b99-assessment-input.json) reads the recorded
trace and immutable engine code, concluding needs-evidence/low confidence rather
than a root cause. Its observed stationary west commands are not proof of a
movement loop: walk can also mean melee, and the trace lacks map/enemy/status/
inventory/branch facts. Pre-command HP0 is not an invented fatal HP snapshot.
It proposes matching-build dossier/context capture under existing issue166; the
legacy action32 remains historical. One case remains pending. No game or replay
was executed, no fresh recording was made and no new gameplay bug was filed. The original dirty-build/legacy context and raw causes are preserved.

To reconstruct its deterministic output in a new directory, run the two ingest
commands with those source paths and the same source ref, then append the legacy input
JSON to seed34/life3 and the B99 input JSON to seed99110530/life1 using their case
IDs from the resulting index. Output location
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

The report-delivering live profile and explicit download/import/ACK bridge are
documented in [LIVE-EXPORT.md](LIVE-EXPORT.md). Public-tier hosts without a full
terminal report remain unsupported; no existing lab was deployed by this change.
