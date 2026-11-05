# Fix ownership and Mandos integration

Canonical source defects live in our repair forks:
- diegoami/neo-angband-borg-mod-tracker: TypeScript Borg port omissions/defects.
- diegoami/neo-angband-tracker: original C Borg/C game and Neo engine defects.
Mandos owns only its own defects/development and distinct consumer adoption.
[Migration ledger](migrations/repository-split.json) preserves old issue URLs.

Run node tools/upstream-watch.mjs before work and after upstream/consumer
movement; it reads all three boards. node tools/c-upstream-watch.mjs reads
the engine fork's canonical C index and official C source/thread changes.
Both are read-only; incomplete API reads retain the last successful baseline.

Source fork issues own source defects/proposals and use open/closed for that
resolution. They have no carried/fixed/partial/not-carried/patch-active consumer
tags. Link a distinct Mandos consumer issue when applicable.

In Mandos, carried means the correction is fixed on our side and the issue
stays OPEN while upstream delivery is missing. Close as fixed only when the
correction is fixed upstream AND pushed/adopted downstream to us with our
changes, rebuilt and verified. Partial cases stay open. patch-active separately
tracks still-needed consumer backports, including after a verified fixed bug
closes. A proposal or stored file is not applied; no release wait alone.

For Mandos adoption, preserve exact affected/correction/engine/content pins,
mark local divergence, rebuild plugin.js and run the gate/controls. Update
our integration task and link its canonical source issue, with each required
consumer receipt. Leave unrelated source work in its owning session.

C catalogue/evidence/patches are canonical in our engine fork. No official C
issues/PRs/comments from us under the owner pause. Neo source offers use the
correct neostryder engine/mod repository after proof/duplicate checks, from
isolated topic branches excluding session docs. Our default branches include
owned docs; preserve them through normal upstream merges, never force resets.
