# Mandos CCW timing investigation

Consumer [Mandos168](https://github.com/diegoami/mandos/issues/168) investigates the remaining boundaries of [canonical CBUG-0061/source77](https://github.com/diegoami/neo-angband-tracker/issues/77). The C proposal is [271 at cedf25eb790f2ff7c7c161cd1612b18ed99fb35e](https://github.com/diegoami/neo-angband-tracker/pull/271); native evidence is [272](https://github.com/diegoami/neo-angband-tracker/pull/272). Discovery credit belongs to borg-rs; Mandos independently checks its TS derivative. No native result below is claimed as a TS result.

The native long-delay defect is absent in baseline d36c867f795ce5ff41b608229f3735d6b8aaf963. Mandos already hesitates after recent drinks, but tests elapsed 0 through 3 and treats initial timestamp zero as a previous drink. The source correction specifies a real previous drink and elapsed 1 through 4. This is alignment of the existing conservation boundary, not a new healing strategy.

## Before observations

Fixture commit d5648aed4852cd7ed953b972e8722b092cc8bfdb contains production runtime unchanged. `before.log` reports five expected-intent failures and twelve passing controls; `before.json` contains actual transactions. `typecheck.log` passes. Commands, from that isolated checkout:

```sh
flock /tmp/angband-validation.lock sh -c 'CCW_OUTPUT=/tmp/ccw-before.json pnpm test src/item/ccw-timing.test.ts > /tmp/ccw-before.log 2>&1'
pnpm typecheck
```

Actual published Core, SDK and content are 1.23.0-beta.2, with the existing named Core patch. A native Human Warrior is advanced to level20, initialized healthy at actual maximum252HP, then native takeHit injures it to120HP. The actual registered/aware Cure Critical Wounds kind is prepared through objectPrep and its public kind/subtype/awareness are asserted after buildKnownWorld and the production API2 adapter. Eight actual potions start the fixture. A successful bypass request and native registered quaff at clock1000 consumes one potion and establishes the private helper's timestamp normally. No WeakMap or timestamp is injected. The test then applies the same injury and actual confusion10 before calling production borgRecover. Its deterministic Borg RNG starts at seed1 and is never reseeded or mocked.

At elapsed0, baseline refuses:120HP, seven potions, confusion10 remain. At elapsed4, baseline drinks:180HP, six potions and confusion0. Elapsed1/3 refuse; elapsed5 drinks. Aligning to the source intended window would allow the same-clock request and conserve at four decisions. The fourth-decision conservation is explicitly unfavorable to current health/condition: it keeps one potion while leaving the actor injured and confused. This does not establish improved survival.

Never-drunk clocks0/1/3 refuse before correction; clocks4/5/1000 drink. Clocks0..5 are supplied-clock helper-contract cases. They are not ordinary startup, since the real controller initializes each level at1000. The test separately exercises the complete unmocked createBorg controller at1000..1005, with its real initial quaff at1000. Intervening full-health resets and repeated views are controlled fixture interventions; walking/rest commands are observed but not executed. At1004 this particular whole ladder rests. The measured recovery-call transaction is not claimed as a changed whole-game choice.

Bypass drinks, one-potion reserve and empty inventory do not drink. A production borgHeal confusion path still drinks through its unconditional fallback. A no-danger, HP-only borgHeal exits without drinking. These are counterevidence to claiming that the helper boundary controls every healing decision. The RNG condition remains randint1(100)<75 (74 possible integer outcomes). Changing predicate eligibility changes which draws occur and can change later decisions even where no potion is available; no broad no-regression or survival claim is made.

No intervening world turns, enemy attacks, deaths, full encounter, lab character or profile is simulated. Clock progression between recovery requests isolates the decision-time boundary, as the native evidence does. Ordinary controller progression is a separate reachability observation.

## Exploratory attempts retained

The initial six-test prototype observed native level-up does not replenish currentHP: the character had19HP rather than the intended120. `initial.json`/`.log` are retained but superseded. The second prototype fixes that initialization and finds no-danger borgHeal deliberately exits before its HP ladder: all boundary requests remain null without a timing draw (`second.json`/`.log`). Those are genuine counterevidence to the attempted caller selection, not evidence of a fix.

The third prototype tried the real recovery caller but incorrectly passed a timed-effect index where the declared API requires a TimedEffect record. Its five fixture TypeErrors and controller observation are retained (`third.*`), not counted as regressions. The fourth prototype corrects that API and records the actual production recovery boundary outcomes (`fourth.*`); the final frozen fixture adds assertions and all controls (`before.*`). Earlier type mismatches at the legacy AgentView/actions wrapper were corrected to retain the actual adapter view and an explicitly unsupported destroy action; final typecheck passes. Logs replace task-tree and installed-dependency filesystem prefixes with placeholders; their outcomes are preserved.

No runtime correction, carry, full gate or merge is claimed by this before-only receipt. Any later correction and validation must be recorded additively.
