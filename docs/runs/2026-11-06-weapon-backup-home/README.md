# Mandos weapon-backup value / HOME leaf

Consumer: [Mandos125](https://github.com/diegoami/mandos/issues/125).
Producer: [port source2](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/2),
[upstream modPR72](https://github.com/neostryder/neo-angband-mod-borg/pull/72),
source **a2d73659140be6913c4abed6aaa80ae48b96da10**; owned portPR37 separately
verifies its beta.1 and exact-engine profiles. This consumer must pass its own
beta.2 gate. No producer readiness is inferred from preparing these files.

## Problem and scope

The Borg could leave a useful resistance weapon at HOME because production
weapon-backup evaluation was absent. Carrying that weapon added no separate
backup value. This adopts the existing C-derived weapon selection/value and
HOME strict-improvement/retrieval leaf, not armour or tactical swapping.

Base Mandos **507edace3377c5f6e67c86e71ed1f0379c1baa42**. Runtime import
**cd4ba5aa2da997e62047da52e396f052fc2fd187** preserves source authorship and names
the exact producer commit. Mandos's config import layout and existing
buffTimerSafetyNetEnabled wiring are retained. Its own plugin is rebuilt;
producer plugin bytes are not copied.

Published core/SDK/content **1.23.0-beta.2**, package/lock/workspace config and
combined patch stay unchanged. Core trap MD5 remains
34c27241f96aceff581bcb186a9d898f; combined patch SHA256 remains
32af5c48c56b71889dfa70551c053a17430ad174da59634f96b1170fb1ea8513.
New plugin SHA256: c028dd70f3e51c5ded157442d1016a6c1e2432ebb9ba75508e87cca07d9f24a3
(737.5KiB, API >=2.0.0 <3.0.0). No lab bundle/profile is deployed.

## Verification and actual results

The two before cases are copied unchanged from the clean producer into the
base consumer, using its actual installed beta.2 dependencies. The synthetic
public view represents a level40 Warrior, maxdepth60, main Glaive of Pain and
registered known Bastard Sword of Éowyn at HOME. Production item analysis,
notice, power, store dependencies and command generation run; no positive
backup evaluator or hidden engine read is injected. The controller does not
wear the backup as part of this leaf.

```sh
CI=1 NO_COLOR=1 pnpm exec vitest run src/store/weapon-backup.test.ts -t 'retrieves the registered known Nether backup|includes the carried backup value'
```

Before on507edace: **2 expected failures**, 15 other cases filtered out (not
verified). The HOME routine returns false and the carried-backup power delta
is exactly0. This is a bounded decision/value proxy, not an observed death or
proof of a survival improvement. Before log retains the original failures.

After the import, run:

```sh
CI=1 NO_COLOR=1 pnpm exec vitest run src/store/weapon-backup.test.ts src/store/weapon-backup-capacity.test.ts src/trait/weapon-swap.test.ts src/think-session.test.ts src/trait/trait.test.ts
CI=1 NO_COLOR=1 pnpm exec vitest run src/postmortem/replay.test.ts
pnpm build
```

Actual focused result: **96/96 passed,5files,zero skips** (0.739s), including
28new cases. The same positive HOME routine selects a shop-buy command,
carried backup power gains more than100000, selected handle is published during
notice and main equipment stays unchanged. No ordinary loadout query is needed.
The replay suite was run **alone**, **5/5 passed,zero skips** (8.68s).
Typecheck and own plugin rebuild passed.

Controls preserve disabled swaps/depth49/depth90, no-awareness, absent HOME,
wrong item type, cursed/unknown-removability, weaker/equal-value candidates,
no free slot and repeated full-pack refusal. Unit controls preserve the C -1
sentinel, ordered digger exception, known Tarrasque input, slay/resistance rules,
no invented fear reward and quiver exclusion. Explicit public curse/option
profiles are shared between notice and HOME candidate evaluation.

The capacity case constructs a disposable real beta.2 engine/HOME: full pack
shop-buy returns no-room, consumes zero energy and changes neither pack nor
stock; with an actual free slot, the same registered transaction succeeds.
This documents why the API2 consumer conservatively refuses an impossible
replacement instead of adding a new drop tactic. Test fixture setup reads native
objects; the gameplay controller receives only the declared public view.

The old empty-world scalar expectation changes330000→329999 because the C
no-useful-weapon-backup sentinel -1 is now part of power, not to weaken a test.
No assertion, seed, cap or timeout is weakened. Existing baseline1162 plus28
new cases should produce1190. Required full consumer gate remains pending at
this receipt's first publication and must be recorded on the adoption issue/PR
before merge. Shared lock was used for all live-focused/replay/build checks.

## Remaining work and ownership

Mandos125 stays partial/open for armour-backup selection/value and tactical
swap actions. This leaf does not implement C source82's emergency weapon-versus-
armour comparison; the previously recorded future-selector trigger still applies.
Source2/Neo469 and upstream72 remain producer-owned. A verified local carry does
not assert upstream acceptance or lab deployment. All other package patch
removal units remain independent. No default engine upgrade, private data,
new strategy, Rust/C-official posting or publication is part of this adoption.
