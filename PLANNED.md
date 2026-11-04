# Mandos plans

The goal is a Borg that can do the grind: reliably reach a chosen stage,
keep successful characters as loadable saves, and improve through measured
changes. All classes share one core; class-specific strategies live in
packs in this repository.

This page describes the direction. The [strength roadmap](docs/plans/getting-stronger.md)
holds the detailed design; [GitHub issues](https://github.com/diegoami/mandos/issues)
and the latest [checkpoint](https://github.com/diegoami/mandos/issues/36)
hold the active queue and handover. Issue labels own task status.

## Restore and audit the inherited Borg

Compare the TypeScript port with the Angband 4.2.6 C Borg across classes,
strategies and configuration options. Reproduce each finding and identify
whether it is C design, an inherited port defect, a Mandos defect or an
engine gap. Missing names in the [C coverage map](docs/audit/c-coverage.md)
are candidates for investigation, not proof of missing behavior.

Port-defect restorations are offered upstream. Deliberate policy changes
are named CHOICEs and remain marked in Mandos. Defects take priority over
new features; tuning a broken policy would measure the defect instead of
the proposed improvement.

## Raise the target one measured stage at a time

The number is **reach-rate**: the fraction of a fixed seed cohort that
attains both the chosen character level and dungeon depth. Start with a
wide class baseline, then repeat the comparisons at stronger stages.
The c2d1 default is an early calibration point, not a demonstrated limit
on what the Borg can attain.

A successful stage produces a kept save. The
[stage ladder](https://github.com/diegoami/mandos/issues/26) is intended to
resume those characters for the next stage, rather than repeat already
proven ground. The resume protocol and a trustworthy desktop/harness
replay are prerequisites for that unattended workflow.

## Turn failures into evidence

Generate [post-mortem dossiers](docs/postmortem.md) from matching harness
records, verify the replay, diagnose the decision sequence and turn the
finding into a reproduced issue. A changed policy gets a fresh run record;
older records stay unchanged.

Desktop deaths need the same standard of verification. Recording a master
seed and whether a human touched the run is useful provenance, but does
not itself prove exact replay ([#54](https://github.com/diegoami/mandos/issues/54)).
A full diagnostic snapshot at fatal damage is a proposed extension; it is
not part of the current graveyard.

## Improve strategy after the defects are understood

The later phases in the [roadmap](docs/plans/getting-stronger.md) are:

- Measured per-class strategies, each in a pack under `src/class/`.
- Offline parameter search using the formula engine and fixed seed cohorts,
  with separate evaluation seeds.
- Versioned, read-only knowledge derived from recorded runs.

A live character does not learn or mutate its policy. Offline results ship
as frozen parameters or data, preserving deterministic decisions.

## Historical reference

The original port's August 2026 playability investigation is preserved
byte-for-byte in [docs/history/upstream-playability.md](docs/history/upstream-playability.md).
Its completed seam work and old release plan explain the port's history;
Mandos's current roadmap is the one linked above. Provenance is recorded in
[the history index](docs/history/README.md).
