# Registered-object fixture correction and authoritative consumer results

This supplement **supersedes the earlier manual fixture's legal-item identity
claim** in README.md and the first before/after records. Those files remain
unchanged as history, with their original SHA256SUMS. No failed result or
intervention is silently erased.

The first fixture used sval1 for both artifact base kinds and filler armour;
actual registered Bastard Sword/Glaive/Chain Mail subtypes are10/13/2. It also
allowed duplicated artifact placements in negative setups. The runtime score
uses type, damage, flags/resistances and known traits, not subtype, but the
strict registered-public-view claim was imprecise and required correction.
No runtime, weights, assertions, seeds, caps or timeouts are changed to obtain
passing tests.

## Exact source and fixture

Test-only producer follow-up **7b8d618eceb24a89530dabee67be656d300f1ccc**, on
[upstream modPR72](https://github.com/neostryder/neo-angband-mod-borg/pull/72).
The entire src/store/weapon-backup.test.ts is copied byte-for-byte:
SHA256 **7c5d36d1d7c53b79dc6b52e78b729a78879f297c92069fdf135dc9322366a9de**.
Runtime import remains Mandos **cd4ba5aa2da997e62047da52e396f052fc2fd187** from
sourcea2d73659140be6913c4abed6aaa80ae48b96da10. Its code and own plugin are
unchanged by this correction. New source7b8d618 passed the clean producer's
943tests/50files/zero skips; Mandos still requires its independent beta.2 gate.

The fixture now creates actual registered objects with Core.startGame,
objectPrep and copyArtifactData, learns runes via the native API and obtains
public KnownItems through buildKnownWorld. Bound kind key/type/subtype,
artifact identity, dice and known state are asserted before any Borg decision.
Only this disposable fixture sees native objects; production code receives
public views. Equal/weaker/current-backup controls use ordinary non-artifacts;
taking the candidate into inventory removes it from HOME; the nonweapon
control uses the real Colluin cloak. The intentionally contradictory
awareness=false guard is explicitly a malformed-contract negative control,
not an ordinary legal generated object.

## Repeatable before/after on Mandos beta.2

The SAME corrected full17-case file was placed on unmodified Mandos
**507edace3377c5f6e67c86e71ed1f0379c1baa42** in a disposable baseline tree:

```sh
CI=1 NO_COLOR=1 pnpm exec vitest run src/store/weapon-backup.test.ts
```

Actual before: **6 expected failures /11 passes /17 executed**,1.50s,exit1.
All native identity/knowledge assertions pass. The six failures are missing
HOME selection, backup power/handle/evaluator behavior, not fixture errors.
The two original public failure cases still fail. The 11 controls pass.

With the carried runtime and identical fixture:

```sh
CI=1 NO_COLOR=1 pnpm exec vitest run src/store/weapon-backup.test.ts src/store/weapon-backup-capacity.test.ts src/trait/weapon-swap.test.ts src/think-session.test.ts src/trait/trait.test.ts
CI=1 NO_COLOR=1 pnpm exec vitest run src/postmortem/replay.test.ts
```

Actual after: **96/96 focused passes,5files,zero skips**,1.53s.
Standalone replay ran **alone:5/5 passed,zero skips**,8.69s. Typecheck passed.
Raw corrected logs/exits are adjacent. The 28new cases and1190full expected
count stay unchanged. These are constructed decision/value/capacity controls,
not natural encounter frequency, full-autoplay or a survival/death claim.

## Preserved initial full gate and final-head requirement

The initial fixture head2467d7b completed hosted
[42205065495](https://github.com/diegoami/mandos/actions/runs/42205065495):
explicit full route,71files/1190tests/zero skips,285.81s,737.5KiB API2 plugin
current; privacy42205065652 passed. That active job was left intact. Its first
6m40s were apt/rclone setup; gameplay verify started10:52:11UTC. Its green
outcome is retained as an old-head regression result, **not** substituted for
this corrected fixture's final-head gate. The new exact-head full gate and
parent producer/consumer review are recorded on125/PR163 before merge.

Published core/SDK/content beta.2, package/lock/workspace config and the combined
patch remain unchanged. Plugin SHA256 remains
c028dd70f3e51c5ded157442d1016a6c1e2432ebb9ba75508e87cca07d9f24a3;
core trap MD5 remains34c27241f96aceff581bcb186a9d898f.125 remains partial/open
for armour and tactical swapping; this HOME leaf still does not implement C82's
emergency selector. No lab/profile, package upgrade, new strategy or source
repair is implied.
