# Post-mortem dossier ladder - stage-baseline-c2d1

The death-replay trainer's export for every dead run in `docs/runs/2026-11-03-stage-baseline-c2d1` (recorded 2026-11-03T11:26:24.196Z): one deterministic dossier per dead run x ladder rung, written by `tools/replay.mjs` replaying the recorded seed with the same planned birth. The AI post-mortem workflow is docs/postmortem.md; a diagnosis artifact lands beside the dossiers it was written from (seed-<n>/diagnosis.md).

| seed | died to | turn | ladder rungs | replay |
| --- | --- | --- | --- | --- |
| 20 | floating eye | 5049 | -5t:none, -10t:none, -15t:5035, -20t:5035 | exact |
| 34 | grey mold | 1365 | -5t:none, -10t:1357, -15t:1357, -20t:1347 | exact |

The rung column names each offset's release boundary turn (`-<offset>t:<turn>`; `none` marks a rung whose boundary never came - the death crossed it in one decision). Each dossier's rung section carries the two settings that arm the human replay path (`borg.replayReleaseTurn`, `borg.replayDeathTurn`).

