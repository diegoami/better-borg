# 2026-11-04 - b54-beta2-stage-c2d1: the engine move to 1.23.0-beta.2 - 4/4, unchanged

THE B54 MEASUREMENT (#54, rule 1). Same instrument, cohort and cap as the
0.1.0 records (`../2026-11-04-release-0-1-0-head-c2d1/`): seeds 20, 23, 34, 49,
`--stage 2,1`, cap 10000, planned warrior lineage, stock parameters, at
`task/B54-engine-beta2@74fa1c54`. ONE change: the engine. It moves from the
published `@rpgm-tools/neo-angband-core 1.23.0-beta.1` to `1.23.0-beta.2`, with
the same carried patches (neo-angband PR #429, PR #432) and the content
package at 1.23.0-beta.2.

| stage c2d1 | reach-rate | library | deaths |
| --- | --- | --- | --- |
| 0.1.0 head (beta.1 + patches) | 4/4 (100%) | 4 kept | none |
| **this record (beta.2 + patches)** | **4/4 (100%)** | **4 kept** | none |

Every per-run field equals the 0.1.0 head record's except `wallClockMs`. The
decisions are 328 / 602 / 409 / 664. On this cohort the beta.1 to beta.2
engine changes do not move a decision.

    node tools/runs.mjs --label b54-beta2-stage-c2d1 --seeds 20,23,34,49 --cap 10000 --stage 2,1 --out docs/runs
