# Getting stronger - the roadmap

This is the long-term design direction, redirected by the owner on
2026-11-03: **a Borg that helps with the grind**. The implemented foundation
measures reach-rate at a chosen stage and keeps attained characters as
loadable saves. The later stage ladder, offline learning and accumulated
knowledge below describe intended extensions, not capabilities already
established by those saves.

**Current authorization is bug hunting and fixing only** ([CLAUDE.md](../../CLAUDE.md),
rule 15), until the owner changes scope. Hunt, reproduce, attribute and fix
defects, including omitted C behavior. New strategies, parameter learning,
fatal-state snapshots and new unattended stage-resume functionality remain
parked. Finishing the audit does not authorize the next roadmap phase.
The active queue and decisions remain on the
[checkpoint issue](https://github.com/diegoami/mandos/issues/36).

**THE CURRENT PRIORITY (owner pivot, 2026-11-03, #34): audit the borg's
full space** - all classes, strategies and configuration options - finding
as many issues as possible and deriving each one's provenance (C design /
inherited port defect / our defect / engine gap), before improvements.
Nothing may force warrior play; everything warrior-shaped is a setting.
The loop underneath is proven (B32): cover, diagnose, attribute, fix,
measure. **Classes: wide first, then iteratively deeper** (amended earlier
2026-11-03):
BEFORE any warrior specialization, a GENERIC first pass — class-agnostic
improvements (#29's post-mortem diagnoses, Phase 1's ceiling fixes) that lift
every class. Then START WIDE: fixed-class pinning at birth and race sets
stay, but the warrior bias leaves the default (the generic pack births any
class; the neutral default is a per-birth draw from class and race toggle
pools, all on - landed by #16/#17, 2026-11-04). The wide baseline measures
every class at the first milestone (a class × seed reach-rate grid),
providing a common comparison point. With later owner authorization, each
class's strategy would improve in order (a pack under `src/class/`, never a
fork - process §2; measured race shortlists and an order chosen by the
baseline data). Rounds would repeat as targets move up, one stage at a
time. Dungeon depth remains the ladder's axis.

The following phases describe design dependencies. Only defect work within
the current scope is authorized.

## The constraint: determinism (rule 5)

The controller must draw only its own seeded RNG, with no wall clock or
network in decisions. Exact replay additionally requires matching initial
state, code and configuration; desktop-to-harness equivalence remains an
explicit verification requirement in [#54](https://github.com/diegoami/mandos/issues/54).
The design constraints are:

- Parameters are fixed between runs, not changed during a life. A record
  identifies the build, cohort and configuration; a future parameter-search
  record would also need the frozen candidate parameters.
- No mid-life policy shifts, no wall clock, no "current best" changing under
  a live save.
- Any future learning or evolution would run offline against the headless
  harness. Its accepted outputs would ship as frozen defaults or versioned
  read-only data, never as live policy mutation.

In-game self-mutation each death was considered and rejected: one life is one
extremely noisy fitness sample, and a GA over single-life outcomes breeds
luck, not strength. Evolution wants a population measured in parallel - the
harness, not the game window. A future search would need lineage records
with parents, generation, fitness and names; the current run-record format
is not evidence that such an optimizer exists.

## Phase 1 - Correct the policy before tuning

Tuning a broken policy spends compute measuring its defects. The original
ceiling-fix work established the [door-close reproduction](../tasks/B01.md)
and [measurement runner](../tasks/B02.md). Those files retain their original
outcomes; they are not fresh work instructions.

Continue from reproduced defects and the
[reviewed C-function classifications](../audit/c-classification.md), including
the missing C swap behavior tracked in
[#4](https://github.com/diegoami/mandos/issues/4). A name match is not a
fidelity certificate, and an unfilled model field is not automatically an
engine limitation. Measure each restoration on a named cohort.

## Future phase 2 - Parameter evolution (parked)

- Port upstream's formula engine (`borg_uses_dynamic_calcs`, borg-formulas.c):
  the natural genome - upstream's own knob-set for power/depth/restock math.
  Plus the cfg toggles and numeric settings as the rest of the chromosome.
- The runner from B02 becomes the fitness evaluator: fitness = reach-rate at
  the target stage (#25, rule 1), N lives per candidate to beat the noise.
  (Written before #25 as median maxDepth with a town-death penalty; depth
  survives as the ladder's axis, not the fitness.)
- Candidate search methods include random search, CEM and a GA. A later
  authorized experiment would compare their measured cost and results;
  listing them here does not authorize an optimizer implementation.
- Winners land as frozen defaults + a run record; the training cohort is
  retired when the genome ships.

## Future phase 3 - Accumulated knowledge (parked)

A versioned, read-only knowledge base built offline and shipped with the mod:
per-monster observed threat (what actually killed borgs, at what depth),
per-depth pacing priors, item value tables learned from shop outcomes. The
proposed Borg would consult it at birth; within a life it would be
deterministic data, not a live learner. Every entry would cite its runs.
Reference: the squire mod's journal taxonomy (lessons, grudges, lineage,
calibration) at `../neo-angband-mod-squire` (read-only clone; ideas, not
code - its runtime learning model cannot cross into a deterministic borg).

**Engine changes remain separate from the mod**: engine defects are filed
upstream and their accepted-for-carry fixes may be carried in the harness
and lab branch under process section 6. Mandos ships no engine code. A
possible engine seam does not authorize implementing a parked feature.

## Where work lives

Everything lives HERE. Class-agnostic work goes in the core; class-specific
work is a strategy pack under `src/class/` (`docs/process.md` section 2) -
there are no downstream forks to cherry-pick to (neowarrior-borg is
archived). Upstream receives port-defect and engine-gap PRs only, per
section 6.
