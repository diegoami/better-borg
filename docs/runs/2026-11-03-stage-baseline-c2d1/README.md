# 2026-11-03 - stage-baseline-c2d1: the default stage's calibration, and the number it starts from

THE STAGE BASELINE (#25, the purpose redirect's first measurement). Three
candidate stages over the standard seed grid (20, 23, 34, 49 - the pack
runner's default cohort), decision budget 10000 (generous: the stage stops
runs early and deaths end them in hundreds), the planned warrior lineage
(High-Elf by the draw's counter walk this session: all four drew Half-Troll),
stock parameters, pristine published engine. This directory is the CHOSEN
rung's session; the two brackets around it are its siblings
(`../2026-11-03-stage-baseline-c1d1/`, `../2026-11-03-stage-baseline-c2d2/`).

| stage | rung's meaning | reach-rate | library |
| --- | --- | --- | --- |
| c1d1 | the floor: any character that enters the dungeon | **4/4 (100%)** | 4 kept |
| **c2d1** | **the frontier: level 2, arrived at depth 1** | **2/4 (50%)** | **2 kept** |
| c2d2 | the stretch: level 2, arrived at depth 2 | 0/4 (0%) | 0 kept |

**The default is c2d1** - the strongest rung inside the measured frontier,
the only one whose reach-rate is strictly between 0% and 100% on the standard
grid. That is the calibration rule, stated before the data: a rung everyone
attains (c1d1: every planned warrior descends on its FIRST decision, so the
whole cohort retires at decision 1) measures nothing that can move, and a
rung nobody attains (c2d2: no warrior reached depth 2 alive) cannot be
distinguished from the owner's ~c20 destination by today's instrument. The
50% rung is where the number has both directions to move - and its two kept
saves (seeds 23 and 49, retired at 359 and 143 decisions) are the first
per-seed library cohort the ladder (#26) resumes from.

## The per-seed facts (this session)

| seed | outcome | decisions | turns | clvl | maxDepth |
| --- | --- | --- | --- | --- | --- |
| 20 | died to a floating eye before level 2 | 364 | 5049 | 1 | 1 |
| 23 | **attained, retired into `M s23 c2d1`** | 359 | 3497 | 2 | 1 |
| 34 | died to grey mold before level 2 | 45 | 1365 | 1 | 1 |
| 49 | **attained, retired into `M s49 c2d1`** | 143 | 1405 | 2 | 1 |

The retiring runs' censuses balance their decision counts exactly (#36's
rule holds on the retiring decision: attainment is observed after the
decision completes, as a death is), and the dying runs are byte-for-byte
the outcomes the stage-less c2d2 session records for the same seeds - the
unattained stage is observationally neutral.

## Why the frontier is here (the probe, and what moves it)

A pre-implementation probe (same tree, no stage logic, `--cap 10000` over
the bake-off's 8-seed grid: 1, 7, 20, 23, 34, 42, 49, 99) chose the
candidates and brackets the frontier the same way: at clvl 2 / depth 1 five
of eight attain (62.5%), depth 2 only seed 1 - the door-close seed, whose
engine defect (771 wasted closes, B01, upstream neo-angband#428, PR #429)
is exactly the strength work this number is waiting for. On the wider grid
seed 1 reaches clvl 5 / depth 2 before starving at 9066 decisions, and
seed 99 survives the whole budget at clvl 2 - the frontier is not a wall,
it is today's strength. The owner's destination (~character level 20 at
moderate depth, "a watched evening") is what the settings climb toward:
move `borg.stageClvl`/`borg.stageDepth` as B03 and the door-close release
land, and re-baseline here.

## Provenance

- **What played**: the warrior pack (stock parameters), planned births, one
  character per seed, retirement chaining the next seed exactly as a death
  does. `runner.stage: {clvl: 2, depth: 1}`; per-run `stageAttained`/
  `retired` recorded (the schema id stays `better-borg/runs@1` - additive).
- **Mod commit**: `task/B25-stage-grind@315e489e` (the B25 implementation
  commit; the `(dirty)` marker on this and the c2d2 record is the
  untracked directory of the c1d1 sibling session, not a source change).
- **Engine**: published `@rpgm-tools/neo-angband-core` 1.23.0-beta.1
  (package.json pin), bundled from `node_modules`; fingerprint
  `c89b1b08474b1692b352f8d0b64823f4` for `dist/game/trap.js` before and
  after every session - the engine stayed pristine.
- **Content**: sibling checkout `neo-angband@b53ff5f0b` (the local lab
  branch's tree supplies the content pack only; no engine patches run in
  this measurement - the instrument's contract).
- **Instrument**: `tools/runs.mjs --stage 2,1 --seeds 20,23,34,49 --cap
  10000`, the ONE session module (`src/play-session.ts`) driving the ONE
  retire protocol (`retireAtStage`) the mod's restart loop runs.

## What the numbers mean for the next task

The project's number starts at **50%** (2/4 at the default stage c2d1 over
the standard grid). Everything that makes a warrior survive level 1 - the
swap subsystem (B03), the door-close release (#13/#429), diving and pacing
(#9) - moves it, and every such change re-measures on this grid with
`tools/runs.mjs --stage 2,1` and writes its own directory beside this one.
When the rate saturates, the owner moves the rung up and the ladder (#26)
resumes from this stage's library instead of re-grinding proven ground.
