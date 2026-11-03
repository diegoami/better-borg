# Backlog

The queue lives as GitHub issues (label `backlog`); this file is the ranked
index, ordered by expected effect on median deepest depth over the fixed seed
cohort. Items become tasks when B02's measurements say what to reach for.

## Upstream follow-through

1. **The engine noteSpot gap** - [#13](https://github.com/diegoami/better-borg/issues/13):
   B01's PR draft waits on the owner's trigger; the floor bump and the depth
   delta follow the release. The single biggest measured lever so far: seed 99
   went from dying at 124 decisions to playing all 1500 on the patched engine.

## Moved from neowarrior-borg (pre-unification)

2. **Diving: munchkin stair-scum and depth pacing** - [#9](https://github.com/diegoami/better-borg/issues/9).
   The depth lever itself.
3. **Live-unique census** (`borg_kills_uniques`) - [#10](https://github.com/diegoami/better-borg/issues/10).
4. **PF_COMBAT_REGEN engine seam** - [#11](https://github.com/diegoami/better-borg/issues/11)
   (filed upstream when promoted; tracked as neo-angband#34 there).
5. **Depth ceiling and enchant limit as numeric settings** - [#12](https://github.com/diegoami/better-borg/issues/12).

## Roadmap phases (planned in docs/plans/getting-stronger.md)

6. **Phase 2**: port the formula engine, then offline parameter evolution
   (CEM first, GA with lineage naming only if it pays; frozen between-run
   parameters; held-out seed cohort).
7. **Phase 3**: the versioned knowledge base - per-monster threat, pacing
   priors, item values learned offline. Reference: the squire mod's journal
   taxonomy (lessons, grudges, lineage, calibration) at
   ../neo-angband-mod-squire (read-only clone; ideas, not code - its runtime
   learning model cannot cross into a deterministic borg).

## Deliberately not planned

- **In-game self-mutation each death**: one life is one noisy fitness sample;
  evolution happens offline against the harness (rule 5, the roadmap's
  constraint section).
- **Engine changes as fork policy**: engine needs are filed upstream
  (neo-angband); the local game checkout's lab branch may carry diagnostic
  patches, but neither fork ships one.
