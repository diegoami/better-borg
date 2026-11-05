# Mandos session plan

1. Inspect checkpoint36 and current canonical fork issues/PRs. Update actual
   adoption/backport state before starting new work; never infer a fix from
   upstream closure or fork default-branch contents alone.
2. Keep this board for Mandos-only work and distinct integration tasks. The
   transfer ledger points every migrated source tracker to its canonical owner.
   New upstream defects are filed in the correct fork; attach Mandos evidence
   and link adoption work here instead of implementing source repair here.
3. Prioritize owner-directed Mandos defects, reliable run/replay/stall evidence,
   archive/data safety and correct package/plugin/lab integration. Current
   roadmap features remain parked, not auto-started from old planning docs.
4. For a C correction, inspect the native evidence and applicability to our
   TS derivative. Translate it here, not in the fidelity-only mod tracker;
   prove corresponding legal scenarios/controls under Neo's declared APIs.
   Link the source C issue, preserve provenance and mark any baseline departure.
   If there is no corresponding TS path, record not-applicable.
5. For a delivered correction, inspect exact source change and dependency/API
   compatibility. Adopt with marked Mandos differences, preserve active patch
   hunks until each consumer has its verified replacement, rebuild plugin.js.
6. Run focused regressions, required standalone replay checks and fixed-seed
   controls for behavior changes, then one logged CI=1 pnpm verify under the
   shared validation lock. Record full counts/skips and engine fingerprint.
7. Verify any separately authorized lab deployment and preserve owner saves,
   profiles and append-only records. Do not call deployment from a source merge.
8. Update integration issue/checkpoint36, links and patch consumer receipts at
   every merge/stop. Source bug state stays on its fork issue. No C submission.

Mandos integration queue111 remains here. The source investigation formerly
Mandos123 belongs to the port fork after migration; follow its canonical URL
from docs/migrations/repository-split.json rather than fixing it in this session.
