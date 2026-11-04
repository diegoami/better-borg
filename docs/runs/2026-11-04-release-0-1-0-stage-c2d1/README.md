# 2026-11-04 - release-0-1-0-stage-c2d1: the 0.1.0 release record - 4/4 (100%)

THE RELEASE MEASUREMENT (milestone 0.1.0). Same instrument, cohort and cap as
B40's record (`../2026-11-03-b40-stage-c2d1/`): seeds 20, 23, 34, 49,
`--stage 2,1`, cap 10000, planned warrior lineage, stock parameters, at
`main@c685deb3`. The engine is the published
`@rpgm-tools/neo-angband-core 1.23.0-beta.1` plus our carried patches (neo-angband
PR #429, PR #432). The content is the published
`@rpgm-tools/neo-angband-content 1.23.0-beta.1` (#46; B40 read the sibling
checkout's pack, byte-identical).

| stage c2d1 | reach-rate | library | deaths |
| --- | --- | --- | --- |
| B40 (`task/B40-carry-engine-fixes@affb55db`) | 4/4 (100%) | 4 kept | none |
| **0.1.0 (this record)** | **4/4 (100%)** | **4 kept** | none |

**Every per-run field equals B40's except `wallClockMs`.** Seeds 20, 23, 34
and 49 attain in 328, 602, 409 and 664 decisions. The mod changes since B40
are the #48 fix, which has no effect on these lives, and #46, which changes
only where the content pack is read from. Neither moved a decision.

    node tools/runs.mjs --label release-0-1-0-stage-c2d1 --seeds 20,23,34,49 --cap 10000 --stage 2,1 --out docs/runs
