# B96 ordinary-play negative control

The corrected branch adopts Neo's missing trap/door activation dependencies.
Production-path scenarios reproduce seven wrong physical-action choices
before correction; all 28 scenarios pass after correction. The tests resolve
charged worn equipment through the session, perception and traits, including
fallback and action-order controls.

These two ordinary Human Warrior lives are a negative control, not a
survival-strength claim. With seeds 1,2, cap 600 and target c2d1, both
baseline and correction attain 2/2. Seed1: 42 decisions, turn430, clvl2,
gold134. Seed2: 10 decisions, turn107, clvl4, gold140. No activation occurs;
this early cohort does not exercise the corrected artifact branches.

The paired before record is in ../2026-11-05-b96-activation-before/.
Only measured timing fields may differ; the comparison receipt lists them.
The before source is triage branch7a83902 (runtime equals main9a5a74a);
after source5d177735. The after record's dirty marker includes the untracked
before record, not an additional gameplay-source change. Existing records
remain byte-identical.

Engine: published beta.2 with the recorded #429/#432/#433 package patch.
The installed content package supplies the pack in the isolated worktree.
