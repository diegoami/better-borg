# Run records

The project's number is **reach-rate at the chosen stage** (#25, the purpose
redirect of 2026-11-03): the fraction of a fixed seed cohort whose runs
attained the target stage (`clvl >= borg.stageClvl` AND a first arrival at
depth `>= borg.stageDepth`) over the headless harness. Deepest depth stays
the LADDER's axis - each stage's kept saves are the next stage's starting
points (#26) - but it stopped being the headline: a change exists to move
the reach-rate (or a proxy the record names) and is measured by the harness
before it merges. Every claim about either number traces to a directory
here. Records are append-only: a completed session is never edited, and a
changed harness or changed build writes a new
directory whose notes say what changed (rule 5 in `docs/process.md`).

## Format

One directory per measured session: `YYYY-MM-DD-<label>/` containing:

- `runs.json` - the raw per-run records the harness wrote. One entry per
  character: build (race, class, base stats), seed, decisions, turns, max
  depth, character level, kills, gold, cause of death, and the command
  census (what the decision loop actually did).
- `summary.md` - the computed layer the runners (`tools/sweep.mjs` for
  stock sessions, `tools/runs.mjs` for pack sessions - both B02+) write
  beside it: the per-run table and the cohort statistics (median and
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
  `decisions`, `seeds`, `lives`, `stage`), `build` (`commit`, `engine`, `content`,
  `borg`), `runs`.
- each run: `seed`, `life` (1-based; a life is one character, later lives are
  the engine's own reincarnation in the same session), `race`, `class`,
  `baseStats` (birth stats in the pack's order), `decisions`, `turns`,
  `depths` (every depth stood on), `maxDepth`, `clvl`, `gold`, `kills`,
  `places`, `dead`, `causeOfDeath`, `commands` (the census), `jitter`,
  `restedBesideMonster`, `stageAttained`, `retired`, and `meta.wallClockMs` -
  wall clock is metadata and never influences a result (rule 5).

The stage fields are #25's ADDITION, and the schema id string stays
`better-borg/runs@1` (a format identifier committed byte-identically into
existing records, rule 7): `runner.stage` names the rung a cohort ground
toward (`{clvl, depth}`) or `null` when the session played none, and each
run carries `stageAttained` (the predicate - character level AND first
arrival depth both past the thresholds) beside `retired` (the bookkeeping -
the retire protocol kept a save, so a library slot exists). Records written
before #25 carry neither key: a reader treats absence as `stage: null` and
attainment false. The reach-rate itself is DERIVED (attained / runs) and
lives only in `summary.md`, like every computed number.

Earlier records (`2026-11-02-import`, `2026-11-02-door-close`) predate the
runner and use the diagnosis-session shape their READMEs describe; the
schema above is what every session from B02 on carries - and, since the M2
unification (#15), the ONE schema both runners write; the ported
neowarrior-borg records below it keep the archived fork's own shape (see
Provenance).

## Provenance

Three directories were moved here from the archived fork
`diegoami/neowarrior-borg` at its v0.1.0 tag (`e1ec1b7`,
"T08 review round 1", 2026-11-02) when its class-agnostic instruments merged
into this repository (#15, the M2 unification; the doctrine is docs/
process.md section 2). Each is unchanged, byte for byte, as it was committed
there:

| Directory | Committed there at | What it is |
| --- | --- | --- |
| `2026-11-02-import-neowarrior/` | `301abd7` (the import boundary; directory named `2026-11-02-import` in the source repo) | The archived fork's own import baseline - renamed on the move because this repository already carries ITS import baseline as `2026-11-02-import/` (both forks imported upstream at the same boundary; both baselines stay) |
| `2026-11-02-t06-first-warrior-session/` | `task/T06-run-records` (mod 0.1.0) | The first measured warrior session: four planned Half-Troll warriors, all died on depth 1 |
| `2026-11-02-bakeoff/` | `task/T07-bakeoff` (mod 0.1.0) | The race bake-off: 4 candidate races x 8 fixed seeds x cap 600 x 2 engine variants, byte-proven applied and reverted |

The archived repository's history is the immutable record of how those
numbers were produced; this table is how a reader here finds them.

### Which schema wins going forward

`better-borg/runs@1` (the schema above) is the ONE shape every session from
the unification on is written in - by `tools/sweep.mjs` for stock-Borg
sessions and by `tools/runs.mjs` for pack sessions, both through the ONE
record writer (`src/run-record.ts`, asserted by `src/run-record.test.ts`).
It wins because it is the schema this repository's committed B02 record
already carried, and because its provenance bundling (`build.commit`,
`build.engine`, `build.content`, `build.borg`) is what Phase 2's fitness
evaluator needs to attribute a column without re-running.

The ported directories predate that decision and keep their own shapes
exactly as committed: the archived fork's reporter format (a `build` block
of `mod`/`engine`/`content`/`seeds`/`caps`, one entry per character; the
bake-off adds per-run `variant` and `deathDepth` fields and a `variants`
declaration). Nothing here parses them - they are history, read by humans -
and one counting difference matters when comparing them against later
records: the archived fork's fix for its review issue #36 (count the killing
decision) is the rule the unified session runs on, so a dying run in a
post-unification record shows one MORE decision than the archived reporter
would have written for the same play (B02's committed seed-7 entry is the
in-repo example: 1228 recorded, 1229 issued).

## Standing metrics

| Metric | Meaning |
| --- | --- |
| `stageAttained` | Whether the run attained the session's stage (#25): character level AND first-arrival depth both past its thresholds |
| `retired` | Whether the retire flow KEPT a save of the run (#25): a renamed library slot exists (the pack driver and the mod; the stock sweep measures attainment only) |
| reach-rate | The fraction of a cohort that attained - the project's number, computed by the reader layer (never inside runs.json) |
| `maxDepth` | Deepest dungeon level (0 = town) that character stood on - the ladder's axis |
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
| `2026-11-02-import-neowarrior/` | moved from neowarrior-borg `301abd7` | The archived fork's starting point: the same upstream suite state on the same pin and machine (its README describes its one recorded play-harness failure). Renamed on the move; this repository's own import baseline stands beside it as `2026-11-02-import/` |
| `2026-11-02-t06-first-warrior-session/` | moved from neowarrior-borg `task/T06-run-records` | The first measured warrior session: four planned Half-Troll warriors, all died on depth 1; the journal and reporter this record came from were that task's own acceptance |
| `2026-11-02-bakeoff/` | moved from neowarrior-borg `task/T07-bakeoff` | The race bake-off: 4 candidate races x 8 fixed seeds x cap 600 x 2 engine variants (pin vs the noteSpot patch, byte-proven applied and reverted) - median depth ties at 1 everywhere; High-Elf reaches depth 2 on the most seeds in both variants, Dunadan survives the pin best, the incumbent Half-Troll worst on both rates; the fix is neutral for planned warriors at this budget. Its recommendation (High-Elf, default 2) is the warrior pack's `borg.raceChoice` default today |
| `2026-11-03-b15-verify/` | B15's unified runner on B15's own tree | The unified session module reproduces B02's record field-for-field on the same cohort (seed 1 close 771, turns 8691; seed 42 identical) - the stock path did not move; seed 7's `decisions` is 1229 against B02's 1228, the adopted #36 counting rule (count the killing decision) and the only difference |
| `2026-11-03-stage-baseline-c2d1/` (+ `-c1d1`, `-c2d2`) | B25's stage rail on B25's own tree | The stage baseline that calibrated the default: three candidate rungs over the standard grid at cap 10000 - c1d1 4/4 (100%, degenerate floor), **c2d1 2/4 (50%, the chosen default - the strongest rung inside the measured frontier)**, c2d2 0/4 (stretch, no warrior reaches depth 2 alive). The project's number starts at 50%; the first library cohort (seeds 23, 49) is what the ladder (#26) resumes from |
