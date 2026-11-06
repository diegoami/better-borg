# Glyph observation qualification — C predicate identified

This is evidence-only work from Mandos d36c867. No gameplay fix, port issue,
C correction or consumer carry is established by this branch. The real Neo
observation is reproduced. Read-only comparison identifies the same exclusion
predicate in both original C baselines, so this is **C-origin source work**,
not a faithful-port-only repair. Native C game validation remains pending on
source checkpoint #207; this branch executed only Neo fixtures.
Canonical source report: [neo-angband-tracker #295](https://github.com/diegoami/neo-angband-tracker/issues/295).
The [source-lane validation request](https://github.com/diegoami/neo-angband-tracker/issues/207#issuecomment-6690173994)
records the handoff; no faithful-port repair is authorized by this evidence.

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
[receipt.json](receipt.json), API2 version 2.0.0. The public world/content facade
is backed by actual Core.buildKnownWorld and pinned content, then passed through
the production readWorld adapter and perceive code. It is not a whole browser /
Electron deployment or live lab run. Core state is separately labelled fixture
setup/ground truth; hidden trap state is never fed into the Borg view.

A disposable seeded Human Warrior at depth 40 stands in a lit prepared room,
with twelve recognized actual Rune scrolls or twelve Light-scroll controls.
The production flow arrival is prepared explicitly. The emitted command is
executed through the actual registered read handler, not treated as success.
The handler returns action energy; it does not advance world time in this probe.
No monster AI, combat, survival or natural-run frequency is measured.

| Case | Real effect | Public remembered traps | Borg after perception | Scroll quantity |
| --- | --- | --- | --- | --- |
| Rune on floor | warded=true, energy 100 | glyph of warding, index1 | map.glyph=false, track 1 |12 → 11 |
| Rune on open door | real no-clear-floor refusal, energy 100 | empty | map.glyph=false, track 1 |12 → 12 |
| Rune on broken door | real no-clear-floor refusal, energy 100 | empty | map.glyph=false, track 1 |12 → 12 |
| Light on floor | ordinary light effect, energy 100 | empty | map.glyph=false, track 0 |12 → 11 |

The primary reproducible fact is **the engine's public remembered glyph is lost
before the Borg's grid model**. The adapted harmful-trap boolean being false for
a rune is correct; a glyph is not a disarmable player trap. No glyph-specific
observation reaches the grid. Source consumers of map.glyph include glyph-aware
grid/protection/flow logic, but an autonomous downstream command difference is
not proved here. The subsequent real flow call returned NULL in all four cases.
Do not claim repeated casts, wasted scrolls, damage or death prevention.

The refused-flow track entry is a separate **contract-level observation**.
Ordinary glyph-flow invocation is Morgoth-specific (think-ladder), and this
fixture prepares the arrival rather than proving normal flow selected a doorway.
Its normal reachability and decision impact remain unqualified. Do not bundle
that observation as an established everyday gameplay bug.

## Source identity and C-origin classification

Current upstream Neo Borg pin a4437882b4f0674dd0e25878e1b93d0fdac65e47:

- [flow-glyph.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/flow/flow-glyph.ts#L64)
  optimistically adds a coordinate after command construction.
- [perceive.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/perceive.ts#L189)
  updates harmful-trap state, not rune state.
- [api2/world.ts](https://github.com/neostryder/neo-angband-mod-borg/blob/a4437882b4f0674dd0e25878e1b93d0fdac65e47/src/api2/world.ts#L266)
  filters remembered traps into the harmful-trap boolean.

Those three files are byte-identical to Mandos's corresponding source after
stripping only the Mandos99 credit header. The faithful fork inspected is 5d18be3.
The message parser differs elsewhere but neither side has a glyph failure handler.
Fresh targeted own/upstream glyph searches found no matching investigation;
upstream29 is the historical stale-notes report, not proof this behavior is fixed.

Source inspection found the Rune excluded from the C writer too:

- Current [e473720 borg-update.c guard](https://github.com/diegoami/neo-angband-tracker/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-update.c#L330)
  encloses the glyph assignment at line 338. Imported [4.2.6 f308221 guard](https://github.com/diegoami/neo-angband-tracker/blob/f3082213b73f3e463e3d0d60bff4b00462beae6e/src/borg/borg-update.c#L324)
  encloses its assignment at line 332.
- [square_isplayertrap requires TRAP](https://github.com/diegoami/neo-angband-tracker/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/cave-square.c#L798);
  [square_isdisarmabletrap requires that and visibility](https://github.com/diegoami/neo-angband-tracker/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/cave-square.c#L831).
- The [Rune kind flags](https://github.com/diegoami/neo-angband-tracker/blob/f3082213b73f3e463e3d0d60bff4b00462beae6e/lib/gamedata/trap.txt#L61)
  are GLYPH|VISIBLE|FLOOR, without TRAP. The [placer copies kind flags](https://github.com/diegoami/neo-angband-tracker/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/trap.c#L386)
  without adding TRAP.

The port reader checked both pins and reported the same condition. An assignment
existing in C does not prove it executes for a Rune. The correct owner is the
engine/C tracker; request a bounded native observed-map validation before a C
proposal and any Mandos translation. Evidence level is **source-checked plus an
actual Neo downstream outcome**, not c-game-reproduced. No native C execution,
source repair or faithful-port issue was performed here. The provisional earlier
port-only classification was withdrawn before any issue was filed.

[Source #118](https://github.com/diegoami/neo-angband-tracker/issues/118), source
proposal #283 ec172531 and evidence #284 f1f531 are **discovery context only**.
Their count-underflow/heap-write failure has no mechanical TS rollback counterpart;
this branch does not reproduce a negative counter or carry that C guard.

## Retained attempts and bounds

[Exploratory observation](exploratory/first-observation.json) and its log are
preserved: the first probe recorded the four outcomes without a primary failure
exit. The final probe adds real control assertions, a draining message cursor,
explicit scope/API metadata and expected exit 1 for the lost accepted-rune fact.
It does not change gameplay code or rewrite that exploratory evidence.
Input SHA-256 values are in the final receipt. Larger generated bundles and
source snapshots remain disposable artifacts; no owner save/profile was accessed.
