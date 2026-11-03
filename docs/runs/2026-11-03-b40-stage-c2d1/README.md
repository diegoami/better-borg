# 2026-11-03 - b40-stage-c2d1: our engine fixes, carried - 75% → 100%

THE B40 MEASUREMENT (#40). Same instrument, cohort and cap as B32's record
(`../2026-11-03-b32-stage-c2d1/`): seeds 20, 23, 34, 49, `--stage 2,1`, cap
10000, planned warrior lineage, stock parameters. ONE change: the engine is
the published `@rpgm-tools/neo-angband-core 1.23.0-beta.1` **plus the two
engine fixes we offered upstream**, carried as a pnpm patch
(`patches/`, process.md section 6):
- neo-angband PR #429 (fixes #428): `noteSpot` on the live `setFeat` path
  (cave-square.c:1261) - the door-close gap, tracked in our #13;
- neo-angband PR #432 (fixes #414): `disturb()` signals `input-flush`
  (player-util.c:1674), tracked in our #41.

No mod code changed. B32 is the BEFORE; this directory is the AFTER.

| stage c2d1 | reach-rate | library | deaths |
| --- | --- | --- | --- |
| before (B32, published engine) | 3/4 (75%) | 3 kept | seed 20 (grey mushroom patch, depth 2) |
| **after (this session, + carried patches)** | **4/4 (100%)** | **4 kept** | none |

## The per-seed facts (before → after)

| seed | before (B32) | after (this session) |
| --- | --- | --- |
| 20 | **died to a grey mushroom patch, depth 2, 250 decisions** | **attained, retired (328 decisions, 8 kills, depth 2)** |
| 23 | attained, retired (376 decisions) | attained, retired (602 decisions) |
| 34 | attained, retired (598 decisions) | attained, retired (409 decisions) |
| 49 | attained, retired (143 decisions) | attained, retired (664 decisions) |

## What moved, and which fix moved it

- **Seed 20 is saved by #429 alone.** A probe with ONLY the noteSpot fix
  (the input-flush hunk removed from the installed copy, restored after)
  played the identical life: 328 decisions, turn 3884, 8 kills, retired.
  So #38 (the confused-beside-a-mushroom death) was the stale-terrain gap,
  not a borg strategy defect: the owner's reading, confirmed.
- **Input-flush changes nothing for the borg.** The port never subscribes
  to `input-flush` (no use in `src/`); it is carried because it is our fix
  and an obvious bug, not because the borg needs it.
- Seeds 23, 34 and 49 play different lives: terrain memory now updates on
  every live feature change (open, close, tunnel), so the borg's known map
  differs from the first door onward. All three still attain.

## Provenance

`build.engine` names the patches (`tools/engine-pin.mjs` reads them from the
patch file). Engine fingerprint (trap.js md5) `34c27241f96aceff581bcb186a9d898f`
= published + carried patch (the published package alone is `c89b1b08...`).
