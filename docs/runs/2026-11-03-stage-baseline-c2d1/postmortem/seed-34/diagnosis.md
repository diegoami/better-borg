# Diagnosis - seed 34, grey mold at turn 1365

A level-1 Half-Troll warrior, hurt and out of heals, tried to flee depth 1
through the one up-staircase - which sits beyond a grey mold - and
oscillated between the two grids in front of the mold (backing away, then
flowing back toward the stair) until the mold's spores killed it; it never
swung at the mold, which had 1 hit point and would have died to one dagger
thrust.

Written by the AI post-mortem routine (docs/postmortem.md) from
[offset-20.md](offset-20.md) and [offset-10.md](offset-10.md) (both share
the death spiral; offset 20 shows its start), against the decision code at
`task/B29-death-replay` (the warrior pack, stock parameters). The replay
that produced the dossiers reproduced the recorded death line exactly
(cause, turn 1365, 45 decisions, the whole census) - everything below is
the recorded run, not a variant of it.

## What happened (from the dossiers)

- The character entered depth 1 (decision 1, `descend`), cleared the early
  corridor, and took its first spore hits around the quaff: the ONE potion
  of the life - a Potion of Berserk Strength, which also heals ("You feel
  much better." / "You feel like a killing machine!") - went down early,
  and "You have no more Potions of Berserk Strength (b)." closed the heal
  economy for the rest of the run (offset-20's message tail).
- Decisions 26-28 (`open` x3) ground a locked door: the engine's open
  command self-repeats on a locked door ("We may keep trying",
  `cave-cmd.js` `openAux`), so three decisions spent ~93 lock attempts
  ("x21"/"x72 You failed to pick the lock") - turns of exposure, though not
  next to the mold.
- The death spiral is the trail's last eight moves (offset-20, decisions
  36-43): `walk` alternating `1:73,13` (adjacent to the mold at `73,14`)
  and `1:73,12` (one north), `alone=no` throughout, hit points 6/23 at the
  boundary, the mold at 1/1 hp visible on the screen the whole time. Two
  more decisions (44-45, past the offset-20 boundary) took the counter
  from 1347 to 1365 and the death.
- The census to the boundary: `walk x38, open x3, descend x1, quaff x1` -
  note the port's melee is also a `walk` (`act.ts` maps `melee(dir)` to
  `walk`), but the trail's alternating grids prove these eight were real
  moves, not thrusts.

## What the code did (each decision, named)

1. **Why flee at all.** `borgCaution` (src/fight/caution.ts:472) sets
   `goal.fleeing` when `posDanger > CURHP * 2`: at 6 hit points that bar is
   12, and an adjacent mold clears it. The Stairs section (caution.ts:505) then sets
   `stairLess`, and the think ladder's flow stages (`GOAL_FLEE`, think-
   ladder.ts:1230ff) walk the character toward the remembered up-staircase
   - which the screen shows beyond the mold (`#<#` south-east of it). The
   only route to the stair passes the mold's grid.
2. **Why step back.** At `73,13`, adjacent to the mold, `borgBackAway`
   (caution.ts:659) fires: `posDanger > avoidance * 4/10` with
   `noRetreat < 1`, and the safest adjacent grid is `73,12` - so the
   command is a step north. This stage runs BEFORE the ladder's attack
   stage (think-ladder.ts:675, `borgAttack(ctx, false)` at :1596 in the C's
   order): **while adjacent, the thrust was never even evaluated.**
3. **Why step forward again.** At `73,12` the mold is two grids away:
   `posDanger` falls under the back-away bar, `borgAttack` returns null
   (thrust needs distance 1, attack.ts `auxThrust`; the character has no
   bow and no ammo for `auxLaunch`), and the ladder falls through to the
   flow stages - whose flee target still lies beyond the mold - so the
   next step is back to `73,13`.
4. **Why forever.** `borgBackAway` has bounce detection (caution.ts:695)
   but refuses an oscillation only "while healthy" - `CURHP >= MAXHP *
   7/10`. At 6/23 (26%) the guard is off, so the back-away/flow interlock
   runs unbounded while the spores land on every adjacent turn.
5. **The never-taken alternative.** One thrust kills the blocker: the mold
   had 1/1 hp against a dagger (1d4). `auxThrust` (attack.ts:1126) would
   have scored it - the mold was awake and visible, so its candidate gates
   pass - but the function is only reached from the attack stage, which
   the back-away pre-empted at the adjacent grid and range precluded at
   the far one.

## What should have differed (per rung)

- **Both capture rungs (10 and 20) show the same interlock already in
  force** - the oscillation is fully formed at turn 1347 (offset 20) and
  identical at 1357 (offset 10). Nothing in the last 20 turns was a
  decision that could have ended differently inside the current ladder
  order; the wrong call is structural, not a valuation miss.
- **Attack-before-retreat when the blocker is one hit from death**: if an
  ADJACENT monster would die to one average thrust (thrust damage at or
  above the kill's current estimated hp - for a 1-hp mold with an unhurt
  health band, any hit qualifies), attacking it IS the retreat - it removes
  the danger the back-away is fleeing and opens the path the flow wants.
  This is a CHOICE on 4.2.6 (the C's ladder also runs caution's back-away
  before the attack stage; verifying the exact C order against
  borg-caution.c is the follow-on's first check, in case it is a port
  DEFECT).
- **The bounce guard's health gate disables oscillation detection exactly
  when oscillation is lethal** (below 70% hp). Refusing to re-take the
  grid the borg just backed away from - at any health - would break the
  interlock after one cycle (the borg would stand at range or take a
  different route). Also a CHOICE unless the C differs.
- **The heal economy**: the only potion went down early (berserk's small
  heal at the first spore hit, ~130 hp-percentages before the death), so
  caution's cure ladder (caution.ts:135-146) had nothing to offer at the
  spiral. An early-game "keep one cure" valuation is #28's rail, not this
  diagnosis's to change.

## Inventory verdicts (the pack, the equipment, the home)

- Pack: 2 rations, 1 word-of-recall scroll - nothing miscarrried, nothing
  to sell, nothing that saves a 6-hp fight. The verdict is on the BIRTH
  KIT's size (one potion for a level-1 diver), not on a keep/discard call:
  no discard decision appears in the census (no `drop`).
- Equipment: dagger, torch, soft leather - the stock outfit; no swap
  existed to make (B03's rail).
- Home: empty (never visited). No stashing verdict is possible from this
  run; the home section is carried for the runs where it matters (#30's
  observation).

## Follow-on

- Filed as the trainer loop's first fruit: a task proposal for the
  one-hit-blocker exception and the bounce guard's health gate
  (the reach-rate at c2d1 - 50% - moves if either lands: seeds 20 and 34
  are the two deaths of the baseline's standard grid, and both died in
  goal-flee spirals a thrust could have broken). This diagnosis is the
  reproduced evidence; the task owns the measured change.
- Secondary observation for the strength rail: three `open` decisions
  spent ~93 lock attempts (the engine's open self-repeats on locked
  doors) - a lock-picking budget or a give-up-after-N rule would save
  turns, though it did not kill this character.

*Honest limits*: the exact C order of caution's back-away versus the attack
stage is cited from the port's own commentary, not re-verified against
borg-caution.c this session; and the last two decisions (1347 to 1365,
past the offset-20 boundary) are inferred from turn stamps, not directly
trailed - offset 10's dossier (boundary 1357) covers them.
