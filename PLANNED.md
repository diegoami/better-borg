# Mandos plans

The goal is a Borg that can do the grind: reliably reach a chosen stage,
keep successful characters as loadable saves, and improve through measured
changes. All classes share one core; class-specific strategies live in
packs in this repository.

This page describes the direction. The [strength roadmap](docs/plans/getting-stronger.md)
holds the detailed design; [GitHub issues](https://github.com/diegoami/mandos/issues)
and the latest [checkpoint](https://github.com/diegoami/mandos/issues/36)
hold the active queue and handover. Issue labels own task status.

## Current authorized scope

The owner's direction is **bug hunting and fixing only** until the owner
changes scope ([RULES.md](RULES.md), rule 15). Hunt, reproduce, attribute
and fix defects; restoring omitted C Borg behavior is DEFECT work. New
strategies, parameter learning, fatal-state snapshots and new unattended
stage-resume functionality remain parked. The later roadmap sections
describe future direction, not authorization to start features when the
audit ends.

## Restore and audit the inherited Borg

Compare the TypeScript port with the Angband 4.2.6 C Borg across classes,
strategies and configuration options. Reproduce each finding and identify
whether it is C design, an inherited port defect, a Mandos defect or an
engine gap. Missing names in the [C coverage map](docs/audit/c-coverage.md)
are candidates for investigation, not proof of missing behavior. The
[reviewed classifications](docs/audit/c-classification.md) explain the
original candidates' concrete replacements, limits and tracked gaps.

Always distinguish inherited TypeScript port defects from inherited C
bugs. Correct C behavior missing from Neo is a port defect. If Neo faithfully
copies wrong C behavior, correct C in upstream Angband first, then propose
Neo parity; Mandos may carry an earlier marked CHOICE. C correctness must be
checked, not assumed. Leads from our own runs/audits and borg-rs (#86) need
the same independent verification.

The owner authorized confirmed port-defect reports and PRs directly to Neo
Angband (2026-11-05), after attribution, reproduction and duplicate checks.
C submissions still require approval of the specific internal report.
Deliberate policy changes
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
The [#54 desktop case](docs/runs/2026-11-04-b54-desktop-death-replay/README.md)
now reproduces all 113 commands and observed death facts with matching
code, engine/content and accepted-birth RNG/options/controller context.
That is a verified case, not universal replay coverage.

Targeted natural or synthetic scenarios complement survival cohorts. Each
upstream-C proposal must show a meaningful, human-explainable consequence
under normal rules in a legal/reachable state, with initialization, pins,
before/after outcomes and negative controls. Changed flags alone do not
prove a life was saved. Keep evidence and duplicate checks internal until
the owner approves external posting. `upstream-c` identifies the C proposal
route; it does not certify that C is defective. The
[upstream workflow](docs/UPSTREAM.md#carry-status-and-attribution) defines
carry labels, patch/consumer records and regular reviews. `carried` requires
a merge into Mandos `main` and application in all required consumers.

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
