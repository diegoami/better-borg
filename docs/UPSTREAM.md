# Upstream watchlist

The ecosystem's issues live in the consolidated tracker
(`neostryder/neo-angband`), dispositioned with `repo:*` labels — the same
vocabulary our trackers use. This file is what we watch and why. Re-check at
every milestone close; date each pass. When WE file upstream (the #428
pattern): we cannot apply labels on their tracker (maintainer-only, verified
2026-11-02) - suggest them in the issue body as a footer, in their vocabulary
(`bug`/`effort:*`/`priority:*`/`repo:*`/`source:community`/`area:*`). Relevant upstream fixes are
cherry-picked with the floor-bump rule (process §2); upstream issues we can
advance become B-tasks here, diagnosed and branched in OUR fork, then offered
upstream (#428 is the pattern).

Last checked: 2026-11-03, at the M1 close (sync pass: both upstreams —
`neostryder/neo-angband` and `neostryder/neo-angband-mod-borg` — zero
commits ahead of our pins; nothing to adopt. Rules: process.md §7).
Prior pass: 2026-11-02, same result.

## Ours, waiting upstream

- **neo-angband#428** — the `noteSpot` engine gap (our B01; run record
  `docs/runs/2026-11-02-door-close/`). **PR #429 opened 2026-11-03** (one-line
  `noteSpot` restore on the hook; trap 20/20, known suites 74/74, zero new
  tsc errors, close 771→0). When a release carries it: drop the lab branch's
  fix commit and raise the engine floor (§7). Tracked in #13.
- **neo-angband#430** — `ModSaves.load` cannot resume a mod's controller (the
  arming gate requires a fresh birth). Filed 2026-11-03 after a clean
  dupe-check: proposal `load(id, {resumeAutoplay})` after `create`'s exact
  precedent and consent pattern. Gates the unattended half of our stage
  ladder (#26); attended reuse (load + Ctrl-Z) works today. A `copy`/snapshot
  seam is noted there as a possible separate follow-up.
- **neo-angband#431 → PR #433** (up 2026-11-03, mergeable): the master seed,
  read-only, one field on the RunReport - the run-identity payload a journaling
  mod already receives at `onRunEnd`. Fail-before/pass-after proven; the PR
  offers to re-cut onto another surface if preferred. Unblocks watched-lineage
  replay for #29. (B29's filing sweep, for the record: no mod-facing surface
  carried the seed at pin 1.23.0-beta.1 - state facades, input snapshot and
  RunReport all verified seedless, the lab hook's `seed()` is the harness's
  window, and the dupe-check covered open AND closed, #349/#356 being
  harness-side; until a release carries the fix, the replay trainer works
  against harness runs, whose seeds the runner knows.)
- **neo-angband#414 → PR #432** (up 2026-11-03, mergeable): `disturb()` signals
  `input-flush` (player-util.c:1674), with the MOD_SEAMS doc paragraph. 33/33,
  fail-before proven.
- **#377 fixed upstream** (their 1.4.0-beta line; issue open pending release):
  verified from our side - our ported awareness test passes on the current
  line (comment posted 2026-11-03).

- **neo-angband#434** — OUR finding, moved by the maintainer from mod-borg#21
  to the engine tracker (their consolidation home for mod-borg items) and
  labeled `bug` (2026-11-03): `track_step` was never ported — the bounce guard
  has been inert since the import. Our fix is measured on the fork (2/4 → 3/4);
  the PR offer stands (#34's audit continues this pattern: every inherited
  port defect is an upstream candidate).

**Tracker convention (learned 2026-11-03)**: open != unfixed here - issues stay
open until a stable release carries the fix (#371/#372/#415/#377). Check the
maintainer's dedup/release comments before treating an open issue as work.
**tsc note**: the packages/core build shows 53 missing-declaration errors in a
FRESH worktree (build-order artifact: core references mod-sdk/dist) - build
from the repo root (`tsc -b`) for the true count; master is genuinely clean.

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

## Watch (affects our roadmap)

- **neo-angband#418** (`area:seams`, effort:S) — headless runner cannot run
  first-party mods holding first-party-only capabilities. This is the engine-side answer to our lab-trust workaround
  (#28 in neowarrior-borg): when it lands, first-party-tier harness tests
  run without the local patch.
- **neo-angband#385** (`area:seams`, priority:med) — run-ended notification
  and STORAGE THAT OUTLIVES A CHARACTER. That seam is exactly the substrate
  better-borg's Phase 3 knowledge base needs; its shape should be tracked
  before we design our format around `ctx.character.key()`.
- **neo-angband#414** (`repo:neo-angband`) — `disturb()` never emits the
  input-flush event; autoplayer interrupt flows may depend on it.

## Verified in our import (reference)

- **neo-angband#377** — unknown-flavour handling after core 1.22. Our import
  carries the fix (`src/item/item.test.ts:477` cites the number); the issue
  is our label-vocabulary reference example.

## Ignored by policy

The `repo:future-mod` family (endgame/dungeon/hall-of-legends phases) and
`repo:mod-qol` items: content and QoL, not the borg's line. Revisit only if a
milestone wants them.
