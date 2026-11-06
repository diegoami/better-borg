# Issue20: cooperative install metadata mutation fix

Candidate source is frozen at9158cf7, based on verified47 main05ea56fc.
The immutable [before proof](../20-storage-before/README.md) is0fd2d12;
[external platform qualification](../20-platform-control/README.md) iscc9379a.
This folder records the **actual production helper/callers**, not the external
wrapper used to qualify the primitive. Raw current Core/SDK/content beta.3,
all seven C corrections, package/lock/manifest/patch units are unchanged.
No lab, owner profile or Neo app was loaded/deployed. No full gate has yet been
claimed; the exact required hosted Node22 run is the remaining merge gate.

## Change and limits

One small [install-mutation helper](../../../src/records/install-mutation.ts)
coordinates SDK fresh get → pure field reducer → set and existing verification
inside a native origin-scoped exclusive Web Lock. It wraps archiveFinishedRun,
bumpLineage, birth-flag set/clear, presenter durable consume and title memory.
Character journal operations keep their existing per-journal queue separately.
No UI/game work, clock, RNG, new ID, backend, capability or Core patch is added.

Browser/Electron contexts require native coordination. Missing/denied locks
fail visibly before storage writes, with no unsafe local-queue fallback. A
positively identified Node realm uses one shared Symbol-keyed Promise queue,
including cooperating copies of the bundle. Node26's native locks property is
not mistaken for a browser-origin guarantee. Node22 is not installed locally;
required hosted Node22 must validate that harness fallback.

The guarantee is for cooperating current-version writers in the supported
healthy host. **Close old tabs/windows/contexts when updating**: a legacy writer
which ignores the lock can still overwrite shared data. There is no promise of
cross-process arbitrary backend atomicity, atomic profile creation or globally
unique cached birth choices. Two pages may still draw from the same cached
lineage even when persisted increments are both retained. Title writes keep
their intentional own-field replacement semantics, not a union of profile IDs.

Refused/thrown reads in flag/title mutations now refuse the write rather than
blindly writing a new bare object and erasing unreadable siblings. These are
intentional data-safety corrections, not unchanged error behavior. Title's
existing readable-persisted-list preference remains; a failed write does not
claim an effective session-only fallback when that old list is still readable.
The session cache still serves unavailable/null reads. Failure logs are honest.

## Actual before/after evidence

Before: four sequential controls pass; four independent-facade concurrent cases
lose archive/counter changes despite true answers. Eight real same-origin-page
attempts had seven affected outcomes. That is an observation, not a failure rate.

After, **no outer lock wrapper**: both Chromium153 on secure loopback and actual
Electron43.2/Chromium150 on neo-angband://game pass the same four sequential,
four concurrent-facade and eight cross-page/window cases, with fresh third reads
and zero lost updates. Electron uses the official standard+secure scheme flags,
fresh owned userData/session/cache/partition and a disposable fixture only.
Its explicit no-sandbox Xvfb launch is not a stock deployment claim. Existing
own-ID stock-controller registration restrictions remain unchanged.

The actual-helper cases additionally confirm:

- Fresh empty default install slot initializes with both archive and counter.
- Archive/counter/flag/title concurrent writes preserve unrelated siblings.
- Real presenter preparation consumes its flag alongside other mutations.
- Duplicate report keys replace the same run instead of duplicating it.
- A reducer throw releases coordination; the next writer succeeds.
- Deliberately missing/denied browser providers return false/no mutation, title
  logs failure, and recovery works after restoring the real provider.
- Native callback throw/busy/queued-abort lifecycle and opaque-origin unsupported
  controls remain separately labelled platform checks, not hidden fallbacks.

[Chromium](chromium.json), [Electron](electron.json), [executed receipt](receipt.json)
and [verification](verification.json) retain snapshots, source/binary hashes and
scope. Every executed source hash matched the frozen code after the run. The
Electron tooling-path setup incident remains in the earlier receipt; no shared
dependency cleanup was performed.

## Focused validation and preserved attempts

Types pass. [Focused source suites](focused.log):116 tests/6 files.
[Own built plugin](plugin.log):29 tests. [Build](build.log) and
[currency](currency.log): current739.3KiB/API2 plugin. Declared grants unchanged.
Read/write/refusal/reducer/verification release, no-blind-write and platform
negative cases are included. Actual Node22/default full is pending hosted CI.
Optional advanced replay is not a gate for this metadata fix.

[Initial focused failure](initial-focused-failure.log) is retained:98/100 passed;
two deferred-create fixtures stopped after eight microtasks before create was
actually entered once coordination added awaits. The same assertions now wait
an explicit actual create-entered signal; the graveyard-inflight fixture likewise
uses its actual callback-entered signal. No seed, timeout or assertion waiver.
An initial missing log-directory redirect ran no tests; one later final probe
was lock-refused before starting. Neither is counted as a pass or a production
failure. An earlier actual-helper pass preceded the guarded-entry/log review
refinement; it is superseded by the frozen receipt here, not reused as current.

## Reproduction

Use the named immutable commits for uncoordinated-before/external-wrapper
controls. On the implementation candidate, use the actual-helper mode:

```sh
flock /tmp/angband-validation.lock node tools/proofs/issue20-platform.mjs \
  --production --frontend-repository /path/to/neo-angband-tracker \
  --out artifacts/fresh-issue20-actual-helper
```

Existing output is refused. Running the obsolete external wrapper around the
new helper is refused to avoid nested acquisition. The fixture uses actual
current functions and declared SDK persistence; it does not launch a controller
or make official stock desktop compatibility a solved issue.
