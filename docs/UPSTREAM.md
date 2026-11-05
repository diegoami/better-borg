# Upstream watchlist

The ecosystem's issues live in the consolidated tracker
(`neostryder/neo-angband`), dispositioned with `repo:*` labels — the same
vocabulary our trackers use. This file is what we watch and why. Re-check at
every milestone close; date each pass. When WE file upstream (the #428
pattern): we cannot apply labels on their tracker (maintainer-only, verified
2026-11-02) - suggest them in the issue body as a footer, in their vocabulary
(`bug`/`effort:*`/`priority:*`/`repo:*`/`source:community`/`area:*`). Relevant upstream fixes are
cherry-picked with the floor-bump rule (process §7, step 3); upstream issues we can
advance become B-tasks here, diagnosed and branched in OUR fork, then offered
upstream (#428 is the pattern).

Historical sync note, 2026-11-03 at the M1 close: both upstreams —
`neostryder/neo-angband` and `neostryder/neo-angband-mod-borg` — zero
commits ahead of the pins checked in that pass; nothing to adopt then.
The prior 2026-11-02 pass recorded the same result. These are dated
observations, not live status. Use `node tools/upstream-watch.mjs`,
`node tools/upstream-sync.mjs` and the tracking issues for current state
(process.md §7).

## Our threads: one tracking issue each

### Carry status and attribution

Every issue labelled `upstream` or `upstream-c` must have exactly one of:

| Label | Meaning |
| --- | --- |
| `carried` | The fix is in Mandos `main` and applied in every required consumer. It may be inline Borg code, an applied engine patch, or fixed code in the adopted upstream base. |
| `not-carried` | The fix is absent from `main` or only exists as a proposal/work-branch patch. |
| `partially-carried` | Only some components or required consumers are covered; the issue must list which. |

Use labels and the issue body for status, never title suffixes or guesses
from an upstream issue being open/closed. A running desktop can still use
an older build; record source/build coverage separately from deployment.
Keep `carried` on a closed, adopted fix when it remains in `main`, noting
that it is upstream-provided code rather than a local patch.

Always state the origin and exact C reference revision. **Inherited from
the imported TypeScript port** and **inherited from C** are different:

- Correct C behavior missing or changed in the port is a Neo port defect.
- Wrong C behavior faithfully reproduced by Neo is a C defect. Correct C
  upstream first, then propose Neo parity with that recorded C revision.
  Mandos may carry an earlier marked CHOICE; that is not permission to
  change Neo's behavior before C changes.

`upstream-c` identifies the C-source defect/proposal route, not merely a
C-reference test. Candidate attribution may be unproven; say so explicitly.
Both labels can track related work, but they do not prove a C defect or
authorize either submission. Split independent C and port defects when
their evidence/routes differ.

### Required tracking record

Each tracker records **Threads** (exact repository/number, or `none yet`),
**Origin/reference**, **Target/sequence**, **Carried** (main/source commits,
affected components and consumers, patch path/PR-marked hunks or inline
source paths), **Scenario/evidence**, and **On release** (adoption, removal
and revalidation conditions). A patch file's existence alone is not proof
that a consumer applies it.
For Borg fixes, identify the source merge and rebuilt plugin. For engine
fixes, identify the authoritative PR source, applied package hunks and each
required lab/build consumer. A C patch affects the C build; it does not
automatically fix the TypeScript engine or Borg.

For every upstream-C proposal, retain a reproducible natural or synthetic
scenario with legal/reachable state, normal rules, source/content pins,
RNG/controller/perception initialization, before/after commands and actual
outcomes, and negative controls. Compare C, the unfixed implementation and
the correction as applicable. C and Neo saves need equivalent states, not
a shared binary save. Prove a meaningful consequence in plain language;
do not infer death prevention from changed flags or scores alone.

For C proposals, keep evidence internal, check current source and open/closed
duplicates, then obtain explicit owner OK before external posting. The owner
separately authorized confirmed Neo port-defect reports/PRs directly
(2026-11-05), after the same attribution, reproduction and duplicate checks. C patches belong
in `patches/upstream-c/`; the combined pnpm engine patch keeps one hunk
group/PR marker per fix. Do not send a Mandos CHOICE to Neo as a port fix.

### Review cadence

Run `node tools/upstream-watch.mjs` at bug-work session start/end, after
merge/revert or consumer changes, after upstream movement/release, and
before a status report/checkpoint. Update the affected tracker and replace
its carry label in the same pass; resolve missing/conflicting labels.
This is a workflow cadence, not an unattended scheduled job.

The read-only report shows upstream state beside Mandos carry status,
includes internal candidates and flags metadata/API failures with a nonzero
exit. It observes PR heads as well as issue activity. Movement can be ours,
a maintainer's or a bot's: inspect it before attributing it. Upstream merge
or closure never automatically applies a fix, changes our labels or removes
a patch. On delivery, verify the adopted implementation, update the floor
if needed, remove only matching patch hunks and rerun the scenario/gates.

Per-thread state does not live in this file. Every thread we hold upstream
(an issue or PR we filed, or a seam we depend on) has a TRACKING ISSUE on our
tracker, labelled `upstream`, whose body opens with a `**Threads**:` line
naming the upstream refs (`owner/repo#number`, or `none yet`), then **What**, **Kind**
(engine gap / port defect / seam request / watch), **Carried** (where our fix
lives meanwhile: the core, the harness patch, the lab branch - or why
nothing), and **On release** (what we do when a release carries it). It
closes when a release carries the fix and we have adopted it. List them:

    gh issue list --repo diegoami/mandos --label upstream

`node tools/upstream-watch.mjs` reads its thread list from those issues, so
filing a tracking issue IS adding the thread to the watch. Process §6 says
what we do while we wait.

**Tracker convention (learned 2026-11-03)**: open != unfixed here - issues stay
open until a stable release carries the fix (#371/#372/#415/#377). Check the
maintainer's dedup/release comments before treating an open issue as work.
**Historical build note**: the earlier fresh core worktree produced 53
missing-declaration errors because core referenced mod-sdk/dist before it
was built. Build the project references from the engine repo root before
attributing such failures; use the current build output for current claims.

## Touched by us, worth closing the loop

- **neo-angband#415** (`repo:mod-borg`, parity, effort:S) — "the Borg reads
  live terrain where it should read the remembered map". **Verified fixed at
  our pin (2026-11-02, B14/#14)**: all five named call sites read through the
  `knownFeat` wrapper (`src/core-api.ts:393-404` via `borgView().cell`,
  `:440`), active on core 1.23.0-beta.1. Site-level regression pins in
  `src/remembered-terrain.test.ts` (fail red if any site reverts to live
  reads); per-site evidence commented upstream. Upstream keeps the issue open
  until a stable release carries the fields, and for the rest of its audit
  (monsters/simulateLoadout/stores). **Filed as our #14.**

## Verified in our import (reference)

- **neo-angband#377** — unknown-flavour handling after core 1.22. Our import
  carries the fix (`src/item/item.test.ts:477` cites the number); the issue
  is our label-vocabulary reference example.

## Ignored by policy

The `repo:future-mod` family (endgame/dungeon/hall-of-legends phases) and
`repo:mod-qol` items: content and QoL, not the borg's line. Revisit only if
the owner changes the authorized scope; a milestone alone does not
authorize new feature work under rule 15.
