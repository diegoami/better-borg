# Backlog

The queue lives as GitHub issues (label `backlog`); this file is the ranked
index. **Defects outrank features, always** (owner rule, 2026-11-03), upstream
defects first; among features, the order is expected effect on reach-rate at
the chosen stage (#25, rule 1). The live queue - what is being worked and
what comes next - is [`STATE.md`](STATE.md); this file is the longer list
behind it.

## Upstream follow-through

1. **The engine noteSpot gap** - [#13](https://github.com/diegoami/mandos/issues/13):
   filed upstream as neostryder/neo-angband#428 with the fix as PR #429 (open,
   mergeable - do not nudge); the floor bump and the depth delta follow the
   release. The single biggest measured lever so far: seed 99
   went from dying at 124 decisions to playing all 1500 on the patched engine.

## Moved from neowarrior-borg (pre-unification)

2. **Diving: munchkin stair-scum and depth pacing** - [#9](https://github.com/diegoami/mandos/issues/9).
   The depth lever itself.
3. **Live-unique census** (`borg_kills_uniques`) - [#10](https://github.com/diegoami/mandos/issues/10).
4. **PF_COMBAT_REGEN engine seam** - [#11](https://github.com/diegoami/mandos/issues/11)
   (filed upstream when promoted; tracked as neo-angband#34 there).
5. **Depth ceiling and enchant limit as numeric settings** - [#12](https://github.com/diegoami/mandos/issues/12).
6. **The swap subsystem** (B03) - [#4](https://github.com/diegoami/mandos/issues/4).
7. **Watched-run automation** (a CDP driver writing watched.md skeletons) -
   [#24](https://github.com/diegoami/mandos/issues/24).

## Roadmap phases (planned in docs/plans/getting-stronger.md)

8. **Phase 2**: port the formula engine, then offline parameter evolution
   (CEM first, GA with lineage naming only if it pays; frozen between-run
   parameters; held-out seed cohort).
9. **Phase 3**: the versioned knowledge base - per-monster threat, pacing
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
