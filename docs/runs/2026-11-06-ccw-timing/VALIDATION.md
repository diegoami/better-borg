# Additive correction and focused verification

The independently preserved runtime correction is a3a72f088d1d17f08758389da6384433b4e95e4f. Its separate removal unit is [CBUG-0061-ccw-timing.patch](../../../patches/c-translations/CBUG-0061-ccw-timing.patch). It changes no reserve, healing amount, caller, class policy or RNG threshold. A previous request uses a nullable number: null means none; a genuine supplied-clock-zero request remains distinguishable. The condition requires timestamp strictly before current clock and no earlier than four decisions ago. Native C instead uses zero as its existence sentinel. This is an explicit TS representation of the source-backed intent, not a copied C storage assumption.

Timestamps mark **requested commands**, as in the original. This change does not add host-acknowledgement tracking or claim that every returned command is consumed. The fixture separately proves consumption by executing the selected real registered quaff command, observing100 energy, potion removal, healing and native confusion cure.

The final readable fixture adds the actual drink-at-zero / clock-one control, asserts level/maxHP and uses the actual adapter AgentView without duplicate fixture perception before the real controller. Its identical bytes were copied into a detached immutable d36c867 baseline before running. No runtime source was changed while either measurement was queued/running. `final-before.log`: five expected failures, thirteen passes, eighteen tests; `final-after.log`:49/49 passes across CCW and existing item tests, zero skips,1.40s. Typecheck passed. Final18 CCW cases are18/18 after correction. No assertion/seed change was used to hide a replay or preexisting test failure.

`final-before.json`, `final-after.json` and `comparison.json` preserve outcomes. Of23 observations, eighteen have identical action/state records when the explicitly recorded RNG snapshot is excluded; five differ exactly at the two recovery boundaries and three never-drunk supplied-clock contracts. Random draw eligibility changes deliberately. Identical action/state controls do not establish RNG neutrality, unchanged full-game traces, a population benefit or improved survival.

Actual recovery outcome at elapsed0 changes refusal→quaff:120→180HP, seven→six potions, confusion10→0. At elapsed4 the converse is explicit: quaff→refusal, leaving120HP/confusion10 while retaining the seventh potion. Elapsed1/3, elapsed5, bypass, one-potion reserve, empty inventory and the real zero→one prior-request control preserve expected choices. Complete controller clock-run records remain unchanged, including rest at1004; confusion's borgHeal unconditional fallback still drinks; no-danger HP-only borgHeal still refuses. These counterexamples remain part of the proof.

## Copyable final comparison

Starting with a clone that contains the final fixture/evidence commit, use a separate baseline worktree and copy only this test file. Link/install the identical lockfile dependencies in both trees, using the pinned published profile, without NEO_ANGBAND_LOCAL_CORE. Then:

```sh
flock /tmp/angband-validation.lock sh -c 'CCW_OUTPUT=/tmp/ccw.json pnpm test src/item/ccw-timing.test.ts'
```

Baseline d36c867 is expected to fail five assertions, with thirteen controls passing. Corrected source a3a72f0 plus the final fixture is expected to pass18/18. To include the existing item controls:

```sh
flock /tmp/angband-validation.lock sh -c 'pnpm test src/item/ccw-timing.test.ts src/item/item.test.ts'
pnpm typecheck
```

Expected49 tests in two files. The wrapper's unsupported legacy destroy action throws if unexpectedly requested, rather than pretending that command succeeds. The registered CCW fixture's public identification and actual native results are asserted. Full controller walking/rest requests are not executed, world time/enemy attacks are not simulated, and the controlled injury/full-health interventions are explicit. No death or ordinary whole-loop improvement is claimed.

Parent coordination has deliberately held plugin rebuilding, standalone replay, full consumer gate and PR creation until the priority glyph port correction/adoption is ready. Those pending checks are not silently treated as passed by these focused results. The independent source commit/removal unit is ready for parent review and possible combined consumer integration. Nothing has been merged, applied to the lab or labelled carried by this worker.
