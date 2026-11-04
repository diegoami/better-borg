# Post-mortem dossier ladder - b54-desktop-death-replay

The death-replay trainer's export for every dead run in `docs/runs/2026-11-04-b54-desktop-death-replay` (recorded 2026-11-04T23:00:11.909Z): one deterministic dossier per dead run x ladder rung, written by `tools/replay.mjs` replaying the recorded seed with the same planned birth. The AI post-mortem workflow is docs/postmortem.md; a diagnosis artifact lands beside the dossiers it was written from (seed-<n>/diagnosis.md).

| seed | died to | turn | ladder rungs | replay |
| --- | --- | --- | --- | --- |
| 99110530 | giant yellow centipede | 2450 | -5t:none, -10t:2441, -15t:2441, -20t:2431 | exact |

The rung column names each offset's release boundary turn (`-<offset>t:<turn>`; `none` marks a rung whose boundary never came - the death crossed it in one decision). Each dossier's rung section carries the two settings that arm the human replay path (`borg.replayReleaseTurn`, `borg.replayDeathTurn`).

