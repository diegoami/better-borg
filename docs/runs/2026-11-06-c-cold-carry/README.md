# Mandos CBUG-0004 cold-melee protection carry

Consumer: [Mandos164](https://github.com/diegoami/mandos/issues/164).
Canonical C source: [tracker26](https://github.com/diegoami/neo-angband-tracker/issues/26),
validated local [C proposal267](https://github.com/diegoami/neo-angband-tracker/pull/267)
**d504eb3d272ce96c0de2c00eba757a251b551334**. Discovery credit: borg-rs;
independent native evidence and [readable replay guide](https://github.com/diegoami/neo-angband-tracker/blob/b0b0fa2471a11e91838bcbc3d980f4b04f8c6b01/docs/audit/c-reports/CBUG-0004/README.md)
belong to the source producer. This is Mandos's own TS translation/evidence,
not a faithful-port repair or upstream C submission.

## What is corrected

Mandos2690ae09c4166332fa9f5ff8f032e0fb52327bcc literally preserves C's wrong
`temp.resAcid` read in the COLD melee branch (danger.ts:209–219). Acid protection
therefore lowers the cold estimate, and actual cold protection is ignored.
Runtime commit **14a54fccbd3e287073a1b59d5cadd64d1d202512** changes only that
field to `resCold` plus a FORK/source-provenance comment. Other elements,
thresholds, RNG calls, damage rules and class policy are untouched. The separate
TS removal unit is patches/c-translations/CBUG-0004-cold-melee.patch, reverse-
checked against this source. A validated local proposal is eligible before
upstream acceptance; this topic is not a verified main carry until integrated,
rebuilt and normally checked in the final consumer.

## Actual TS before/after and controls

The fixture constructs a real published-beta.2 native game, seed1000, Human
Rogue, grants native experience to level20 through the session's own experience
hooks and uses its actual rolled/derived **157 maximum HP**. Native takeHit
injures it to70HP identically in every variant. This injury is SETUP, not measured
monster damage. It creates a lit empty31×31 arena, places one actual registered
adjacent monster and gives one recognized registered Phase Door scroll.
Temporary acid/cold protections are native timed effects. Bound identity,
visibility, subtype and awareness are asserted before decisions.

Only the fixture sees those native setup objects. It obtains Core.buildKnownWorld
and passes it through Mandos's actual API2 readWorld/record adapter. Monster
combat records use the existing declared resolver seam for the perceived race;
no fake positive danger, forced selected command or controller hidden-state
read is introduced. Normal notice/perception/primeSession produce the traits,
protection booleans and own-square danger. The full production borgEscape gets
that score; the existing anti-summon age is100 (synthetic internal age, not100
elapsed world turns). Its private RNG starts at1 for each case.

The actual existing level4 threshold band is42/56 at70 current HP; danger58
crosses the relevant gates while26 does not. These are decision scores, **not
HP damage**. If the escape routine requests a scroll, the driver executes that
exact read/handle through the native registered command. Native code moves the
character and consumes the scroll, returning100 action energy. No world-turn
loop or monster attack is scheduled, and every recorded HP remains70.

| Public protection / actual attacker | Before | After |
| --- | --- | --- |
| Acid only / snow troll318 | Danger26; no escape request; keeps scroll; stays99,33 | Danger58; reads1scroll/100energy; moves92,38 |
| Cold only / snow troll318 | Danger58; reads1scroll/100energy; moves92,38 | Danger26; no escape request; keeps scroll; stays99,33 |
| Neither / same troll | Danger58; reads1scroll; moves92,38 | Entire observation record identical |
| Both / same troll | Danger26; no request; keeps scroll | Entire observation record identical |
| Acid only / giant yellow scorpion263 (no cold blow) | Danger36; no request; keeps scroll | Entire observation record identical |
| Cold only / same scorpion | Danger36; no request; keeps scroll | Entire observation record identical |

Before intended-choice assertions: **2 expected failures /4 passes**, six cases
executed, no fixture error. After: all six pass; with the existing danger and
escape-stair controls, **43/43 pass across3files,zero skips**,1.01s. Four entire
JSON observation records are byte-equivalent; comparison.json names them.
Typecheck passes. The test file is identical across both source variants.

This demonstrates a changed estimate/escape/resource decision and actual native
scroll execution, not a full caution loop, autonomous fight, frequency or survival
improvement. The cold-only reverse case saves a scroll but also accepts staying
adjacent; **no claim that this is always safer**. Native C separately measured
21HP→0 for2mana in acid-only and0→20HP while saving2mana in cold-only. Those C
HP/mana numbers are not transplanted into this TS result. The unchanged escape
policy's tradeoff remains visible rather than being tuned away.

## Copyable verification

From this task's published Mandos revision with installed pinned dependencies:

```sh
CI=1 NO_COLOR=1 COLD_CARRY_RECORD=artifacts/cold-after.json pnpm exec vitest run src/danger/cold-melee-carry.test.ts src/danger/danger.test.ts src/fight/escape-stair.test.ts
```

Create the artifacts directory first if absent and use the shared lock on a
multi-session workstation. To reproduce the unfixed variant in a NEW disposable
worktree (never the active primary): create it at2690ae09c4166332fa9f5ff8f032e0fb52327bcc,
copy the exact test file from14a54fccbd3e287073a1b59d5cadd64d1d202512 into the
same source path, install its frozen dependencies, then run that test alone
with the same environment/seed/options. Expect2failed/4passed and the recorded
before JSON. Change only the production cold-field patch, rerun the SAME file,
and inspect the table/actual read command plus four unchanged control records.
The optional COLD_CARRY_RECORD path only records test observations; runtime
controller code reads no filesystem or wall clock.

Pinned source attribution inspection:

```sh
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/danger/danger.ts | sed -n '192,220p'
git diff 2690ae09c4166332fa9f5ff8f032e0fb52327bcc 14a54fccbd3e287073a1b59d5cadd64d1d202512 -- src/danger/danger.ts
git grep -n -E 'temp.resAcid|temp.resCold' 14a54fccbd3e287073a1b59d5cadd64d1d202512 -- src/danger/danger.ts src/trait/buff-timers.ts
```

The diff has one executable identifier change, retaining all surrounding gates.
The searches show separate public-status mappings in buff-timers.ts and the
separate element branches, so the correction's data source is checkable.

## Gate and integration boundary

This isolated topic deliberately does not rebuild the shared plugin or launch
a full suite before the parent combines the independent name-matcher carry.
Parent requested separate attributed commits/proofs and one final integration
branch from latest main (including intervening prose-only changes). Standalone
replay alone, plugin rebuild and the required normal full gate belong to that
final combined consumer; no gate is waived or inferred here. Current package,
lock, beta.2 core/SDK/content and combined engine patch remain unchanged.

Initial exploratory API-name/setup mistakes and the full-health control that
crossed no escape gate are retained under ignored artifacts/c-cold-164, not
presented as bug failures. The frozen final comparison above uses one identical
legal injured state and final fixture. No lab/data/OAuth, native source worktree,
Rust, official C post, Neo port change, new strategy or death-recording work.
