# Getting stronger - the roadmap

The goal, redirected by the owner on 2026-11-03: **a Borg that helps with the
grind.** It reaches a chosen STAGE reliably — reach-rate over a fixed seed
cohort is the number, replacing median deepest depth — retires each
successful run into a kept, loadable save (#25), climbs a ladder of stages
by resuming from the previous stage's saves instead of re-grinding proven
ground (#26), and learns without a human in the loop: every death produces a
post-mortem dossier ladder that a session with code access diagnoses (#29);
the human may still demonstrate (#27) but is never the bottleneck.

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
class; a neutral default — a per-birth class draw mirroring `raceRandom` is
the candidate shape, design in #17). The WIDE BASELINE: every class measured
at the stage-1 milestone (a class × seed reach-rate grid) — the floor every
class must reach. THEN each class's strategy improves IN ORDER (a strategy
pack per class under `src/class/`, never a fork - process §2; race shortlists
per class the T07 way; the order chosen by the baseline data), and the
rounds repeat as the targets move up — stage-major, one concentration at a
time. Reaching deeper survives as the ladder's axis.

Three phases in dependency order, and one standing constraint that shapes
all of them.

## The constraint: determinism (rule 5)

The Borg draws only its own seeded RNG; games stay replayable. Therefore:

- Parameters are chosen BETWEEN runs and frozen during a life; every run
  record stores the parameters it played with.
- No mid-life policy shifts, no wall clock, no "current best" changing under
  a live save.
- Learning and evolution happen OFFLINE, in `tools/`, against the headless
  harness; winners ship as frozen defaults or versioned read-only data.

In-game self-mutation each death was considered and rejected: one life is one
extremely noisy fitness sample, and a GA over single-life outcomes breeds
luck, not strength. Evolution wants a population measured in parallel - the
harness, not the game window. "Children" are real as LINEAGE in the run
records: parents, generation, fitness, a name.

## Phase 1 - Raise the ceiling (B01-B03)

Tuning parameters against a broken policy spends compute measuring the bug.

- **B01: the door-closing defect.** Seed 1: 771 of 1500 decisions are `close`
  (cap 750) - half a session on doors is depth not gained. A port defect
  (reproduced bit-for-bit on pristine upstream): fix it marked, offer it
  upstream.
- **B02: the bake-off runner.** The sweep harness (fixed seed cohort, N lives
  per candidate, per-run records) - first as the measurement instrument, later
  as the fitness evaluator. Held-out seeds the optimizer never sees.
- **B03: the swap subsystem.** Ring swaps and weapon/armour swap buying - the
  biggest unported muscle (upstream 4.2.6 has it; the port's seams are
  deliberately unwired). Likely one shared valuation seam.

## Phase 2 - Parameter evolution (B04+)

- Port upstream's formula engine (`borg_uses_dynamic_calcs`, borg-formulas.c):
  the natural genome - upstream's own knob-set for power/depth/restock math.
  Plus the cfg toggles and numeric settings as the rest of the chromosome.
- The runner from B02 becomes the fitness evaluator: fitness = reach-rate at
  the target stage (#25, rule 1), N lives per candidate to beat the noise.
  (Written before #25 as median maxDepth with a town-death penalty; depth
  survives as the ladder's axis, not the fitness.)
- Search: random search / CEM before a GA - with tens of dimensions CEM often
  matches a GA at a fraction of the code. Add the GA (and lineage naming)
  only if it pays.
- Winners land as frozen defaults + a run record; the training cohort is
  retired when the genome ships.

## Phase 3 - Accumulated knowledge

A versioned, read-only knowledge base built offline and shipped with the mod:
per-monster observed threat (what actually killed borgs, at what depth),
per-depth pacing priors, item value tables learned from shop outcomes. The
Borg consults it at birth; within a life it is deterministic data, not a live
learner. Every entry cites the runs that produced it.
Reference: the squire mod's journal taxonomy (lessons, grudges, lineage,
calibration) at `../neo-angband-mod-squire` (read-only clone; ideas, not
code - its runtime learning model cannot cross into a deterministic borg).

**Engine changes are not fork policy**: engine needs are filed upstream
(neo-angband); the local game checkout's lab branch may carry diagnostic
patches, but the mod never ships one.

## Where work lives

Everything lives HERE. Class-agnostic work goes in the core; class-specific
work is a strategy pack under `src/class/` (`docs/process.md` section 2) -
there are no downstream forks to cherry-pick to (neowarrior-borg is
archived). Upstream receives port-defect and engine-gap PRs only, per
section 6.
