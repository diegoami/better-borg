# B81 — Feed analyzed item knowledge/value to shopping and home

Kind: DEFECT inherited from the Neo TypeScript port. Tracker81; Neo464.

buildStoreDeps omitted the knowledge/value hooks already used by inventory.
As a result, unknown-rune equipment could be selected for sale, home notice
missed unidentified wares, and prices were interpreted as stack totals.

Share the existing analyzed-item valuation helper between item/store
builders. Supply awareness, identification, unknown-rune, worth-ID, One Ring
and per-item value hooks before the no-loadout-evaluator return. Existing
loadout scoring/config/memory behavior remains covered by controls.

C reference e473720, also checked f3082213 (4.2.6):
- borg-item-analyze.c450–460:ident/needs_ident;611–623:value branches.
- borg-store-sell.c838–847:retain unknown gear;1052:cheaper value first.
- borg-home-notice.c495–499:count unidentified home items.

9 regression scenes:before8 failures/1 control pass on Mandos and pristine
Neo74a017d;after9/9. Combined store/item/session/settings152/152 on both own
beta.2 and isolated upstream beta.1 dependencies. Warrior1/2 cap600 c2d1
control2/2 before/after, gameplay identical except wallClockMs. See append-only
runs2026-11-05-b81-store-before/after; no natural survival benefit claimed.

Done-when commands:
- pnpm exec vitest run src/store/knowledge.test.ts src/store/store.test.ts src/think-session.test.ts src/settings.test.ts src/item/junk-space.test.ts
- pnpm exec vitest run src/postmortem/replay.test.ts
- CI=1 pnpm verify

Remaining scope: bare StoreDeps defaults still require hooks; production now
supplies them. Existing random-power approximations in sell/home are not
corrected by this wiring fix. Keep81 open for that review and upstream
adoption; do not claim all item analysis or all runtime consumers fixed.
