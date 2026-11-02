# 2026-11-02 - b02-verify: the instrument reproduces the record

B02's own verification session (issue #3): the first record written by
`tools/sweep.mjs`, and the proof it is the same instrument the suite is. The
session machinery was extracted from `src/play.test.ts` into
`src/play-session.ts` (one module, two callers); this sweep ran through the
runner's half, and every number it produced matches B01's pristine-engine
record bit-for-bit — including the defect.

| seed | B01 pristine (`2026-11-02-door-close`) | this sweep |
| --- | --- | --- |
| 1 | 1500 decisions, turns 8691, maxDepth 1, clvl 1, places 421, alive, **close 771** | identical (close 771) |
| 7 | 1228 decisions, turns 15773, maxDepth 1, clvl 2, places 611, dead, walk 1081 | identical |
| 42 | 1500 decisions, turns 17914, maxDepth 2, clvl 3, places 945, alive, walk 1322 | identical |

Seed 1's full census matches command-for-command (descend 21, walk 659, open
18, ascend 19, read 1, rest 7, quaff 1, pickup 3, close 771). The instrument
sees the engine gap B01 recorded (#13): seed 1 still spends 771 of 1500
decisions closing a door the engine already closed, and the turn counter
still freezes at 8691. `src/play.test.ts` still fails that seed on the same
assertion — the runner neither hides nor changes it.

- **What played**: the stock Borg (`build.borg: "stock"`), no parameter
  overrides.
- **Engine**: published `@rpgm-tools/neo-angband-core` 1.23.0-beta.1, bundled
  from `node_modules` by the runner — no local-core alias, no patching (B01's
  patched-engine sweep is the separate, labelled precedent).
- **Content**: sibling checkout `neo-angband` at `ceb484205`.
- **Mod commit**: `task/B02-bakeoff-runner@a3020019 (dirty)` — the sweep ran
  on B02's own working tree before committing it, which is the honest
  description: the tree contained the instrument being verified. The commit
  that follows is this tree.
- **New columns** B01's records did not carry: `kills` (counted at the
  engine's `onPlayerKill`), `gold`, `causeOfDeath` (from `died_from`), and
  per-life `race`/`class`/`baseStats` — the per-run output is now complete
  enough that Phase 2's fitness column can be computed without re-running.

## What the numbers mean for the next task

Median maxDepth over the cohort is 1: the door-close defect (#13) still caps
seed 1 at depth 1 with half a session spent on doors, exactly as recorded —
that fix belongs to the engine, and until it ships, every strength
measurement on this pin carries it. The runner is ready as the measurement
instrument for B03 (the swap subsystem) and as the Phase 2 fitness evaluator:
`--seeds` fixes the cohort, `--lives` plays several characters per seed
through the engine's own reincarnation, and the record it writes is the one
curated READMEs quote.
