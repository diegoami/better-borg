# Mandos consumer backports

This directory owns only Mandos package/lab backports and named consumer
receipts. Canonical source defects/proposals live in the two tracker forks.
Source issues have no carried/fixed/patch-active labels; their linked Mandos
consumer issues own those states and closure after verified downstream adoption.

## Published core patch removal units

The active combined @rpgm-tools__neo-angband-core@1.23.0-beta.3.patch retains
the independent PR432 and PR433 groups. The historical beta.2 patch remains
unchanged for old receipts. Published beta.3 replaces the noteSpot and class
spell-count groups; the corresponding package regressions verify both replacements. A public source merge alone updates neither the patched package
nor the separately running lab. Remove a hunk only after its consumer has the
verified upstream replacement; retain patch-active while still needed.

| Upstream correction | Source issue | Mandos consumer issue | Replacement proof |
| --- | --- | --- | --- |
| Neo PR429 / issue428 (published beta.3 replacement) | [source](https://github.com/diegoami/neo-angband-tracker/issues/4) | [adoption](https://github.com/diegoami/mandos/issues/126) | door/setFeat scenario |
| Neo PR432 / issue414 | [source](https://github.com/diegoami/neo-angband-tracker/issues/5) | [adoption](https://github.com/diegoami/mandos/issues/128) | input-flush reset regression |
| Neo PR433 / issue431 | [source](https://github.com/diegoami/neo-angband-tracker/issues/6) | [adoption](https://github.com/diegoami/mandos/issues/129) | accepted birth/seed replay |
| Neo commit0cc75b4af (published beta.3 replacement) | [source](https://github.com/diegoami/neo-angband-tracker/issues/15) | [adoption](https://github.com/diegoami/mandos/issues/147) | all-class spell-index mapping |

Run-record code in tools/engine-pin.mjs derives the patch names from actual
marked hunks. Keep package and lab receipts distinct. A carried consumer issue
stays open while upstream delivery is missing; fixed/closed follows upstream
correction plus verified downstream adoption. patch-active is independent.

## noteSpot consumer reconciliation

[2026-11-06 package receipt](../docs/runs/2026-11-06-notespot-consumer/README.md)
compares the existing published-beta.2 carry with engine PR200's exact source
`19ff25eac8997e8feb6b5e62eefa7ffe4d134631`. The hook is already equivalent;
this is regression coverage and verification, not a new runtime adoption.
That historical beta.2 package needed the noteSpot hunk. The beta.3 package
now provides it directly, verified without a local trap.js delta. The class
spell-count hunk is likewise replaced; PR432/input-flush and PR433/birth
provenance remain explicitly carried. See the [beta.3 consumer evidence](../docs/runs/2026-11-06-beta3-consumer/README.md).
This package adoption does not change the separately running lab bundle.

## Historical native C copies

Active C catalogue/evidence/proposals/patches are owned by
[neo-angband-tracker](https://github.com/diegoami/neo-angband-tracker/tree/master/patches).
The upstream-c files here remain frozen for old report/PR links; do not edit
them as a second ledger. Native C map-cancel proposal1 remains closed/unmerged
and linkable in that fork. Mandos88 lighting wrapper is closed/unmerged and
retained as historical report evidence; practical impact remains unproven.
No official C submission is authorized by this index or migration.

## Mandos translations of C source corrections

[Native C translation provenance and independent TS units](c-translations/README.md)
link canonical C source issues/proposals, exact original translations, Mandos
consumer issues and replacement conditions. These are TS source deltas, separate
from the published core package patch and frozen historical upstream-c copies.
Live consumer carry/fixed state belongs on the linked issues, not this index.
