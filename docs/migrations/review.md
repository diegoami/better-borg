# Three-repository rework review

Coordinator read-only consistency review,2026-11-05. No independent model was
dispatched; the existing owner-launched review policy is respected. The
reproducible structural/live-board pass completed with no unresolved
rework-blocking finding. Known published-runtime failures remain explicit
source work, not relabelled as fixed by this migration.

## Reviewed functional heads

| Scope | Head |
| --- | --- |
| Mandos | 875d38ea7891cc5187b6b00fbfba7a6abb21b6dc |
| Engine/C tracker | 78378233a52f98a99ccad1438c0bb6264811ea06 |
| Port tracker | a661ee3c9e4f5980c746634a957b5e4a6ee11021 |
| Native C workbench | ab224786116363d8f1bad1656417deb2fb0969b9 |

Later report-only commits do not change the functional surfaces below.

## Ownership and migration results

-47 existing trackers transferred (22 engine/C,25 port), with preserved
  titles, creation timestamps, state and discussion counts; authors checked
  where captured. New issue identities and original references are recorded.
-152 C finding issues have152 distinct canonical source links:143 original
  catalogue findings plus9 reported borg-rs group41 candidates. No candidate
  is promoted to verified native evidence by import. The C page links the
  issue board/filters; split records retain provenance-at-import only.
-26 linked Mandos consumer issues preserve original application state and
  relevant product milestones. All bidirectional links verified. carried
  issues are open; verified fixed cases are closed; source forks have no
  carried/fixed/partial/not-carried/patch-active consumer labels.
-Source defects/proposals belong to the appropriate tracker. Mandos adopts
  and independently translates applicable C fixes into its TS derivative;
  the source mod tracker is fidelity-only. Rust translation/carry is borg-rs's
  independent responsibility, with no Neo obligation.
-Four bootstrap trees implement three sessions: combined engine/C (same git
  repository), port fixes, Mandos. The native tree's common git directory is
  the engine tracker; pinned c-borg-reference is unchanged at e473720.
-Remote identities survived repository renames. The eight original upstream
  proposal heads were unchanged/mergeable at verification. No runtime source
  changed in Mandos, port, engine packages or native C; only session/tool/test
  collection wiring and administrative/evidence files changed.

## Review findings fixed

1. Native README initially suggested CTest. The actual project uses alltests/
   allunittests; instructions corrected and the real native target executed.
2. Native Node guard filenames could be collected by engine Vitest. Renamed
   them to .node-test.mjs, with explicit Node CI commands. Nested .worktrees
   are excluded from engine Vitest/ESLint collection to prevent duplicate trees.
3. Mandos commit-hook proxies still required the old lab path. They now prefer
   the canonical engine-tracker workspace, retain explicit override/legacy
   fallback, and were exercised by a real staged private scan/commit.
4. Source carry tags conflated source and consumer state. Tags/definitions
   removed from source forks;26 linked consumer issues and watch regressions
   enforce the separation and open-carried/closed-fixed lifecycle.
5. A static file-only borg-rs watch would lose a future issue-feed transition.
   Read-only dual-feed capability and failure-safe baseline tests were added;
   live use found41groups and the9 new claims were triaged as reported leads.

## Validation and limits

| Surface | Result |
| --- | --- |
| Mandos full gate |1143passed,0skipped,202.53s; plugin unchanged/current730.6KiB |
| Shared cross-repo watch regressions |8passed, includes namespace collisions and discovery failures |
| Engine/C source snapshot + borg-rs intake guards |8passed under Node |
| Native C configure/build/test |CMake3.31.10;965/965 unit and5/5 upstream frontend tests |
| Published port baseline with content |862passed,4known repeated-open failures,0skips; issue25 |
| Same10 port play/rest cases on existing patched engine |10/10passed,128.30s |
| Live issue/ownership audit |47transfers,26consumer links,152finding issues,4bootstrap trees verified |

The paired port control changes engine version/patch bundle, while preserving
port/content. It does not isolate which individual patch fixes each published
failure. Source issue neo-angband-borg-mod-tracker25 owns follow-up; do not
invent a new port bug, silence assertions or claim the unpatched gate green.
C unit/frontend success does not prove each C candidate's practical impact;
most source findings still require their own native scenarios/controls.

All source/runtime diffs were checked against the declared pristine bases.
Old native records and Mandos run records remain immutable; current paths/
policies are separate from archived pre-split snapshots. Running lab, saves
and browser data were not deployed/refreshed. Source watches are read-only;
no official Angband issue/PR/comment or Rust code push was performed.

## Session start

- neo-angband-tracker: AGENTS/RULES/PLAN/checkpoint25; C worktree under
  .worktrees/angband-c; track borg-rs file/issues/direct reports.
- neo-angband-borg-mod-tracker: AGENTS/RULES/PLAN/checkpoint26; source25 is the
  preserved published-runtime/coverage attribution task.
- Mandos (better-borg): AGENTS/RULES/PLAN/checkpoint36; integration queue111
  and linked consumer issues125–150. Apply/translate only owned downstream work.

## Optional independent review prompt

Open read-only sessions against the reviewed heads (or their merge successors).
Read each AGENTS/RULES/PLAN and session.json, then inspect the migration ledger,
source/consumer issue links, C landing page/import records, dual C/Neo bases,
borg-rs intake and monitor failure handling. Check the eight proposal heads
and protected lab paths. Verify that C→TS translation is Mandos-only and Rust
is independent. Report concrete correctness, ownership, bootstrap/link or
validation gaps with file/line or canonical issue evidence; do not edit source,
transfer issues, apply fixes or start gameplay tasks. Distinguish inherited
baseline failures from rework regressions. Owner selects any independent model.
