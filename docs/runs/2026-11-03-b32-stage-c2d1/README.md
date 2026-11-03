# 2026-11-03 - b32-stage-c2d1: the caution/attack fix moves the number 50% → 75%

THE B32 MEASUREMENT (#32; the standard grid at the default stage, before and
after the fix). Same instrument, same cohort, same cap as the calibration
baseline (`../2026-11-03-stage-baseline-c2d1/`): seeds 20, 23, 34, 49,
`--stage 2,1`, cap 10000, planned warrior lineage, stock parameters,
pristine published engine. That baseline is the BEFORE (2/4, 50%); this
directory is the AFTER.

| stage c2d1 | reach-rate | library | deaths |
| --- | --- | --- | --- |
| before (B25's baseline) | 2/4 (50%) | 2 kept | seeds 20 (floating eye), 34 (grey mold) |
| **after (this session)** | **3/4 (75%)** | **3 kept** | seed 20 (grey mushroom patch, depth 2) |

## The per-seed facts (before → after)

| seed | before (baseline) | after (this session) |
| --- | --- | --- |
| 20 | died to a floating eye, depth 1, 364 decisions | died to a grey mushroom patch, **depth 2**, 250 decisions |
| 23 | attained, retired (359 decisions) | attained, retired (376 decisions) |
| 34 | **died to grey mold, depth 1, 45 decisions** | **attained, retired (598 decisions, 7 kills)** |
| 49 | attained, retired (143 decisions) | attained, retired (143 decisions - byte-identical retirement) |

## What moved, and why (traced to the fix)

- **Seed 34 is the unit case, and the outcome changed**: the postmortem's
  exact grey-mold death (turn 1365, 45 decisions, the back-away/flee
  oscillation at 26% hp) no longer happens. The fixed borg kills the 1-hp
  blocker (the kill-shot appraisal yields back-away to the attack chooser -
  7 kills this run where the old run had 1) and grinds to clvl 2 at depth 1,
  retiring at 598 decisions. The run is LONGER (7831 turns) because it now
  fights instead of oscillating - turns spent, not wasted.
- **Seed 20 shared the family, and moved too**: its baseline dossier
  (`../2026-11-03-stage-baseline-c2d1/postmortem/seed-20/`) shows the same
  two-grid oscillation (123,45 ↔ 124,45, thirty alternating walks beside the
  floating eye, paralysed to death at depth 1). The eye is 11/11 hp, so the
  KILL-SHOT half could not engage there - the BOUNCE-GUARD half did: with
  `track_step` now recorded and the health gate removed, the bounced grid is
  refused and the interlock breaks. The after-run walks past the eye (5
  kills), dives to depth 2, and dies at clvl 1 to a NEW cause - see below.
- **Seed 49 is byte-identical** (143 decisions, 1405 turns, same kills,
  same command census): the fix is observationally neutral where neither
  half engages. Seed 23 retired with 17 more decisions than baseline (kills
  unchanged at 11) - its path changed without changing its fate; WHICH half
  moved it is not separable from this record and is not claimed.

## The new seed-20 death (the honest boundary, follow-on material)

The one death this session is NOT the old family replayed deeper: the
after-run's seed 20 dies to confusion spores from a 1/1-hp grey mushroom
patch at depth 2 - the dossiers here (`postmortem/seed-20/`) freeze the
last 20 turns: "You are confused" throughout, the character wandering
beside the one-hit blocker it never swings at. Neither B32 half can engage
while confused: back-away's own C gate returns early on confusion
(caution.c:1679), and the kill-shot appraisal sits after that gate by
design (it suppresses back-away; it is not an attack path), while the
attack chooser's thrust arm carries no confusion gate in the C or the port
- whatever declined that thrust is a NEW diagnostic question, filed as B32's
follow-on observation, not changed here.

## Provenance

- **What played**: the warrior pack (stock parameters), planned births, one
  character per seed, retirement chaining the next seed exactly as a death
  does. `runner.stage: {clvl: 2, depth: 1}`; per-run `stageAttained`/
  `retired`/`unsure` recorded (schema `better-borg/runs@1` - additive; the
  `unsure` fields are #27's and read 0 across this cohort).
- **Mod commit**: `task/B32-caution-attack@ef7f2235` (the fix commit; the
  C-fidelity check is `docs/tasks/B32.md`).
- **Engine**: published `@rpgm-tools/neo-angband-core` 1.23.0-beta.1
  (package.json pin), bundled from `node_modules`; fingerprint
  `c89b1b08474b1692b352f8d0b64823f4` for `dist/game/trap.js` before and
  after the session - the engine stayed pristine.
- **Content**: sibling checkout `neo-angband@b53ff5f0b` (content pack only;
  no engine patches - the instrument's contract).
- **Instrument**: `node tools/runs.mjs --label b32-stage-c2d1 --stage 2,1
  --seeds 20,23,34,49 --cap 10000`; the postmortem ladder by `node
  tools/replay.mjs --record docs/runs/2026-11-03-b32-stage-c2d1` (every
  rung verified EXACT - the fixed borg replays its own record
  deterministically, which is what re-points the replay-exactness test to
  this directory).

## What the numbers mean for the next task

The project's number is **75%** (3/4 at c2d1 over the standard grid). The
remaining death is the confused-beside-a-one-hit-blocker posture (seed 20's
new death) - a cousin of this task's family that the confusion gate keeps
every current rung out of, and the natural next diagnosis. When that (or
anything else) lands, re-measure on this grid and write a new directory
beside this one.
