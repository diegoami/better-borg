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
  `docs/runs/2026-11-02-door-close/`). Our PR offer stands; the local lab
  branch and the patched-engine sweep variant carry us until a release.
  Tracked in #13.

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
