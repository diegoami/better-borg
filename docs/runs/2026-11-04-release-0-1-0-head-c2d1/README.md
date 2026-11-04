# 2026-11-04 - release-0-1-0-head-c2d1: the 0.1.0 record at the release head - 4/4 (100%)

THE EXACT-HEAD RECEIPT (review #51, finding 3). `../2026-11-04-release-0-1-0-stage-c2d1/`
was measured at `main@c685deb3`, the parent of the candidate the review was
given, so "same commit" did not hold. That record stays as it is (rule 8).
This one is measured at `main@680ce063`: the candidate plus the review's
fixes, which are comments, fork marks and documents only.

Same instrument, cohort, cap, engine (published 1.23.0-beta.1 plus carried
PR #429 and PR #432) and content (published 1.23.0-beta.1).

| stage c2d1 | reach-rate | library | deaths |
| --- | --- | --- | --- |
| B40 (`affb55db`) | 4/4 (100%) | 4 kept | none |
| release candidate (`c685deb3`) | 4/4 (100%) | 4 kept | none |
| **release head (`680ce063`, this record)** | **4/4 (100%)** | **4 kept** | none |

Every per-run field equals both earlier records except `wallClockMs`. The
decisions are 328 / 602 / 409 / 664.

The tag `v0.1.0` goes on the commit that adds this record. Between
`680ce063` and that commit only these record files differ: a record can
never contain its own commit id.

Gate at `680ce063`: `CI=1 pnpm verify` - 46 files, 641 passed, 0 skipped,
`pnpm check` current, exit 0. Engine fingerprint `34c27241f96aceff581bcb186a9d898f`.

    node tools/runs.mjs --label release-0-1-0-head-c2d1 --seeds 20,23,34,49 --cap 10000 --stage 2,1 --out docs/runs
