# Mandos translations of native C corrections

These are independent **TypeScript source deltas**, not native C patches and
not pnpm patched-dependency inputs. Canonical defects/native evidence and
reusable C proposals stay in the source tracker. The linked Mandos consumer
issues own current application/verification state; this index records provenance
and removal units, not a second live carry/status table.

| Canonical C source / reviewed correction | Original TS translation | Consumer / independent TS unit |
| --- | --- | --- |
| [diegoami/neo-angband-tracker#26](https://github.com/diegoami/neo-angband-tracker/issues/26), [C proposal267](https://github.com/diegoami/neo-angband-tracker/pull/267), d504eb3d272ce96c0de2c00eba757a251b551334 | [14a54fccbd3e287073a1b59d5cadd64d1d202512](https://github.com/diegoami/mandos/commit/14a54fccbd3e287073a1b59d5cadd64d1d202512), cold temporary-protection field | [Mandos164](https://github.com/diegoami/mandos/issues/164), [CBUG-0004-cold-melee.patch](CBUG-0004-cold-melee.patch) |
| [diegoami/neo-angband-tracker#102](https://github.com/diegoami/neo-angband-tracker/issues/102), [C proposal273](https://github.com/diegoami/neo-angband-tracker/pull/273), cad765806eed6431642ab02b53240d7938470c21 | [81600f90ab4e780a05333eb4aa4a988ed431c518](https://github.com/diegoami/mandos/commit/81600f90ab4e780a05333eb4aa4a988ed431c518), complete unseen-attacker pronoun | [Mandos165](https://github.com/diegoami/mandos/issues/165), [CBUG-0086-exact-unseen-name.patch](CBUG-0086-exact-unseen-name.patch) |
| [diegoami/neo-angband-tracker#81](https://github.com/diegoami/neo-angband-tracker/issues/81), [C proposal275](https://github.com/diegoami/neo-angband-tracker/pull/275), 526906c0f367cd690bdd92b99ac1e114fd84b1a2 | [b5f4e79f7193e05a2bceeea4587f7c28f85e417a](https://github.com/diegoami/mandos/commit/b5f4e79f7193e05a2bceeea4587f7c28f85e417a), recognized dungeon Enlightenment call | [Mandos171](https://github.com/diegoami/mandos/issues/171), [CBUG-0065-enlightenment.patch](CBUG-0065-enlightenment.patch) |
| [diegoami/neo-angband-tracker#279](https://github.com/diegoami/neo-angband-tracker/issues/279), [C proposal281](https://github.com/diegoami/neo-angband-tracker/pull/281), 1bce07d8080b520589c292c793cc0b95ef9df182 | [e8c125b1038e20df3ea3218b5c838e93adef71e6](https://github.com/diegoami/mandos/commit/e8c125b1038e20df3ea3218b5c838e93adef71e6), caster-origin occupancy guard | [Mandos172](https://github.com/diegoami/mandos/issues/172), [shot-path-279-caster-origin.patch](shot-path-279-caster-origin.patch) |
| [diegoami/neo-angband-tracker#77](https://github.com/diegoami/neo-angband-tracker/issues/77), [C proposal271](https://github.com/diegoami/neo-angband-tracker/pull/271), cedf25eb790f2ff7c7c161cd1612b18ed99fb35e | [a3a72f088d1d17f08758389da6384433b4e95e4f](https://github.com/diegoami/mandos/commit/a3a72f088d1d17f08758389da6384433b4e95e4f), explicit prior-request existence and elapsed 1..4 conservation boundary | [Mandos168](https://github.com/diegoami/mandos/issues/168), [CBUG-0061-ccw-timing.patch](CBUG-0061-ccw-timing.patch) |
| [diegoami/neo-angband-tracker#248](https://github.com/diegoami/neo-angband-tracker/issues/248), [C proposal291](https://github.com/diegoami/neo-angband-tracker/pull/291), 6912b85cb7b902616ad786dfc20afe3b4cf28b10 | [4eb72dca1707af4d18cecb198bbd3ea7e4466801](https://github.com/diegoami/mandos/commit/4eb72dca1707af4d18cecb198bbd3ea7e4466801), Dispel Life living-target filter | [Mandos175](https://github.com/diegoami/mandos/issues/175), [source248-dispel-living.patch](source248-dispel-living.patch) |
| [diegoami/neo-angband-tracker#257](https://github.com/diegoami/neo-angband-tracker/issues/257), [C proposal293](https://github.com/diegoami/neo-angband-tracker/pull/293), 0119d5daee9b8a07a8096331eea78dbbb6c26050 | [fca27df4de0d2036c3c0ab8111c0ac273ae589ad](https://github.com/diegoami/mandos/commit/fca27df4de0d2036c3c0ab8111c0ac273ae589ad), chosen Vampire Strike distance | [Mandos176](https://github.com/diegoami/mandos/issues/176), [source257-vampire-selected-distance.patch](source257-vampire-selected-distance.patch) |

Discovery attribution is source-specific: the CBUG-numbered leads above credit
borg-rs; source279 was independently found during native validation of another
report. Native C reproduction and Mandos TS proof are independent and linked
on each consumer issue. Local validated proposals are
eligible before official upstream acceptance. Storing a patch file alone is
not applied/verified consumer adoption.

## Retirement and replacement

Keep each unit separate. On a future TS baseline import, inspect the exact
replacement code and caller, then verify that unit's corresponding legal TS
before/after/negative controls and normal consumer gate. Retire or replace its
local delta/reference only in a normal reviewed change naming the replacement
baseline, evidence and consumer issue. Never remove the actual correction just
because a C proposal closed or another consumer adopted it; never silently drop
an unrelated hunk.

C upstream acceptance plus verified equivalent Mandos adoption controls
carried/open versus fixed/closed consumer state. Patch maintenance and package
patch-active labels remain independent of closure. If the faithful TS upstream
still needs the local functional delta, retain its provenance/removal record
until the verified replacement arrives. Historical/optional engine package backports
have their own separate provenance in [the parent index](../README.md).
Historical [native C copies](../upstream-c/) remain frozen for existing links.

The cold topic's original patch path is unchanged. The name topic originally
used patches/mandos-c; its normal evidence follow-up3499555 renamed that file
100% into this directory without rewriting source81600 or its published topic
history. Original evidence commits/pins stay immutable; source/fixture hashes
refer to their named revisions, not a claim about every later baseline.
