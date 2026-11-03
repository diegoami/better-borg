# 2026-11-03 - b40-long-seed34: the #35 long life, completed

Seed 34, no stage, cap 60000, planned warrior lineage, stock parameters, on
the published engine **plus our carried patches** (#429 noteSpot, #432
input-flush; see `../2026-11-03-b40-stage-c2d1/`).

**Why it exists**: #35. On the published engine this life never finished.
It held depth 1 from decision 2362 on, issuing `close` at the same door (the
#428 noteSpot gap), until the borg's per-level clock reached 30000 at
decision 31362. The faithful clock-overflow stop then fired
(`borg-think-dungeon.c:1209` = `src/think-ladder.ts:510`, the borg yields),
and the driver's census guard failed the session: 31361 commands over 60000
decisions. No record could be written.

**On the patched engine** the life plays out and the census balances:

| seed | decisions | turns | depth | clvl | kills | outcome | `close` commands |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 34 | 637 | 9830 | 1 | 3 | 8 | died to a crow | 0 |

The death is an ordinary one: without a stage target the life does not
retire. It is the dead run `src/postmortem/replay.test.ts` replays from B40
on (the B32 record's seed 20 no longer dies on this engine).
