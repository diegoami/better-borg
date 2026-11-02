# Run records

The project's number is **the deepest depth a warrior reaches**. Every claim
about it traces to a directory here. Records are append-only: a completed
session is never edited, and a changed harness or changed build writes a new
directory whose notes say what changed (rule 5 in `docs/process.md`).

## Format

One directory per measured session: `YYYY-MM-DD-<label>/` containing:

- `runs.json` - the raw per-run records the harness wrote. One entry per
  character: build (race, class, base stats), seed, decisions, turns, max
  depth, character level, kills, gold, cause of death, and the command
  census (what the decision loop actually did).
- `summary.md` - the computed layer the runner (B02+, `tools/sweep.mjs`)
  writes beside it: the per-run table and the cohort statistics (median and
  mean maxDepth, deaths, kills) derived FROM `runs.json`. Derived numbers
  live here, never in the primary record - a run record's raw facts are
  never pre-interpreted.
- `README.md` - the curated table a human reads, plus the context the JSON
  cannot carry: which commit played, which engine and content, what changed
  since the previous session, and what the numbers mean for the next task.

A watched desktop run (a human or a CDP driver watching the real window) adds
`watched.md` in the same shape the upstream mod's PLANNED.md used: what was
seen, message by message, and the answers to the standing questions - did it
flee, shop, rest, descend, die, and start again.

Bulky by-products (screenshots, video, long traces) live outside git in
`artifacts/` and are linked by path, never committed (rule 7).

### The runner's runs.json (schema `better-borg/runs@1`)

What `tools/sweep.mjs` writes, asserted by `src/run-record.test.ts` - the
field list is a contract, not a suggestion:

- top level: `schema`, `recorded` (ISO timestamp), `label`, `runner` (`tool`,
  `decisions`, `seeds`, `lives`), `build` (`commit`, `engine`, `content`,
  `borg`), `runs`.
- each run: `seed`, `life` (1-based; a life is one character, later lives are
  the engine's own reincarnation in the same session), `race`, `class`,
  `baseStats` (birth stats in the pack's order), `decisions`, `turns`,
  `depths` (every depth stood on), `maxDepth`, `clvl`, `gold`, `kills`,
  `places`, `dead`, `causeOfDeath`, `commands` (the census), `jitter`,
  `restedBesideMonster`, and `meta.wallClockMs` - wall clock is metadata and
  never influences a result (rule 5).

Earlier records (`2026-11-02-import`, `2026-11-02-door-close`) predate the
runner and use the diagnosis-session shape their READMEs describe; the
schema above is what every session from B02 on carries.

## Standing metrics

| Metric | Meaning |
| --- | --- |
| `maxDepth` | Deepest dungeon level (0 = town) that character stood on |
| `clvl` | Character level at end of run |
| `kills` | Monsters slain (from the run report where available) |
| `turns` | Game turns elapsed - separates playing from stalling |
| `causeOfDeath` | The killer, as the message log named it |
| command census | Counts per command code - a loop shows up as one code dominating |
| `places` | Distinct depth+grid occupied - a decision loop leaves this tiny |
| `jitter` | Fewest squares in any monster-free 60-decision stretch (999 = none) |
| `restedBesideMonster` | Rest decisions taken with a monster adjacent (0 is the assertion) |

## Baselines

| Directory | Build | What it established |
| --- | --- | --- |
| `2026-11-02-import/` | import commit `70145c5` + rebrand | Same upstream suite state as neowarrior-borg's import (same pin, same machine): 420/421, the one failure the seed-1 door-closing defect - B01's subject, not a tolerated exception here (rule 7) |
| `2026-11-02-door-close/` | mod unchanged from `main` | B01's diagnosis: the defect is in the ENGINE (`setFeat`'s live path drops `square_note_spot`, cave-square.c:1261); mod faithful at every step; one engine line flips seed 1 to green (771 closes → 0), reverted byte-identical; PR draft in `docs/upstream-prs/B01.md` |
| `2026-11-02-b02-verify/` | B02's runner on B02's own tree | The extracted instrument reproduces B01's pristine record exactly (seed 1 close 771, turns 8691; seeds 7 and 42 bit-for-bit) - suite and runner share one session loop; `kills`/`gold`/`causeOfDeath` columns arrive with the runner |
