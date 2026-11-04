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

Per-thread state does not live in this file. Every thread we hold upstream
(an issue or PR we filed, or a seam we depend on) has a TRACKING ISSUE on our
tracker, labelled `upstream`, whose body opens with a `**Threads**:` line
naming the upstream refs (`neostryder/<repo>#<n>`), then **What**, **Kind**
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
