# Fix ownership and Mandos integration

Canonical source defects live in our repair forks:
- diegoami/neo-angband-borg-mod-tracker: TypeScript Borg port omissions/defects.
- diegoami/neo-angband-tracker: original C Borg/C game and Neo engine defects.
Mandos owns its own bugs and applicable verified consumer adoption/C-to-TS translation.
[Scope181](MANDOS-SCOPE.md) parks experiments, not applied corrections.
[Migration ledger](migrations/repository-split.json) preserves old issue URLs.

Use targeted source/consumer checks for active bugs, applicability and closure.
Broad reconciliation is a weekly manual batch or explicit owner task, not every
session startup. Before any inherited watcher, verify its scope excludes Rust
repository/files/external issues; borg-rs reports directly to the C board.
Incomplete API reads remain incomplete, not a new successful baseline.

Prefer the stock published engine. A Mandos engine carry needs a demonstrated
required gameplay path plus regression/removal conditions. Optional PR433/replay
is not a default upgrade requirement. Not needing a carry does not fix its general
source issue; parent reconciles named-profile consumer state after actual proof.

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
