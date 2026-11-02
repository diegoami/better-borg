# 2026-11-02 - The door-closing defect: an engine gap, not a mod one

B01's subject: seed 1 issues `close` 771 of 1500 decisions (health cap 750).
The diagnosis chased the rung (`src/flow/flow.ts:606-642`, the faithful port of
`borg_play_step`'s breeder close block, `borg-flow.c:629-698`), the state that
arms it (`breederLevel`, faithfully set at `src/think-ladder.ts:542-549` from
`borg-think-dungeon.c:1352-1372`), and the map that feeds it — and the mod is
faithful at every step. The defect is in the ENGINE
(`@rpgm-tools/neo-angband-core` 1.23.0-beta.1), and this record is the
evidence. Nothing in the mod changed; per the task's instruction 5 (and the
neowarrior-borg locked-door precedent), a wrong-in-the-mod fix for an engine
bug is worse than no fix, so B01 stops here and reports.

- **Mod**: branch `task/B01-door-close`, bytes unchanged from `main`.
- **Engine**: published `@rpgm-tools/neo-angband-core` 1.23.0-beta.1,
  temporarily patched for causality proof only (restored byte-identical,
  `cmp`-verified, see `runs.json` → `causalityProtocol`).
- **Content**: sibling checkout `neo-angband` at `fc68bccc1`.

## What actually happens

Decision #730, depth 1: the Borg stands at 152,53; the door at 153,53 is open,
known and in view; `breederLevel` is set (4 awake kills, ≥3 of them MULTIPLY —
worm masses on depth 1; faithful). It issues `close`. The engine's `closeAux`
runs `state.chunk.setFeat(grid, FEAT.CLOSED)` — and that is ALL it does.

From #731 to #1500, every decision reads:

| source | value at 153,53 |
| --- | --- |
| engine chunk (live terrain) | `closed door` |
| raw host cell `feat` (live) | 2 (CLOSED) |
| raw host cell `knownFeat` (player memory) | **3 (OPEN), forever** |
| Borg's map (copies remembered terrain) | 3 (OPEN) — faithful |
| engine reply to `close` | "You see nothing there to close.", **0 energy** |

The turn counter freezes at 8691 for 770 consecutive decisions: a free-refusal
loop, the same shape as the 2026-08-21 disarm hang. Because a refused command
spends no energy, no turn passes; because no turn passes, the Borg never
walks; and in this engine a walk is the only thing left that refreshes the
player's known map (`player-turn.ts` calls `state.updateFov` → `noteSpots`).
The loop is self-locking.

## Why this is the engine's defect (the C)

Upstream Angband 4.2.6 guarantees the player's memory updates when terrain
changes under their eyes, in three places, and the engine ported none of them:

