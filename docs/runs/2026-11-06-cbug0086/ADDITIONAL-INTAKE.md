# Additional ready-C intake dispositions — 2026-11-06

Report-only follow-up to the name carry. These are pinned source inspections,
not new TS runtime experiments, corrections or carry claims. Native source
issues remain canonical and producer-owned. Inspected TS revision:
`2690ae09c4166332fa9f5ff8f032e0fb52327bcc`.

## Both-hand ring activation: already correct in TS

Canonical [source78/CBUG-0062](https://github.com/diegoami/neo-angband-tracker/issues/78),
C [proposal269 at46c14b2828ed751ff8be7ac67df93b28cdc15f87](https://github.com/diegoami/neo-angband-tracker/pull/269).
The C correction extends two loops from right-only to both ring slots. Mandos
already uses one equipment generator for both equivalent helpers:

```sh
git grep -n -E 'function\* equipment|function borgEquipsRing|function borgActivateRing|for \(const item of equipment' 2690ae09c4166332fa9f5ff8f032e0fb52327bcc -- src/item/item-use.ts
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/item/item-use.ts | sed -n '369,410p'
```

The scoped exhaustive search finds the equipment generator at369 and ring
helper definitions at376/394; both use that generator. It scans every supplied
nonempty equipment slot, not a right-only bound. Both helpers require an aware,
identified ring of the requested subtype and skip a recharging candidate.
The readiness helper also retains its device-failure check. A recharging first
ring does not stop the loop from finding a ready later ring. Standard equipment
ordering retains the existing right-before-left preference. No new ring/game
experiment, damage/kill claim or local carry is inferred from this inspection.
A future change to either helper/host ordering is the re-evaluation trigger.

## CCW timing: partial applicability, investigation168

Canonical [source77/CBUG-0061](https://github.com/diegoami/neo-angband-tracker/issues/77),
C [proposal271 atcedf25eb790f2ff7c7c161cd1612b18ed99fb35e](https://github.com/diegoami/neo-angband-tracker/pull/271).
Distinct Mandos [investigation168](https://github.com/diegoami/mandos/issues/168)
owns TS reachability/evidence before any policy change.

```sh
git grep -n -w whenLastQuaff 2690ae09c4166332fa9f5ff8f032e0fb52327bcc -- src/item/item-use.ts
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/item/item-use.ts | sed -n '55,103p'
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/controller.ts | sed -n '143,178p'
```

The file has one per-world declaration/init0, two writes after requested potion
commands and two timing reads. TS already tests a RECENT window:
`whenLastQuaff > borgT-4 && whenLastQuaff <= borgT`. Therefore the native C
long-gap and first-ever-clock100 defects must not be described as TS failures.
For a real previous request this TS predicate covers elapsed0..3. Corrected C
requires a previous drink and elapsed1..4. These are concrete remaining source
boundaries, not evidence that a TS adventurer died or wasted a potion.

The missing existence check can affect an isolated direct helper at initial
clock0..3, but normal controller entry increments the clock then initializes
level entry to1000 before the helpers run. Thus a direct unit startup failure
would not establish ordinary controller startup harm. Real caller/clock-reset
reachability and actual resource/state consequences remain to be proved.

Investigation168 explicitly requests never-drunk and previous-drink clocks
0/1/3/4/5, normal controller1000, bypass/reserve/empty controls and unchanged RNG.
It must preserve the current reserve and random threshold rather than silently
retuning them. Native recent-drink conservation can keep a potion but leave
injury/confusion on that call; that inverse tradeoff belongs in any later TS
assessment. No uniform safety improvement or C-derived HP amount is assumed.

These report-only dispositions do not block the already-reviewed cold164 and
name165 integration. No new implementation/PR or full gate is started here.
