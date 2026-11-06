# Combined Mandos C corrections: cold danger and unseen-name recognition

Consumers [Mandos164](https://github.com/diegoami/mandos/issues/164) and
[Mandos165](https://github.com/diegoami/mandos/issues/165) remain independent.
This integration combines only their reviewed source/test/proof units and one
own plugin rebuild, avoiding two competing generated-plugin/full-gate branches.
It does not claim either correction carried in main until normal merged-head
consumer verification. Official upstream acceptance is not a prerequisite for
locally carrying these validated applicable proposals.

## Exact source and integration provenance

Base: latest main **38ada82b644868e80d6e3ffe36a6f626cdde66e5**, including the
prose-only death-analysis plan; no death-analysis implementation is included.
Normal attributed `cherry-pick -x` preserves each published original topic:

| Canonical C source / correction | Original TS source / evidence | Integration source / evidence |
| --- | --- | --- |
| [diegoami/neo-angband-tracker#26](https://github.com/diegoami/neo-angband-tracker/issues/26), proposal267 d504eb3d272ce96c0de2c00eba757a251b551334 | 14a54fccbd3e287073a1b59d5cadd64d1d202512 /a9b9ad3ed130df22ce05fe93c600ae1e3f9ac921 | 9f0fb1e /e97f825 |
| [diegoami/neo-angband-tracker#102](https://github.com/diegoami/neo-angband-tracker/issues/102), proposal273 cad765806eed6431642ab02b53240d7938470c21 | 81600f90ab4e780a05333eb4aa4a988ed431c518 /3499555def31c15c9cc138f5b512ebd3c2585ea1 | b72cc5a /01433f9 |

The executable changes are the cold branch's temporary-protection field and the
case-insensitive complete `It` comparison. All other danger, escape, detection,
RNG and class policy remain unchanged. New integration provenance uses qualified
canonical references; frozen topic source/proof/patch bytes are not rewritten.
Both independent TS units now live under patches/c-translations; the name
unit's move is the original normal evidence commit, not a rewritten source head.
Their [provenance index](../../../patches/c-translations/README.md) records exact
source/consumer links and separate replacement conditions, not live carry state.

## Independent practical evidence and limits

- Cold: [actual public-engine proof](../2026-11-06-c-cold-carry/README.md),
  baseline2expectedfail/4controls,43focused passes after. Acid-only danger26→58
  changes no escape to an executed Phase Door scroll/movement; cold-only58→26
  reverses it and keeps the scroll. Four full control JSON records are identical.
  No world loop/monster attack is scheduled; HP stays70. The native C producer's
  HP/mana tradeoff is explicitly separate, not a TS survival/damage claim.
- Name: [actual perception/defense/potion proof](../2026-11-06-cbug0086/README.md),
  baseline2expectedfail/4controls,112focused passes after. A visible tracked
  Itangast message no longer raises unseen fear/requests an executed True Seeing
  potion; actual It/it/Something descriptors and the ordinary named control
  remain unchanged. The perception/danger setup and native potion transaction
  scopes, synthetic conditions and no full-fight claim are explicit.

No fixture assertion, seed, cap, timeout or consumer boundary was weakened.
The [name report-only CCW/ring intake note](https://github.com/diegoami/mandos/commit/64bf812)
is separate; this integration does not add a healing or ring policy correction.

## Combined consumer verification

Actual local results after integrating both runtime units:

```sh
pnpm typecheck
CI=1 NO_COLOR=1 pnpm exec vitest run src/danger/cold-melee-carry.test.ts src/danger/danger.test.ts src/fight/escape-stair.test.ts src/perceive-unseen-name.test.ts src/perceive.test.ts src/fight/fight.test.ts
CI=1 NO_COLOR=1 pnpm exec vitest run src/postmortem/replay.test.ts
pnpm build
```

Focused **155/155 passed,6files,zero skips**,1.98s. Standalone replay ran
**ALONE:5/5 passed,zero skips**,8.80s. Typecheck and own plugin build pass.
All six combined cold observation records exactly equal the independent corrected
records; all frozen evidence manifests and both TS patch reverse-checks pass.
The shared heavy-validation lock was held for live tests/replay/build, then released.

Own plugin:737.5KiB,API >=2.0.0 <3.0.0, SHA256
**ef9614a8a49c316f1de5f9b38dd11e5f21c08939e09ef4c977e2565a824be34a**.
Published core/SDK/content beta.2, package/lock/workspace config and the combined
engine patch are unchanged. Trap MD534c27241f96aceff581bcb186a9d898f; combined
patch SHA25632af5c48c56b71889dfa70551c053a17430ad174da59634f96b1170fb1ea8513.
No source/other-profile plugin is copied or live lab deployed.

Expected full gate:1190previous+6cold+6name=**1202tests,73files**, no skips.
At first publication the required exact-head hosted full gate is still pending;
actual PR/main outcomes are recorded on164/165 and the integration PR before
any verified carry/merge claim. No duplicate local full gate is invented after
appropriate required hosted verification. There is no package upgrade, live
profile/data/OAuth, native-source workbench, Neo-port repair, Rust polling,
official C post, new strategy or death-recording implementation here.
