# Mandos198: the headless shadow lamp loses its fuel

Canonical own bug: [Mandos198](https://github.com/diegoami/mandos/issues/198),
found by required [PR197 run42367824095](https://github.com/diegoami/mandos/actions/runs/42367824095)
at b008298f2e0124fbd55bde7f2ffb48486c7e7203. That actual first full run
failed11/passed1297 across79 files (5 failed/74 passed),248.24s. Two failures
are the separately repaired test-helper location; one is three obsolete WK
zero-writer inventory entries after C239; eight are real play/chain/stop guards.
No old assertion, seed, cap or timeout is changed or waived.

## Actual fail-before trace

The underlying engine is unchanged published Core/SDK/content1.23.0-beta.3.
The same normal pack birth is Mage seed3, cap600. The observer records public
known equipment and the actual Borg input, then asks the declared public
simulateLoadout({}) for the unchanged same loadout. The query is observation
only, with no world, response, command or RNG mutation. The default CI regression
uses cap1; cap600 is the explicitly bounded diagnostic command below, not an
extra ordinary-game runtime prerequisite or a survival cohort.

```sh
MANDOS_FUEL_DIAGNOSTIC_CAP=600 \
MANDOS_FUEL_PROOF_OUTPUT=artifacts/fuel.json \
flock /tmp/angband-validation.lock \
  pnpm exec vitest run src/play-fuel.test.ts
```

[before.json](before.json) records direct known Torch fuel5000, converted
ItemView.timeout5000 and player.light/BI_LIGHT2. **The unchanged shadow loadout
reports the same Torch timeout0 while shadow player.light stays2.** Thus the
first direct-world hypothesis was too broad: direct known fuel is correct;
the missing description dependency loses fuel only in hypothetical item views.
The headless adapter supplies resolver/reg but no describe callback for those
views. The equipment chooser compares a real lit item with a supposedly spent
copy, despite no loadout change.

Actual600-decision trace: survives5720 game turns, commands takeoff256,wield255,
walk76, study1,cast3,descend3,ascend2,rest1,pickup1,open1,read1. The511 repeated
equip/remove actions are a concrete stalled-choice mechanism, not improved
survival. The regression fails exactly the public same-lamp timeout equality;
the prepared actual exhausted birth-torch control passes with fuel0/timeout0.
That control is an object-state fixture, not a natural burn-down or another life.

The initial cap600 diagnostic used Vitest's default5s timeout and completed its
observational trace after the timeout; its output is retained but not counted
as a validated before result. The new diagnostic test now uses the same300s
budget as the existing real-life controls; their original timeouts are unchanged.
The corrected before run is1 intended failure/1 passing control,7.23s, with
all direct and shadow assertions retained in before.log.

## Correction boundary

If the matching after trace confirms it, supply the declared
Core.describeObject(state,obj,ODESC.PREFIX|ODESC.FULL) dependency to the one
headless viewDeps shared by known-world and hypothetical loadout conversion.
This does not change engine packages, known information, controller policy or
lighting arithmetic. Remove only the three WK_UNDEAD/DEMON/DRAGON obsolete
constant-zero inventory entries whose real writers are now proved by C239;
the inventory guard itself remains unchanged.

No fake upstream dependency, new engine patch, seed search, gameplay-policy
retune, parked replay/cohort feature, lab/profile/data or Rust work belongs here.
