# Post-mortem dossier ladder - b32-stage-c2d1

The death-replay trainer's export for every dead run in `docs/runs/2026-11-03-b32-stage-c2d1` (recorded 2026-11-03T16:13:13.617Z): one deterministic dossier per dead run x ladder rung, written by `tools/replay.mjs` replaying the recorded seed with the same planned birth. The AI post-mortem workflow is docs/postmortem.md; a diagnosis artifact lands beside the dossiers it was written from (seed-<n>/diagnosis.md).

| seed | died to | turn | ladder rungs | replay |
| --- | --- | --- | --- | --- |
| 20 | grey mushroom patch | 3014 | -5t:3011, -10t:3011, -15t:3001, -20t:3001 | exact |

The rung column names each offset's release boundary turn (`-<offset>t:<turn>`; `none` marks a rung whose boundary never came - the death crossed it in one decision). Each dossier's rung section carries the two settings that arm the human replay path (`borg.replayReleaseTurn`, `borg.replayDeathTurn`).

