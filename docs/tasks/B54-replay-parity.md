# B54 Reconcile desktop and harness replay inputs

Kind: DEFECT in our measurement/replay path. Follow-up to the merged
original-seed provenance correction, PR #85. Owner redirected work here
before further Rust-catalogue defects; PR #88 and proposal #89 remain held.

## Confirmed mismatches

- `plugin.ts` constructs `createBorg` without a private RNG override, using
  `BORG_LOCAL_SEED = 0x00c0ffee`. The harness instead hashed the world seed.
  Two integration regressions observe the actual Borg factory used by
  `observingLife` and compare 32 initial draws with the shipped startup;
  both fail before and pass after removing the harness-only override.
- Browser `maybeBirth` reseeds its stream to the original master seed,
  then offers the real birth session. Choosing the race generates history;
  an empty name also invokes random-name generation. The post-birth reload
  passes that advanced RNG state into `startGame`. The direct harness boot
  omits those draws. A correct master seed alone does not describe that
  accepted birth's RNG position.

## Current correction

Harness and replay now start the Borg's private stream exactly as the
shipped plugin does. Explicit varied private seeds remain available to
tests through `createBorg`; they must not silently change measured play.
The local restart helper in `src/play.test.ts` follows the same rule.

The new controller-startup regressions pass (2/2), and typecheck passes.
This is a behavior change to the instrument, so old run records remain
immutable and current fixtures/control records must be refreshed. Seed 73
now survives cap 600 rather than providing the former chain-test death.

## Remaining work

The accepted birth input is now retained by engine commit `cc838821a`:
the actual pre-generation RNG position survives save/load and reaches the
end report beside immutable birth options. The save/report regressions
fail before and pass after; build/lint and 98 focused tests pass. The full
engine suite passes 14,159 tests (12 skipped), 717 files (three skipped),
in 404.39 seconds. The correction is published append-only on PR #433;
lab carry `85bea0999` builds successfully.

Mandos's journal, archive, run-record writer and replay pass these optional
inputs through without changing old records. The archive regression
fails before; removing the writer handoff makes its new test fail. The
related 39-test set and typecheck pass. A real one-decision harness smoke
record contains the 32-word birth input and immutable birth options.

Further first-divergence work found that our content loader omitted town
stores, chest traps, the world graph and hints. In particular, missing store
initialization changed the game RNG; the old benchmark was not the desktop
world. A store/world regression fails before and passes after loading the
complete pack. The legacy API1 view also exposed unseen LOS-only grids and
unquantized values which the shipped API2 adapter does not expose. The
harness now uses the same public known-world builder and API2 converters;
its unseen-grid regression fails before and passes after projection.

An independent API2 retry regression shows abandoned passes consuming the
private stream. Snapshot/restore on rewind fixes it without resetting the
stream between submitted decisions. Do not attribute the observed death
to that separate defect: the verified case's command trace is unchanged by
the rewind correction.

An isolated actual desktop Human Mage, original seed 99110530, dies at turn
2450 to a giant yellow centipede. The uninstrumented and observed desktop
reports agree (apart from save-slot identity); a fresh rebuilt-mod run also
agrees. Headless play with the captured birth input now matches all 113
command arguments and every pre-command turn, position, HP, SP and depth,
as well as the complete census, death cause, level and gold. Bulky traces
are retained under `artifacts/b54-desktop-*` pending the compact committed
record and replay fixture.

Commit that matching-code lab death as the current replay fixture, then run the replay
suite alone and the watched full gate. Do not claim that the private RNG
correction alone finishes #54, or that lost historical seeds can be
recovered. No fatal-state snapshot or new strategy is involved.
