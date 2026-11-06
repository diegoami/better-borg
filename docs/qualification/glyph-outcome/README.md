# Glyph observation qualification — attribution unresolved

This is evidence-only work from Mandos d36c867. No gameplay fix, port issue,
C correction or consumer carry is established by this branch. The real Neo
observation below is reproduced; original-C versus port-only ownership is
**on hold** while the source lane qualifies the C trap/glyph condition.

## Reproduce

Install the repository's pinned published dependencies, then run a fresh output:

```sh
flock /tmp/angband-validation.lock node tools/qualify-glyph.mjs artifacts/new-glyph-observation
```

Current expected exit is **1**, because the accepted known-glyph observation
contract fails. This is not a failed engine read. Inspect result.json and run.log:
setup/control assertions also produce visible errors rather than a false result.
The final recorded run has one primary knowledge-loss contract, all real engine
outcome/control assertions passed and no setup error. Typecheck passed. No full
suite was requested/run for this evidence-only investigation.

## What was measured

Published Core/SDK/content beta.2, installed carried engine patch named in
[receipt.json](receipt.json), API2 version2.0.0. The public world/content facade
is backed by actual Core.buildKnownWorld and pinned content, then passed through
the production readWorld adapter and perceive code. It is not a whole browser /
Electron deployment or live lab run. Core state is separately labelled fixture
setup/ground truth; hidden trap state is never fed into the Borg view.

A disposable seeded Human Warrior at depth40 stands in a lit prepared room,
with twelve recognized actual Rune scrolls or twelve Light-scroll controls.
The production flow arrival is prepared explicitly. The emitted command is
executed through the actual registered read handler, not treated as success.
The handler returns action energy; it does not advance world time in this probe.
No monster AI, combat, survival or natural-run frequency is measured.

| Case | Real effect | Public remembered traps | Borg after perception | Scroll quantity |
| --- | --- | --- | --- | --- |
| Rune on floor | warded=true, energy100 | glyph of warding, index1 | map.glyph=false, track1 |12→11 |
| Rune on open door | real no-clear-floor refusal, energy100 | empty | map.glyph=false, track1 |12→12 |
| Rune on broken door | real no-clear-floor refusal, energy100 | empty | map.glyph=false, track1 |12→12 |
| Light on floor | ordinary light effect, energy100 | empty | map.glyph=false, track0 |12→11 |

The primary reproducible fact is **the engine's public remembered glyph is lost
before the Borg's grid model**. The adapted harmful-trap boolean being false for
a rune is correct; a glyph is not a disarmable player trap. No glyph-specific
observation reaches the grid. Source consumers of map.glyph include glyph-aware
grid/protection/flow logic, but an autonomous downstream command difference is
not proved here. The subsequent real flow call returnedNULL in all four cases.
Do not claim repeated casts, wasted scrolls, damage or death prevention.

The refused-flow track entry is a separate **contract-level observation**.
Ordinary glyph-flow invocation is Morgoth-specific (think-ladder), and this
fixture prepares the arrival rather than proving normal flow selected a doorway.
Its normal reachability and decision impact remain unqualified. Do not bundle
that observation as an established everyday gameplay bug.

## Source identity and classification hold

Current upstream Neo Borg pin a4437882b4f0674dd0e25878e1b93d0fdac65e47:

- [flow-glyph.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/flow/flow-glyph.ts#L64)
  optimistically adds a coordinate after command construction.
- [perceive.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/perceive.ts#L189)
  updates harmful-trap state, not rune state.
- [api2/world.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/api2/world.ts#L266)
  filters remembered traps into the harmful-trap boolean.

Those three files are byte-identical to Mandos's corresponding source after
stripping only the Mandos99 credit header. The faithful fork inspected is5d18be3.
The message parser differs elsewhere but neither side has a glyph failure handler.
Fresh targeted own/upstream glyph searches found no matching investigation;
upstream29 is the historical stale-notes report, not proof this behavior is fixed.

**Do not infer that C recognizes runes correctly because a glyph assignment
exists.** The port reader found pristine C's ag->glyph assignment inside a
square_isdisarmabletrap condition. That predicate may require TRAP while rune
kinds have GLYPH|VISIBLE|FLOOR. The source/native owner must qualify this before
assigning a faithful-port omission or inherited-C defect. No C execution or
repair was performed here. Parent coordination owns the classification/dispatch.

[Source118](https://github.com/diegoami/neo-angband-tracker/issues/118), source
proposal283 ec172531 and evidence284 f1f531 are **discovery context only**.
Their count-underflow/heap-write failure has no mechanical TS rollback counterpart;
this branch does not reproduce a negative counter or carry that C guard.

## Retained attempts and bounds

[Exploratory observation](exploratory/first-observation.json) and its log are
preserved: the first probe recorded the four outcomes without a primary failure
exit. The final probe adds real control assertions, a draining message cursor,
explicit scope/API metadata and expected exit1 for the lost accepted-rune fact.
It does not change gameplay code or rewrite that exploratory evidence.
Input SHA-256 values are in the final receipt. Larger generated bundles and
source snapshots remain disposable artifacts; no owner save/profile was accessed.
