# The declared-gaps inventory (#34, step 2)

Every place the port itself says it is not faithful to the 4.2.6 C borg: a
"not ported", "left out", "unported", "not yet ported", "TODO" or
"approximat…" marker in `src/` (tests excluded). There were 38 such lines on
2026-11-04. Each was read against its C site and classified:

- **A. Stale**: the note claims a gap, but the code is complete. Fix the note
  (#58), because a stale excuse already hid a real defect once (#55).
- **B. Fixable gap**: a real divergence whose excuse no longer holds. Port it:
  an issue, a scenario test, and an upstream report.
- **C. Legitimate**: the engine truly lacks the data or the command, or the
  divergence has no gameplay effect. It stays, documented.
- **Ours / faithful**: our own code, or the C's own approximation ported
  verbatim.

Re-run the inventory with:

    grep -rn -i -E "not ported|left out|unported|not yet ported|TODO|approximat" src --include=*.ts | grep -v "\.test\.ts"

## B. Fixable gaps (port defects)

| Site | Gap | Issue |
| --- | --- | --- |
| `src/flow/flow-misc.ts:336` (flow_recover) | `borg_primarily_caster` read as "has spell points", so hybrids recovered for SP | #57, fixed (neo-angband#437, PR mod-borg#28) |
| `src/flow/flow-misc.ts:200` (check_rest) and the think ladder's `:1652` rung | the PF_COMBAT_REGEN gates; the excuse "the view does not carry player flags" was false since engine 1.3.0 | #55, fixed (neo-angband#436, PR mod-borg#26) |
| `src/flow/flow.ts:22`, `:695` (play_step) | disable-traps activation and spell, destroy-doors and stone-to-mud at doors, chest and Orb of Draining branches | #59 |
| `src/think-ladder.ts` (seven rungs) | drop_hole, drop_slow, dump_quiver, play_magic (twice), wear_recharge, and swap/wear rings | #50 (#4 for rings) |

## A. Stale notes (code complete)

| Site | The note said | The truth |
| --- | --- | --- |
| `src/flow/flow.ts:17` | borg_danger and trait[] not yet ported; danger defaults to 0 | ported; `FlowHooks.danger` is `borgDanger` (think-session.ts:187) |
| `src/flow/flow.ts:96` | FlowHooks live in subsystems not yet ported | all 11 hooks wired (think-session.ts, buildFlowHooks) |
| `src/flow/flow-glyph.ts:7` | laying a glyph needs subsystems not yet ported | `layGlyph`: Glyph of Warding or Rune of Protection |
| `src/flow/flow-take.ts:6` | the empty-slot check needs the inventory model | `packFull` wired |
| `src/think-ladder.ts:20` | must_return_to_town approximated by borgRestock | ported with both guards (think-ladder.ts:211-226) |
| `src/flow/flow-misc.ts:10` | one borg_check_rest arm still missing | ported (#55) |

All corrected in #58.

## C. Legitimate (stays)

| Site | Divergence | Why it stays |
| --- | --- | --- |
| `src/item/item-id.ts:8` | IDd items are not inscribed with their powers | UI-only in the C; the engine has no inscribe command |
| `src/think-ladder.ts:496` | the destroy-floor rung (borg-think-dungeon.c:1205) yields | the engine has no ignore or destroy command |
| `src/item/item-use.ts:191` | EF_NOURISH food filter read as "any aware food" | `ItemView` carries no effect data |
| `src/store/home.ts:195`, `:329`, `src/store/sell.ts:405` | random-power egos read as "needs *ID*" | `ItemView` carries no random-power data |
| `src/store/home.ts:411` | KF_GOOD dungeon books via a seam | no kind-flag data on the view |
| `src/fight/escape.ts:15` | square_isvault | `CellView` has no vault flag (the C reads the cave) |
| `src/item/item-wear.ts:152` | a swap that raises danger is not refused | needs borg_danger over a simulated loadout; the wear seam answers power only |
| `src/flow/flow-misc.ts:14` | borg_detect_door's per-panel suppression | the port has no panels; door detection is time-stamped (light.ts) |
| `src/flow/flow-take.ts:10` | the lunal-mode take variant, the gold-scum cheats | their modes are off in stock config |
| `src/danger/danger.ts:18`, `src/danger/facts.ts` | a default monster-facts resolver | used only without the truth domain; with it, the real race record |
| `src/perceive-messages.ts:231`, `:287` | borg_locate_kill's guess; two branches with no analogue | the port is told which grids hold monsters and has no panel |
| `src/trait/trait.ts:434` | the acid-damage to_a hack on a copy | same arithmetic, without mutating the view |

## Ours, or faithful

- **The C's own approximations, ported verbatim**: `src/perceive.ts:193` (the light distance), `src/danger/geometry.ts:41` (the game's grid distance), `src/fight/attack.ts:1057` (atan2).
- **Our code**: `src/loop/stall.ts`, `src/trait/player-flags.ts`, `src/class/warrior/plan.ts`, `src/api2/world.ts`, `src/core-api.ts`.

## Next

#59 (the play-step branches), then #50's rungs, in the order a measured run says they bite. Then step 3 (#31, the class × seed grid) and step 4 (#34's subsystem audit).
