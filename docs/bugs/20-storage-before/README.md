# Issue20: current real-browser lost-update reproduction

Evidence only. No runtime fix, engine patch, capability change, default-gate
change or private data access. Mandos baseline is03fcb3fc; journal/lineage source
is byte-equivalent in the separately reviewed47 candidate6f7c28d.
[Issue20](https://github.com/diegoami/mandos/issues/20) and
[coordination24](https://github.com/diegoami/angband-workspace/issues/24) own scope.

## Actual result

The current beta.3 API2 path still loses updates between independent writers.
Both operations answer true while a fresh public-host read lacks an archive
entry or the counter increment. The historical API1 report was not assumed to
establish this result; actual current API2 host and native browser storage ran.

| Same-page independent facades | Expected retained value | Actual fresh read; both returned true |
| --- | --- | --- |
| Archive cedar + bump | cedar, lineage8 | no archive, lineage8 |
| Bump + archive cedar | cedar, lineage8 | cedar, lineage7 |
| Archive cedar + archive birch | cedar and birch | birch only |
| Two bumps from7 | lineage9 | lineage8 |

The same four operation pairs, awaited sequentially, all preserve the expected
archive/counter and unrelated profileIds/other siblings. Four negative controls
pass; four same-page concurrency contracts fail. There are no delayed/replaced
get/set calls, injected stale snapshots, CAS, lock or transaction shims.

Two pages in the **same fresh browser context and origin**, ordinary concurrent
calls, then a new third page/facade read: eight bounded attempts produced three
lost-archive and four lost-counter results (seven affected attempts). One pair
of simultaneous bumps happened to preserve both increments. These are actual
observations from this run, not an estimated failure probability or guarantee
that every concurrent call loses data. Full snapshots/answers remain in
[result.json](result.json); [summary](summary.json), expected-red [exit1](exit.txt).
Zero browser page errors were observed. Synthetic public run reports carry no
owner data; no game or controller was launched.

## Reproduce without owner profiles

From an installed Mandos checkout with access to the existing public engine
tracker Git objects and its installed Playwright/fflate tooling:

```sh
flock /tmp/angband-validation.lock node tools/proofs/issue20-browser.mjs \
  --frontend-repository /path/to/neo-angband-tracker \
  --out artifacts/fresh-issue20-before
```

Output directories are refused if already present; preserve previous attempts.
The runner uses a new ephemeral Chromium context, not a persistent userDataDir.
It serves only its fresh fixture/bundle on127.0.0.1. It copies committed frontend
source into a temporary tree, then removes only that owned temporary tree and
closes its own browser/server. The retained evidence is not a profile backup.

## Source and platform qualification

- Mandos03fcb3fc, unpatched published Core/SDK/content beta.3. Actual
  archiveFinishedRun and bumpLineage run without edits.
- Official frontend97ceec2925e6715ba725624a61866ab93a196a12: actual createApi2Host,
  default modInstallPrefs and browser localStorage. No injected Storage adapter.
- API2 install storage is public here with an empty capability set. This proves
  the storage contract; it does not register the own-ID Mandos controller or
  override the known official-stock interactive restriction.
- Node v26.13.0 runner, Chromium153.0.8010.12; actual test origin is recorded in
  summary.json. Loopback is a secure context, and Web Locks are available there.
- Official desktop source declares neo-angband://game as standard+secure. This
  custom-scheme Electron runtime was **not executed**; do not substitute a
  file-origin assumption or claim actual desktop Web Locks qualification.
- Build adapter expands unused Vite mod/content discovery to an empty registry
  and production DEV/PROD constants. Storage/host/client methods are unchanged.
  Source/input SHA-256 values identify the exact executed files.

The slot API exposes get/set only. Its per-facade prefsRevision/pendingMigration
protect migration, not an arbitrary caller's asynchronous read/merge/write.
The journal queue is per installed journal; it does not serialize lineage,
title/birth writers or another page. Public KV has get/set/keys, adds a grant and
size bounds, and its implementation also rewrites an aggregate store; it is not
an assumed cross-page transaction or tested replacement in this proof.

## Candidate boundary, not an implemented fix

A cooperative standard Web Locks critical section may coordinate current
metadata writers without patching Core, but only after actual availability,
origin/scope, declared-API policy and unsupported/Node22 behavior qualification.
Read fresh inside the critical section; cover archive, lineage, birth-flag
set/clear/consume and title memory. A local queue/readback/retry alone cannot
claim cross-page safety. No silent unsafe fallback or protection against
legacy/noncooperating writers is promised. No lock was acquired by this probe;
availability alone does not prove that candidate.

Persisted counter correctness is separate from unique cached birth draws:
plannedBirth can read the same lineage on two pages before either bump. This
investigation does not invent random controller IDs or promise globally unique
class/race draws. Implementation waits for47 actual-main delivery and parent GO,
then starts from that result in a new branch. No source fix/state closure/PR or
full game gate is part of this evidence branch.