1. **`square_set_feat` itself** — the live path (`character_dungeon`) ends with
   `square_note_spot(c, grid); square_light_spot(c, grid);`
   (`reference/src/cave-square.c:1256-1262`). `square_note_spot`
   (`cave-map.c:226-246`) memorizes the SEEN grid. The engine's port of this
   branch, `Chunk.onFeatSet` (`game/trap.ts:203-217`), cites
   "cave-square.c:1256-1259" and ports **only the trap half** — the
   `square_note_spot` arm is dropped. The engine even has the exact function
   (`noteSpot`, `game/known.ts`, its own comment: "this door exists for the
   sites upstream notes a single grid OUT of band … any site that changes what
   is on a grid and cannot wait for the next pass") — `setFeat` never calls it.
2. **`do_cmd_close_aux`** — closes, then `square_memorize(cave, grid)` and
   `PU_UPDATE_VIEW | PU_MONSTERS` (`reference/src/cmd-cave.c:393-398`): the
   close path itself re-memorizes AND forces a view update (a closed door
   blocks torch light). The engine's `closeAux` (`game/cave-cmd.ts:390`) does
   neither.
3. **`do_cmd_close_test`** — even the refusal path repairs memory: a
   remembered-open door that is not there is forgotten
   (`cmd-cave.c:337-341`). The engine's `close` handler refuses with the same
   message but no forget (`cave-cmd.ts:937-943`); the forget it DOES have sits
   in `closeAux`'s duplicate check, unreachable from the handler's early-out.

The shipped desktop game masks the whole class: the web front end re-runs the
full `updateView` + `noteSpots` pass after every state-changing action (the
engine's own comment at `game/known.ts:306-310` says so). The headless harness
(`runGameLoop`) does not, so the frozen AgentView reads the stale `knownFeat`.
That is why the watched desktop runs never showed this and the play harness
does.

## Why the mod is faithful, not the culprit

- `ingestMap` (`src/perceive.ts:154-178`) copies the REMEMBERED terrain —
  through `rememberedCell` (`src/core-api.ts:392-404`), which prefers
  `knownFeat` over live `feat`. For a door the player has seen, the C borg's
  screen shows the door's true state, because upstream's `note_spot` passes
  keep memory == live for seen grids. Reading remembered terrain IS the
  faithful model of that; reading live terrain instead would hand the Borg
  `FEAT_SECRET` for undiscovered secret doors (privileged information, rule 5).
- The close block itself (`src/flow/flow.ts:606-642`) is a line-by-line port
  of `borg-flow.c:629-698`, including the `track_door` bookkeeping. Neither
  the C nor the port checks the track list in the scan — the C's anti-loop is
  exactly "the map now shows CLOSED", which relies on the engine invariant
  above.
- `breederLevel` (≥3 awake MULTIPLY monsters) is set exactly where the C sets
  it; depth 1 genuinely has that many awake worms.

## The proof (causality in both directions)

One diagnostic line in the installed engine — `noteSpot(state, grid)` added to
`installChunkFeatHook`'s hook, restoring `cave-square.c:1261` — with the mod's
bytes untouched and the health cap untouched:

| | pristine 1.23.0-beta.1 | + `noteSpot` line |
| --- | --- | --- |
| `src/play.test.ts` | 5/6, seed 1 fails (close 771/1500) | **6/6 green** |
| seed-1 census | close 771, walk 659, turns frozen at 8691 | **close 0**, walk 1026, rest 131, pickup 6, tunnel/wield/takeoff — real play |
| seed-1 turns at 1500 decisions | 8691 | 8567 by decision 702 (dies at depth 2, clvl 2 — an ending, not a stall) |

The engine file was then restored from the saved original (`cmp` clean,
`runs.json` → `causalityProtocol`), and seed 1 failed again with the identical
count 771 — the same bit-for-bit reproduction the import baseline recorded.

## The sweep (5 seeds × 1500 decisions, mod bytes identical, only the engine differs)

| seed | engine | decisions | turns | maxDepth | clvl | places | dead | close |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | pristine | 1500 | **8691** | 1 | 1 | 421 | no | **771** |
| 1 | +noteSpot | 702 | 8567 | **2** | 2 | 442 | yes | 0 |
| 7 | pristine | 1228 | 15773 | 1 | 2 | 611 | yes | 0 |
| 7 | +noteSpot | 1266 | 18139 | **2** | 2 | 672 | yes | 0 |
| 42 | pristine | 1500 | 17914 | 2 | 3 | 945 | no | 0 |
| 42 | +noteSpot | 1500 | 18032 | 2 | 2 | 873 | no | 0 |
| 99 | pristine | **124** | 1214 | 1 | 1 | 61 | yes | 0 |
| 99 | +noteSpot | 1500 | 15817 | 1 | 2 | **842** | no | 0 |
| 2026 | pristine | 1162 | 17451 | 2 | 2 | 583 | yes | 0 |
| 2026 | +noteSpot | 519 | 6030 | 2 | 2 | 263 | yes | 0 |

No seed loses depth; `close` disappears everywhere; seed 1 unfreezes and
reaches its deepest depth; seed 99, which died at decision 124 pristine, plays
all 1500. Seed 2026 dies sooner patched — an ordinary death (an ending in the
harness's terms), same max depth. Raw JSON in [`runs.json`](runs.json).

## What this means for B01

Done-when 1 (seed 1 passes, cap unchanged) and the green half of Done-when 3
are **not meetable from inside the mod**: the cap must not move, the census
must change, and the only thing that changes the census honestly is an engine
fix. The prepared PR body for the engine repository is
[`docs/upstream-prs/B01.md`](../../upstream-prs/B01.md). Once the engine ships
it, this fork raises its engine floor and the seed-1 check goes green on the
pinned new engine — B01's mod-side follow-through, for the main session to
re-run then.
