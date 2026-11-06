# Durable death reports and action aggregation

**PARKED plan — preserved advanced work, not current Mandos authorization.**
[Scope181](https://github.com/diegoami/mandos/issues/181) and
[the consumer contract](../MANDOS-SCOPE.md) retain basic bug/run/death evidence
but park the broader166 capture/feedback/analysis pipeline. Existing delivered
code and unfinished110d682/ca627bf WIP remain. This plan does not require PR433,
advanced replay or a modified engine for normal play/upgrades, and does not
trigger an automatic migration or new implementation.

Owner request, 2026-11-06. Canonical task: [Mandos #166](https://github.com/diegoami/mandos/issues/166).
Parent coordination: [workspace #16](https://github.com/diegoami/angband-workspace/issues/16).
This is the audited contract, not a claim of an implemented every-death service.
The approved first offline intake/analysis/index slice is documented in the
[operator guide](../deaths/README.md); live capture/export and automatic analysis
execution remain follow-ups. Existing C-fix carries keep priority and independent
task branches.

## What exists, and what is missing

Audit pin: `2690ae09c4166332fa9f5ff8f032e0fb52327bcc`. These are code/committed-fixture
observations, not a new live-lab run or a check of private owner data.

| Requirement | Existing implementation and evidence | Remaining work |
| --- | --- | --- |
| Raw headless life record | [runner writes runs.json](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/tools/runs.mjs#L171-L216); [per-life fields](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/run-record.ts#L81-L118): birth/context, outcome, census, uncertainty and build provenance | Intake into a durable case corpus; visible failures. Current runner waits for the session before writing its record. |
| Desktop death survives the character | [install archive](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/records/journal.ts#L561-L609), keyed by host run key; [deleted-character regression](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/records/journal.test.ts#L524-L552) | Local install storage is not repository export, a full fatal save or completed analysis. Unknown keys/storage failures need explicit reconciliation. |
| Replay and short pre-death windows | [manual CLI](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/tools/replay.mjs#L109-L164); [comparison](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/postmortem/replay.ts#L245-L285); remembered map, messages, decisions, pack/equipment/home in [dossiers](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/postmortem/dossier.ts#L59-L104) | Offline work queue/coverage status; exact, diverged and missing-input outcomes remain distinct. CLI is not automatically invoked for each death. |
| Diagnosis and actions | [manual workflow](../postmortem.md), [one committed diagnosis](../runs/2026-11-03-stage-baseline-c2d1/postmortem/seed-34/diagnosis.md); completed [#29](https://github.com/diegoami/mandos/issues/29) and [#54](https://github.com/diegoami/mandos/issues/54) | Structured pending/reviewed diagnosis revisions and canonical action links; no automatic diagnosis worker exists. |
| Aggregation | [run summary](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/run-record.ts#L228-L275) counts outcomes, stage reach and uncertainty | Cross-report diagnosis/root-cause/action aggregation, missing-evidence backlog and denominators. Current uncertainty totals are not completed causal diagnoses. |
| Live operational coverage | [lab check](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/tools/lab.mjs#L87-L123) reads local log notices | No automatic desktop export/publish/analysis bridge is implemented. This audit did not execute that tool against owner logs. |

A read-only inventory of tracked `docs/runs` at the pin found 59 `runs.json`
documents, 76 death-entry occurrences and one stall occurrence in 30 documents,
12 offset dossier pages and one `diagnosis.md`. Occurrences are not unique
natural deaths: regression/replay records may describe the same case. These
counts are neither a diagnosis-completion percentage nor a live-lab census.

Copyable inventory without reading any ignored or live files:

```sh
python3 - <<'PYTHON'
import json, subprocess
pin = '2690ae09c4166332fa9f5ff8f032e0fb52327bcc'
files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', pin, '--', 'docs/runs'], text=True).splitlines()
records = [name for name in files if name.endswith('/runs.json')]
deaths = stalls = documents = 0
for name in records:
    data = json.loads(subprocess.check_output(['git', 'show', pin + ':' + name], text=True))
    runs = data.get('runs', []) if isinstance(data, dict) else []
    dead = sum(run.get('dead') is True for run in runs)
    stalled = sum('stall' in run for run in runs)
    deaths += dead
    stalls += stalled
    documents += bool(dead or stalled)
print(len(records), deaths, stalls, documents)
print(sum('/postmortem/' in name and '/offset-' in name and name.endswith('.md') for name in files))
print([name for name in files if name.endswith('/diagnosis.md')])
PYTHON
```

Actual output: `59 76 1 30`, then `12`, then the single seed-34 diagnosis path
linked above. No gameplay/replay test was rerun for this prose audit; the named
current replay fixture already passed its five standalone controls and the
current full 1,190-test gate. Historical exactness remains case/build-specific.

## Storage and identity contract

Use Git as the primary small-report store. Keep existing immutable session
records and dossier directories under `docs/runs/`; add case manifests/analysis
revisions beside those records and a generated repository index, provisionally
`docs/deaths/`. A wiki could link that index, but must not become a second
editable source of truth. No dashboard/server is needed for the first result.

The case identifier must include the immutable source-record hash and run/life
identity, with source repository/build context. Prefer a namespaced host run key
when available; retain seed, race/class and row identity as provenance. Never use
seed alone. The current [CLI output path](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/tools/replay.mjs#L207-L212)
uses only `seed-<n>`, so repeated-seed/different-life input needs a collision test
before it can serve a general corpus. This is a source-level risk, not a claim
that a live record was observed lost in this audit. Preserve old paths/links.

A proposed immutable case manifest contains:

- Case/source record identifiers and hashes, run/life identity, source build,
  package/patch/plugin/content fingerprints, accepted birth inputs and options,
  race/class, stage/cohort, limits and any intervention. Missing legacy inputs
  remain missing; an identity is not reconstructed by guessing.
- Raw terminal outcome and engine cause, turn/decision/energy units where
  actually recorded, endpoint facts and source references. Deaths, stalls,
  retirements, cap survivors, crashes/timeouts and importer failures are separate.
- Recording/trace/message/decision-tail/dossier/replay/pre-death-save references,
  with content hash, format/size, locator and availability/load-validation status.
  Mark `not-captured`, `unavailable` or `diverged` rather than inventing artifacts.
- Initial analysis state `pending-diagnosis` and an intake receipt. Preserve
  uncertainty and knowledge gaps as observations, not an inferred cause.

Small text/JSON reports belong in Git; bulky video, full traces and save binaries
remain outside Git with durable locators and hashes. An ignored workstation
`artifacts/` path is not verified off-machine availability. Use existing approved
artifact transport when available; do not bypass OAuth/private-recovery gates or
publish owner profiles to make a public link. A reference may honestly be local-
only or unavailable while the report itself remains discoverable.

Raw facts and completed evidence are immutable. Append numbered analysis
revisions with author/tool/source identity rather than replacing a diagnosis
without a trail. A generated index is a derived view of those immutable inputs,
not another manually maintained carry/bug table. Re-import is idempotent; a
conflicting payload for the same trusted identity is an ingestion error with
visible evidence, not an overwrite. Historical aliases/replayed cases can link
to their origin; duplicate seeds alone do not establish duplicate events.

## Diagnosis and aggregation contract

A diagnosis revision states what happened, what information/choices the Borg
actually had, the observed consequence, proposed mechanism and alternatives,
confidence, exact code/evidence references, and linked existing/new action
issues. Its disposition can be `needs-evidence`, `hypothesis`, `confirmed-defect`,
`design-proposal`, `ordinary-loss` or `no-bug-found`. No death alone proves a bug.

Replay status is independent of diagnosis state: `not-attempted`, `exact`,
`diverged`, `missing-input` or `failed`. Exact means the declared checks passed
under the named build/context; a shared seed or current engine version is not
proof. If analysis later changes, append a revision and preserve its earlier
reasoning. An exact replay may still have an uncertain cause.

An offline agent/session can claim a pending case, inspect the existing ladder
and code, and append analysis. No model/network call belongs in the gameplay
controller. Human review/play remains optional; unattended diagnosis is not
claimed implemented merely because a template or queue exists.

Aggregation must show all cases/cohort outcomes and review completeness first,
then recurring supported mechanisms, affected classes/stages/builds, observed
cost/severity and canonical action links. Distinguish death frequency from proved
fix benefit; do not combine unrelated builds/cohorts into a survival claim.
Group by supported mechanism, not just the killer string. Preserve unknowns,
ordinary losses and unreviewed cases in denominators. Repeated manifestations
attach evidence to an existing canonical issue; the summary must not open one
duplicate bug per victim. Hypothesis/strategy experiments remain proposals.

## The death/save boundary

The pinned engine [death branch](https://github.com/diegoami/neo-angband-tracker/blob/f186aa1fce2e590eb9bbcb91dc369f3f8b6af688/packages/web/src/main.ts#L11710-L11736)
marks the attached slot dead and drops resumable bytes before
[run report publication](https://github.com/diegoami/neo-angband-tracker/blob/f186aa1fce2e590eb9bbcb91dc369f3f8b6af688/packages/web/src/main.ts#L11794-L11809).
The install graveyard survives; it is not a full fatal-dungeon save. Publication
follows death knowledge revealing equipment/home. Label terminal revealed data
separately from pre-decision character-known evidence: do not say the Borg knew
a property before death merely because it appeared in the terminal report.

First delivery needs no cheat death, delayed rebirth or negative-HP reload.
Record whether a living checkpoint exists and actually loads, and otherwise
replay from known start inputs. Adding fatal snapshots or changing save/death
semantics is a separate API/observational-neutrality investigation, not a promise
hidden in the report feature. The native C consumer has different save/Borg
memory constraints and owns its own implementation.

## Bounded implementation phases

**A. Offline intake/index, after this plan's review.** Proposed first command:
`node tools/deaths.mjs ingest --record <runs-directory> --corpus <output>`.
The reviewed offline slice now implements this command; the original audit
predates it. Consume an existing public run record, create
one small pending case per death and a deterministic index, and retain all
non-death outcomes in coverage totals. Do not run the game, generate a diagnosis,
call GitHub or mutate source records. Its coverage claim is deaths in its
successfully ingested inputs, not every historical/live lab death.

Required controls: repeated seed/different life/class/session, duplicate import,
same-key conflicting payload, absent identity/birth data, malformed source,
missing artifact, output refusal, crash/retry and no source overwrite. At least
two case entries must prove they cannot collide. An importer failure is visible
and exits nonzero; it is never converted into a survivor or silently omitted.

**B. Analysis revisions and actionable aggregation.** Use a committed existing
death and its pinned dossier/diagnosis as the first worked example; retain
legacy context/availability limits rather than rerunning it under new code and
claiming exactness. Add a second case with a different review/unknown disposition
and demonstrate deterministic aggregate counts, evidence links and deduplicated
action proposals. A completed diagnosis needs a signed/attributed revision,
not a renamed pending stub. No automatic tuning or new gameplay policy.

**C. End-to-end capture/export.** Integrate a durable terminal outbox/explicit
export into headless life completion and the desktop archive boundary only after
the offline contract is proved. Current headless writing waits for the full
session; a later batch failure can precede final disk output. Prove each ended
life is reconciled even after restart, write refusal, duplicate delivery, replay
failure or analyser failure. Do not claim every desktop death until this bridge
is implemented and verified on an authorised disposable profile. Local install
storage or `lab check` success alone is insufficient. Existing #56 stall work
and #28 inventory decision events remain linked tasks, not duplicated features.

**D. Repeatable feedback loop.** Schedule/claim pending analysis work through
normal session coordination, regenerate the derived index and propose priority
actions from supported clusters. The parent and component checkpoints retain
ownership. Agree a bounded execution cadence; this plan installs no daemon or
unattended worker. Bugs and verified carries continue to outrank speculative
strategy infrastructure.

A phase-A implementation PR may close its own bounded subtask, but #166 stays
open until the owner-requested capture/report/diagnosis/aggregation loop actually
works. No runtime/controller/dependency/manifest/patch/plugin/private-data change
is made by this plan PR. The current task creates no recording, alters no save,
launches no lab and makes no upstream submission.
