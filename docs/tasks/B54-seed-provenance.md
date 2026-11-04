# B54 Retain original seed provenance

Kind: DEFECT in the engine's seed reporting and our headless report adapter.
Continuation of #54 and upstream tracker #42; this does not establish
desktop-to-harness replay parity.

## Reproduced defect

The web birth flow stores an advanced RNG continuation and reloads the
page. The old report used the new page's random seed rather than the
original game's seed. Loading a saved game had the same problem. Engine
regressions demonstrate original seed 4242 being reported as page seed
9001, and an unknown legacy continuation being falsely labelled 9001.

The headless report adapter also omitted the seed entirely: strengthening
the existing real death/archive test failed with missing seed 73, while
all its other death facts matched (grey mold, turn 4525).

## Correction

The source of the carried engine correction is upstream PR #433's
append-only commit `ffa0128b9b4acda5187f3b1dacac7d3c6b98e31d`.
It retains optional `GameState.masterSeed` across birth reload and
save/load, reports that value, and leaves unknown legacy provenance absent.
The correction consumes no additional random numbers and does not change
the generated world or the controller's random stream.

The published beta.2 core patch carries the compiled core delta from that
commit alongside the existing #429/#432 fixes. The web birth/report
correction belongs to the lab engine, not the mod bundle. Mandos's
headless adapter now forwards the retained state field to its report;
the existing journal already feature-detects that optional report field.

## Verification

- Engine source: build and targeted lint pass; 93 focused tests pass.
- Full engine unit suite: 717 files passed, three skipped; 14,154 tests
  passed, 12 skipped, in 797.81 seconds with two workers.
- Headless archive assertion: fails before forwarding the field, with
  missing seed 73; passes after the correction (one selected test).
  Full Mandos results will be recorded before merge.
- `pnpm typecheck`, `pnpm check`, and `git diff --check` pass.
- Engine pin lists #432, #429 and #433; the trap fingerprint remains
  `34c27241f96aceff581bcb186a9d898f`.

## Remaining limit

A true original seed is necessary evidence, not a replay guarantee.
The browser and harness still have different birth paths and private
controller RNG initialization. Historical seeds already lost cannot be
recovered from the current RNG position. #54 remains open until a matching
desktop death reproduces with matching code, birth and controller policy.
Fatal-state snapshots and new unattended stage-resume work remain parked
under rule 15.
