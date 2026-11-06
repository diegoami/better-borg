# Mandos bounded ready-C batch: Enlightenment and caster-origin paths

Consumers [Mandos171](https://github.com/diegoami/mandos/issues/171) and
[Mandos172](https://github.com/diegoami/mandos/issues/172) own independent TS
adoption. Native C evidence/source issue state stays with the source producer.
Validated clean local C proposals are eligible before official acceptance;
a stored patch/topic alone is not a carried main correction.

## Exact sources and dispositions

| Canonical source / reviewed correction | Actual Mandos applicability at e8be90ec | Independent TS unit |
| --- | --- | --- |
| [diegoami/neo-angband-tracker#81](https://github.com/diegoami/neo-angband-tracker/issues/81), [proposal275](https://github.com/diegoami/neo-angband-tracker/pull/275), 526906c0f367cd690bdd92b99ac1e114fd84b1a2 (CBUG-0065, discovery borg-rs) | Missing recognized dungeon Enlightenment quaff call | b5f4e79f7193e05a2bceeea4587f7c28f85e417a; patches/c-translations/CBUG-0065-enlightenment.patch |
| [diegoami/neo-angband-tracker#64](https://github.com/diegoami/neo-angband-tracker/issues/64), [proposal277](https://github.com/diegoami/neo-angband-tracker/pull/277), b223c4f18622883549682f9f997b76fe1f06fc73 (CBUG-0048, discovery borg-rs) | Already correct: TS resets bolt inside each spell iteration | No invented patch/carry; actual mixed-spell control below |
| [diegoami/neo-angband-tracker#279](https://github.com/diegoami/neo-angband-tracker/issues/279), [proposal281](https://github.com/diegoami/neo-angband-tracker/pull/281), 1bce07d8080b520589c292c793cc0b95ef9df182 (independent native finding) | Stops at the caster's own dist0 occupancy | e8c125b1038e20df3ea3218b5c838e93adef71e6; patches/c-translations/shot-path-279-caster-origin.patch |

The new source279 finding was independently discovered while the native
producer investigated CBUG-0048; it is not assigned a borrowed historical CBUG
ID or Rust discovery claim. Original native effects/tradeoffs remain on those
canonical reports. No C, faithful Neo port or BetterC implementation is edited.

Base consumer: **e8be90ec7e67f1467ee8c81e13b51deb82ef96bf**, published core/SDK/
content beta.2 plus its unchanged named combined engine patch. Source b5f4e79
adds only the missing quaff call/provenance; e8c125b adds only dist&& to the
monster occupancy check/provenance. Neither changes thresholds, RNG calls,
class policy or the rest of the potion/projection decisions.

## Enlightenment: actual beta.2 public map benefit

The fixture creates a real Human Warrior game, seed275, empty lit room and
stairs behind an opaque wall. The actual registered potion is prepared/known
through native APIs and reaches Mandos through Core.buildKnownWorld and the
actual API2 readWorld/record adapter. Unknown flavors retain their real opaque
flavor key/negative subtype; no hidden identity is put into the controller.
The utility routine chooses, and its exact quaff command executes through the
native registered handler. The observer then reads actual public map memory.

Same six-case file on immutable e8be90ec before and source b5f4e79 after:

| Situation | Before | After |
| --- | --- | --- |
| Recognized Enlightenment, dungeon28 | No command,2potions,hidden stairs unknown | Quaff/100energy,1potion,actual hidden stairs known |
| Recognized Enlightenment, town | No command,2potions,stairs unknown | Entire record identical |
| Unrecognized potion flavor | Opaque flavor identity,no command,stairs unknown | Entire record identical |
| Unrelated True Seeing | No command,stairs unknown | Entire record identical |
| Augmentation in dungeon | Quaff/100energy,1potion,stairs unknown | Entire record identical |
| Augmentation in town | Quaff/100energy,1potion,stairs unknown | Entire record identical |

Before **1 expected failure/5 passes**. After with existing item controls
**37/37 tests across2files,zero skips**,1.02s. Five full JSON observation records
compare identical. Native item/effect/knowledge assertions pass, so the mapping
benefit is not merely a queued action or a borrowed C result. This consumes one
potion for map information; no travel-time, combat, resource-efficiency or
survival improvement, nor a judgment of whether every level is worth mapping.
The direct handler returns action energy; no world-turn loop is advanced.

## Caster origin: real zero-threat error, honest unchanged damage outcome

The fixture uses an actual beta.2 Human Rogue game, seed1000, native experience
to20/derived157MHP, identically injured to70HP through native takeHit. It builds
a lit31x31 arena with a wall/pass-through, places actual registered visible
hill giant284 six squares away and supplies one recognized Phase Door scroll.
Real creatures/terrain reach the known-world adapter and normal perception;
only the declared race-record resolver seam supplies their combat records.
The Core projectile path and Borg's remembered-map path are measured separately.

The exact same final eight-case file is used on **b5f4e79** before and **e8c125b**
after, isolating the origin guard (the existing Enlightenment correction is
irrelevant to these callers). Before **1 expected failure/7 controls**. After
with existing danger controls **29/29 across2files,zero skips**,1.19s.

| Situation | Before | After |
| --- | --- | --- |
| Clear hill-giant caster origin | Native shot true,Borg false;spell/totaldanger0;flee/leave false | Native/Borg true;spell/totaldanger48;flee/leave true |
| Real intervening yellow mold | Native/Borg shot false,zero player damage | Entire record identical |
| New wall, previously seen remembered caster | Native/Borg false,danger0 | Entire record identical |
| Unknown remembered-cell contract negative | Borg false despite real terrain being clear | Entire record identical |
| Player origin/monster endpoint | Native/Borg true | Entire record identical |
| Range5 for target distance6 | Native/Borg false | Entire record identical |
| Empty origin/player endpoint | Native/Borg true | Entire record identical |
| Mixed storm giant442 spells behind real mold | Bolt path false butarea/spellscore315,totaldanger1260;real PhaseDoorread | Entire record identical |

The caster-origin correction changes threat recognition and actual flee/leave
intent. **The immediate escape command stays NULL in this70HP setup.** No
threshold or landing policy is tuned to force a rescue. One scheduled real
Boulder executor uses the actual caster's own spell, full native wired effect
context and unchanged native RNG stream. It hits for **17HP in BOTH versions,
70→53**. With a real intervening mold the same native executor leaves the player
at70HP in both. Cast processing is asserted; a hit/blocked player damage is
asserted respectively. No hit, damage, spell power or RNG result is substituted.

That demonstrates a false zero assessment of an actual damaging shot, not a
net combat rescue. Native C separately observed unfavorable18→29HP/+2mana and
favorable storm escape cases; those are not TS outcomes. Here the normal monster
AI choice/frequency/failure, complete fight/world timing and extra player actions
are not executed. The fixture schedules exactly one valid Boulder in the two
explicit hill-giant cases. The mixed-spell case executes only its selected player
scroll; no storm attack is scheduled. Its teleport/shot/terrain fields are
observations, not guaranteed safety or damage prevention.

The unknown-cell case deliberately replaces one Borg remembered feature with
NONE as a conservative geometry contract negative. It is not presented as an
actual newly observed engine snapshot or the primary public gameplay proof.
The wall case first perceives the caster legally, then closes the passage in
the actual native game and refreshes known perception; the cached monster is
remembered, not fed a hidden new position. Seven whole JSON control records
remain identical before/after.

## Why the third C proposal needs no translation

At e8be90ec, danger.ts:487–490 already declares **let bolt=false inside the
per-spell loop**. The actual registered storm giant/mold control has a blocked
boulder yet retains positive area/spell score315 and total1260, requesting and
executing a real Phase Door scroll before AND after the independent helper fix.
That semantic control and the scoped initialization/caller inspection establish
that source64/proposal277's shared-state defect is absent in this TS code.
No duplicate C report, consumer fix or carried label is invented for it.

## Reproduce and inspect

Use the pinned published dependencies, then run from the corresponding source
revision in a disposable worktree, never by resetting the live primary:

```sh
CI=1 NO_COLOR=1 ENLIGHTENMENT_OUTPUT=artifacts/enlight.json pnpm exec vitest run src/item/enlightenment-carry.test.ts
CI=1 NO_COLOR=1 SHOT_ORIGIN_OUTPUT=artifacts/shot.json pnpm exec vitest run src/danger/shot-origin-carry.test.ts
```

Create artifacts/ first, use the shared heavy lock on a multi-session host.
For the before side, copy the EXACT final test file into the named immutable
before revision: e8be90ec for Enlightenment, b5f4e79 for origin. Frozen final test
bytes/hashes and all raw observations/exits are in this directory. Expect the
single intended regression failure with all fixture assertions/controls intact.
Apply only the corresponding independent TS patch and repeat identical tests.
Consumer171/172 openings contain copyable full before/after command sequences.

```sh
git show e8be90ec7e67f1467ee8c81e13b51deb82ef96bf:src/item/item-use.ts | sed -n '563,583p'
git show e8be90ec7e67f1467ee8c81e13b51deb82ef96bf:src/danger/geometry.ts | sed -n '434,466p'
git show e8be90ec7e67f1467ee8c81e13b51deb82ef96bf:src/danger/danger.ts | sed -n '485,496p;1229,1250p'
```

These pinpoint the missing potion call, the origin occupancy check and the
already-per-iteration spell classification. No source-state closure follows
from any Mandos translation.

## Evidence boundary and final gate

An early exploratory test incorrectly expected an unknown potion's real kind
identity; actual API masking was preserved and the assertion corrected before
freezing. One queued comparison had not started before the task branch changed;
that run is retained as invalidated exploratory evidence and is NOT used as the
before result. The genuine comparison uses a separate immutable e8be90ec tree.
All final before/after source/fixture boundaries are fixed and explicit.

This receipt initially supplies focused proof, not a rebuilt plugin or full
consumer carry. Parent will review the independent units, then one combined own
plugin/replay-alone/full gate verifies the final head. No duplicated local full
after appropriate required hosted success. Core/SDK/content beta.2, lock and
engine patch remain unchanged; no lab/private/profile/OAuth/source-workbench,
Rust/official C/publishing, C77 retune, live-death166 files or new strategy work.
