# Mandos: verified bug-fix consumer

Owner direction recorded in [181](https://github.com/diegoami/mandos/issues/181),
coordinated with [runtime180](https://github.com/diegoami/mandos/issues/180) and
[workspace22](https://github.com/diegoami/angband-workspace/issues/22).
This supersedes old experimental roadmaps as the current Mandos purpose.

## Active work

1. Read current canonical bug/source state and incoming delivered corrections.
2. Reproduce a specific defect with legal public-API inputs and negative controls.
   Fixed seeds are useful regression fixtures, not a mandate for broad cohorts.
3. Apply the smallest applicable correction with provenance and a removal unit.
   Port/Neo engine/C source repairs stay with their source owners. Translate a
   validated original-C correction into Mandos only after applicability review;
   the faithful port is not a C-correction translation service.
4. Verify the supported package/plugin and affected basic gameplay path. Keep
   targeted regressions and basic run/death/stall/archive evidence. Do not infer
   success from emitted commands or treat counters as measured survival benefit.
5. Carry until actual upstream correction plus verified consumer adoption permits
   the replacement backport to retire. Proposal, scope parking and removal of
   an unneeded carry are not upstream resolution or a fixed bug.

Prefer an unpatched published engine. An engine carry requires evidence that a
real supported Mandos gameplay path needs it, a focused regression and a named
removal condition. Generic engine defects remain source-owned even when no
Mandos carry is necessary. The final180 proof selects the supported beta.3
profile; no unpatched verification is claimed merely by this policy change.
Package/Core verification is distinct from stock-desktop loading/trust/grants,
and neither silently refreshes the existing lab.
PR433/seed-birth recording is not a mandatory default dependency. Preserve its
optional patch and historical profile, without pretending missing metadata exists.

At baseline6c7916a, the seven applied C units are164/165/168/171/172/175/176.
Their code, controls, provenance and removal units remain. This is a preservation
requirement for the current upgrade, not a second live status ledger: their
canonical issues and patch ledger own actual state.

## Parked optional work

Strategy tuning/new policies, large performance or class×seed cohorts,
stage-aware home/build research, save ladders, trainer interaction, feedback
corpora and advanced per-death export/diagnosis/aggregation are parked.
Existing implementations, optional tests, saved branches and public evidence
remain available; none is silently deleted, declared complete or migrated.
In particular,166 and exporter110d682/ca627bf remain unfinished preserved WIP.

Optional replay/dossier/window tools are not required ordinary-play or engine-
upgrade gates. Their named suite is `pnpm test:optional-replay`; it covers the
postmortem replay/dossier/windows and loop/replay modules when intentionally
invoked with matching inputs. `mandos.stageRetirement` is false by default;
retained thresholds do not automatically retire normal characters. A targeted bug may use a bounded trace or diagnostic replay when
it is necessary and inputs exist. Reproducing historical outcomes requires the
original executable, content, configuration and accepted start inputs; seed,
endpoint/census equality or a record's Git hash alone does not prove full
trajectory identity. Missing provenance is unavailable, not justification for
patching the default engine or changing old assertions to manufacture parity.

Basic archive integrity (#20), stopped-life records (#47), and the basic evidence
part of mixed stall issue56 stay active correctness work. Park only56's advanced
replay/dossier expansion. Operational OAuth/backup issue52 stays a distinct owner
follow-up; no private action is authorized by a documentation change.

Future experiments may be pursued in better-borg-c or independent borg-rs only
through their own owner authorization. Do not move Mandos code/tasks, adopt native
save/timing semantics, poll Rust or dispatch a Rust worker automatically.

## Validation and issue state

Default validation checks supported functionality, basic evidence and retained
bug fixes. Explicit optional-tool suites have separate commands/profiles and
cannot make an experimental engine enhancement a default prerequisite. A change
to an optional component still needs honest relevant validation when authorized;
parking is not permission to hide a required gameplay regression or false skip.

[The open-issue audit](tasks/mandos-scope-181.md) is a **proposal** for parent
review. Existing `backlog` is sufficient for parked work; do not create a second
state taxonomy. Preserve source/consumer labels and open bug history. Scope
parking is not `fixed`, `carried`, or resolution. Parent applies approved body,
priority and label changes; this documentation worker changes none of them.
