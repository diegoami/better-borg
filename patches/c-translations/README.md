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

Discovery credit remains borg-rs; native C reproduction and Mandos TS proof are
independent and linked on the consumer issues. Local validated proposals are
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
until the verified replacement arrives. The combined beta.2 engine package patch
has its own separate removal units in [the parent index](../README.md).
Historical [native C copies](../upstream-c/) remain frozen for existing links.

The cold topic's original patch path is unchanged. The name topic originally
used patches/mandos-c; its normal evidence follow-up3499555 renamed that file
100% into this directory without rewriting source81600 or its published topic
history. Original evidence commits/pins stay immutable; source/fixture hashes
refer to their named revisions, not a claim about every later baseline.
