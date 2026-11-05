# Mandos consumer backports

This directory owns only Mandos package/lab backports and named consumer
receipts. Canonical source defects/proposals live in the two tracker forks.
Source issues have no carried/fixed/patch-active labels; their linked Mandos
consumer issues own those states and closure after verified downstream adoption.

## Published core patch removal units

The combined @rpgm-tools__neo-angband-core@1.23.0-beta.2.patch has independent
marked groups. A public source merge alone updates neither the patched package
nor the separately running lab. Remove a hunk only after its consumer has the
verified upstream replacement; retain patch-active while still needed.

| Upstream correction | Source issue | Mandos consumer issue | Replacement proof |
| --- | --- | --- | --- |
| Neo PR429 / issue428 | [source](https://github.com/diegoami/neo-angband-tracker/issues/4) | [adoption](https://github.com/diegoami/mandos/issues/126) | door/setFeat scenario |
| Neo PR432 / issue414 | [source](https://github.com/diegoami/neo-angband-tracker/issues/5) | [adoption](https://github.com/diegoami/mandos/issues/128) | input-flush reset regression |
| Neo PR433 / issue431 | [source](https://github.com/diegoami/neo-angband-tracker/issues/6) | [adoption](https://github.com/diegoami/mandos/issues/129) | accepted birth/seed replay |
| Neo commit0cc75b4af | [source](https://github.com/diegoami/neo-angband-tracker/issues/15) | [adoption](https://github.com/diegoami/mandos/issues/147) | all-class spell-index mapping |

Run-record code in tools/engine-pin.mjs derives the patch names from actual
marked hunks. Keep package and lab receipts distinct. A carried consumer issue
stays open while upstream delivery is missing; fixed/closed follows upstream
correction plus verified downstream adoption. patch-active is independent.

## Historical native C copies

Active C catalogue/evidence/proposals/patches are owned by
[neo-angband-tracker](https://github.com/diegoami/neo-angband-tracker/tree/master/patches).
The upstream-c files here remain frozen for old report/PR links; do not edit
them as a second ledger. Native C map-cancel proposal1 remains closed/unmerged
and linkable in that fork. Mandos88 lighting wrapper is closed/unmerged and
retained as historical report evidence; practical impact remains unproven.
No official C submission is authorized by this index or migration.
