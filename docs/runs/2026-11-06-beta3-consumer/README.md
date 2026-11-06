# Published beta.3 consumer adoption — focused preparation

[Mandos180](https://github.com/diegoami/mandos/issues/180), coordinated by [workspace22](https://github.com/diegoami/angband-workspace/issues/22), starts from verified Mandos main6c7916ac27201da502c855caae39f1ff059be002 (1,284 tests/79 files/zero skips). The producer is [engine PR300](https://github.com/diegoami/neo-angband-tracker/pull/300), source203cd50fb78c4897f93e0e51701f6b5e3521eb25 and its immutable audit, provisionally usable after focused checks; required producer full/merge/post-main checks are still pending at this receipt. No PR, final replay/full gate or consumer label changes are claimed here.

## Four independent package units

| Unit / canonical source | Actual published beta.3 | This consumer profile / proof |
| --- | --- | --- |
| noteSpot429, [source4](https://github.com/diegoami/neo-angband-tracker/issues/4), [Mandos126](https://github.com/diegoami/mandos/issues/126) | trap.js imports noteSpot and calls it in the live setFeat hook | Replaced; no trap.js hunk. Existing seen/player-square/unseen controls pass. Installed trap.js is byte-identical to raw published beta.3. |
| class mapping0cc75, [source15](https://github.com/diegoami/neo-angband-tracker/issues/15), [Mandos147](https://github.com/diegoami/mandos/issues/147) | bind.js uses actual spells.length | Replaced; no class binding hunk. Every class-wide spell lookup and Rogue vacant-slot regression pass, plus real magic-play class controls. Installed bind.js equals raw beta.3. |
| input-flush432, [source5](https://github.com/diegoami/neo-angband-tracker/issues/5), [Mandos128](https://github.com/diegoami/mandos/issues/128) | disturb clears native queue/rest/run but does not signal input-flush | Retained marked PR432 unit. Actual queue/run/rest and declared host subscriber/fault controls prove the signal and error-report behavior. Source5/PR432 remain open. |
| accepted birth/seed433, [source6](https://github.com/diegoami/neo-angband-tracker/issues/6), [Mandos129](https://github.com/diegoami/mandos/issues/129) | No retained master seed or accepted-birth input/save/load declaration/runtime fields | Retained marked PR433 unit, including existing Core declarations. Actual birth/save/load/legacy/invalid/reincarnation controls pass. Source6/PR433 remain open; the unchanged SDK supplies no new birth-report seam. |

The new beta.3 patch is exactly the old combined patch with the noteSpot/class groups excluded. The historical beta.2 patch is byte-unchanged and remains available for old receipts. `enginePin()` reports beta.3 + PR432/PR433 only. No source5/6 acceptance is inferred from the release number. Closed/fixed126/147 and carried/open128/129 remain unchanged during preparation; removing a package unit is independent of source closure and a separately running lab. Parent will reconcile patch-active after actual verified main adoption.

## Actual packages and unchanged source

All three exact Core/SDK/content1.23.0-beta.3 registry gitHeads equal97ceec2925e6715ba725624a61866ab93a196a12, matching the official release tag inspected by the producer. `package-audit.json` records registry URL/integrity and actual downloaded SHA512/SHA256. Tarball package.json files do not themselves embed gitHead; this provenance comes from the captured registry metadata, not an invented package field. Core depends on exactly SDK beta.3. The lock diff changes only these three packages, that Core→SDK edge and the new patch hash; acorn, esbuild, TypeScript, Vitest and other resolved dependencies stay unchanged.

All91 SDK declaration files compare byte-identically with installed beta.2 SDK; all45 content data JSON files are unchanged. Core declaration differences outside retained birth fields are terrain-hook documentation and version strings. There is no inferred new API2 capability or feature. Native/runtime equality comparisons for replaced files and distinct retained-unit files are in `unit-files.json`.

`preservation.json` proves all seven C-to-TS patch units, their five production source files, six fixture files and the historical beta.2 engine patch equal baseline6c byte-for-byte. Current provenance table formatting/version wording is maintained separately; no C correction is added, dropped or translated into the faithful port. Existing live-export ca627bf and every historical run record are untouched.

The own plugin was built once with SDK beta.3 and remains byte-identical:737.6KiB/API2, SHA256d3ea31f0bfdf83581d0a0ccf2117c1e8cd8f9486698ecaac465bc93b87f33f6b. trap.js MD5 changes to ce8b43e933803487d70973d5a9e0905c because the published replacement has different source bytes; the active432/433 patch does not touch trap.js. Living process/checkpoint metadata is updated to that actual profile; old evidence is not rewritten. See fingerprint.json.

## Focused before/after and limits

Six new package tests exercise the actual exported Core APIs. A test-only explicit MANDOS_PACKAGE_PROOF_ENTRY can point to a private copy of the **raw downloaded published beta.3 tarball**, with its declared beta.3 SDK dependency linked. This comparison does not opt into an unreleased/local engine and is never used by normal full verification. The default test uses the installed published beta.3 plus the two named pnpm units.

After correcting fixture host setup, raw beta.3 produces five intended assertion failures and one passing legacy/malformed-data control (`raw-final.log/json`). The default patched profile passes those six plus existing noteSpot/class/magic and all seven C-correction fixture controls: **105/105 tests across nine files, zero skips,3.57s**, with typecheck passing (`focused.log`, `typecheck-final.log`). The raw and patched runs use identical final test bytes; no private engine state implementation is injected, no queue/reset function is replaced and no RNG is forced. Inputs use real startGame/GameEvents/disturb/saveGame/loadGame/reincarnate and documented host-before-birth RNG draws.

The first attempt wrongly assumed a headless startGame supplies frontend events by default. It does not: two TypeErrors occurred on both profiles and are retained as invalid fixture attempts (`initial-*`), not claimed as defect failures. The corrected fixture attaches the exported production GameEvents host bus. The native queue/run/rest objects are real; the subscriber observes the actual signal, and a failing subscriber is reported through the declared fault hook after cancellation. Birth controls preserve the actual original seed and pre-generation input; unknown host input does not fabricate a seed, legacy/invalid metadata stays absent, and reincarnation does not reuse the old character input. Tests do not claim that the unchanged SDK added a first-party live birth-report API or that old watched lineages are now replayable.

Commands, from the own isolated installed tree, under the shared lock:

```sh
MANDOS_PACKAGE_PROOF_ENTRY=/absolute/path/to/raw-published-core/dist/index.js pnpm test src/engine-package-backports.test.ts
pnpm test src/engine-package-backports.test.ts src/engine-carry.test.ts src/item/magic-play.test.ts src/danger/cold-melee-carry.test.ts src/perceive-unseen-name.test.ts src/item/enlightenment-carry.test.ts src/danger/shot-origin-carry.test.ts src/item/ccw-timing.test.ts src/fight/c-spell-carry.test.ts
pnpm typecheck
pnpm build
```

The raw comparison is expected to fail5/6; do not pass its override to normal verification. Full replay/full gate and actual adoption are explicitly **HELD** pending verified engine handoff and parent GO. No skips/assertions/seeds/timeouts/caps were weakened. No source engine/port edit, extra glyph/light/C fix, lab/profile/data action, deploy, publishing, tag change, official C post or Rust work occurred.
