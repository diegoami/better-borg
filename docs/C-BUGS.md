# C Borg bugs and candidates

This is our maintained catalogue, not an upstream C maintenance commitment. **No submissions to angband/angband.** Proposed fixes stay in our repositories; an owner may later choose to share the list.

Updated 2026-11-05. Credit: [borg-rs catalogue](https://github.com/diegoami/borg-rs/blob/6fb471179e28224ac3259434c768afaff0a367ae/docs/c-bugs.md), plus our independent source/scenario checks. Intake [#102](https://github.com/diegoami/mandos/issues/102), broader audit [#93](https://github.com/diegoami/mandos/issues/93).

The source has **35 numbered groups**. There are **18 separately tracked C findings** here: 1 native C-game outcome reproduction, 1 C-game flag-only reproduction, and 16 source checks. Other symptoms in the group inventory remain intake leads. These counts are not a count of confirmed gameplay defects.

Since the prior source pin, groups 1–33 are unchanged. New groups 34 and 35 contain 14 symptoms; the two transaction-history symptoms overlap group33 and are deduplicated. Returned-command stair behavior produces a separately tracked Neo port lead.

A source check establishes code/predicate/state flow, not legal reachability or a changed outcome. Priority ranks validation work. Harmless/dead branches and unproven stacked-ring reachability are explicitly kept below demonstrated failures.

## Reference pins

- C: `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`. The imported 4.2.6 snapshot is a different reference.
- Neo Borg: `74a017d2f695939eb2f046b7c9ff286ef1e82568`.
- Mandos runtime source checked: `48405e9621ffc400f7af43e7fd1ed2385225ca1f`.
- Rust source: `6fb471179e28224ac3259434c768afaff0a367ae`; prior `66dced95ba5c61b95fb011b01c3d214b7ab2c4a6`.

## Our fix proposals

C-source PRs target **diegoami/neo-angband:c-borg-reference** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. Local PRs may remain drafts and never need to be submitted upstream.

| Finding | Our proposal | Evidence | Applied/carry |
| --- | --- | --- | --- |
| CBUG-0001 | [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — draft, c-game-reproduced | c-game-reproduced | not-carried |
| CBUG-0003 | [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — draft, impact-unproven | c-game-flags-only | not-carried |

A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.

## Classified findings

| ID | Symptom | Priority | Evidence | Neo/Mandos | Tracker |
| --- | --- | --- | --- | --- | --- |
| [CBUG-0001](#cbug-0001) | Cancelling a map dump dereferences a NULL file | high | c-game-reproduced | no-counterpart | [#94](https://github.com/diegoami/mandos/issues/94) |
| [CBUG-0002](#cbug-0002) | Paralysis/knockout message suppression resets a different variable | high | source-checked | absent-different-pipeline | [#95](https://github.com/diegoami/mandos/issues/95) |
| [CBUG-0003](#cbug-0003) | West radius-two shoulder grids are omitted | med | c-game-flags-only | shared | [#87](https://github.com/diegoami/mandos/issues/87) |
| [CBUG-0004](#cbug-0004) | Cold melee uses temporary acid resistance | high | source-checked | shared | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0005](#cbug-0005) | Black Market Teleport Other rod class exception is reversed | high | source-checked | shared | [#103](https://github.com/diegoami/mandos/issues/103) |
| [CBUG-0006](#cbug-0006) | Starvation shopping exception admits unrelated scrolls/subtypes | high | source-checked | shared | [#104](https://github.com/diegoami/mandos/issues/104) |
| [CBUG-0007](#cbug-0007) | Home trial early exits leave reduced quantities/charges | med | source-checked | absent-value-simulation | [#105](https://github.com/diegoami/mandos/issues/105) |
| [CBUG-0008](#cbug-0008) | Ring-side scores persist across home wares | med | source-checked | absent-different-ring-simulation | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0009](#cbug-0009) | Home ring trials use asymmetric quantities | low | source-checked | absent-different-ring-simulation | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0010](#cbug-0010) | Home grab skip flag leaks to later wares | med | source-checked | absent-per-ware-reset | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0011](#cbug-0011) | No-hole swap exit leaves valuation changed | med | source-checked | no-equivalent-swap-subsystem | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0012](#cbug-0012) | Swap trials overwrite the tracked swap inventory slot | med | source-checked | no-equivalent-swap-subsystem | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0013](#cbug-0013) | Latest purchase/sale is outside the history reader range | med | source-checked | shared | [#106](https://github.com/diegoami/mandos/issues/106) |
| [CBUG-0014](#cbug-0014) | Ten-entry transaction arrays never use the tenth slot | low | source-checked | shared | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0015](#cbug-0015) | Critical escape returns with pretend full mana | med | source-checked | absent-no-full-mana-assignment | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0016](#cbug-0016) | Stair predicate queues a climb before phase guards finish | high | source-checked | different-port-defect | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0017](#cbug-0017) | Guarded anti-summon timer reset is unreachable | low | source-checked | shared-helper-semantics | intake [#102](https://github.com/diegoami/mandos/issues/102) |
| [CBUG-0018](#cbug-0018) | Dimension Door destination lacks legality/range filters | high | source-checked | partially-shared | [#107](https://github.com/diegoami/mandos/issues/107) |

### CBUG-0001

**Cancelling a map dump dereferences a NULL file** — local-proposal; not-carried.

Reference: [src/borg/borg-log.c:borg_write_map](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c); borg-rs group(s) 13. Checked 2026-11-05.

Escape at the map filename prompt crashes the C game (SIGSEGV); the guard returns safely. No lost-progress claim.

59 C Borg units, no Rust Borg linked; direct function diagnostic in a normally born C game. Top-level Ctrl-Z dispatch and failed-open branch were not separately runtime-tested.

Evidence: **c-game-reproduced**. [Reproduction report](audit/c-reports/B94/README.md). Neo/Mandos: **no-counterpart**.

Our proposals: [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — draft, c-game-reproduced. Tracker: [#94](https://github.com/diegoami/mandos/issues/94).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0002

**Paralysis/knockout message suppression resets a different variable** — investigate; not-carried.

Reference: [src/borg/borg.c / borg-messages-react.c](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg.c); borg-rs group(s) 14. Checked 2026-11-05.

C reactions can remain suppressed after recovery; no actual later death/decision change observed.

Older imported C resets the global correctly. This is a newer C regression, not a Neo omission.

Evidence: **source-checked**. Neo/Mandos: **absent-different-pipeline**.

Our proposals: none. Tracker: [#95](https://github.com/diegoami/mandos/issues/95).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0003

**West radius-two shoulder grids are omitted** — held-impact; not-carried.

Reference: [src/borg/borg-cave-light.c:borg_update_light](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c); borg-rs group(s) 4. Checked 2026-11-05.

Native C marks 19 distinct grids versus 21 after correction; no meaningful gameplay outcome established.

Duplicate light-list entries are a separate symptom; avoid claiming two missing flags saved a life.

Evidence: **c-game-flags-only**. [Related evidence](https://github.com/diegoami/mandos/issues/89). Neo/Mandos: **shared**.

Our proposals: [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — draft, impact-unproven. Tracker: [#87](https://github.com/diegoami/mandos/issues/87).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0004

**Cold melee uses temporary acid resistance** — investigate; not-carried.

Reference: [src/borg/borg-danger.c:borg_danger_physical](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c); borg-rs group(s) 17. Checked 2026-11-05.

Can misestimate a cold blow when only one temporary resistance is active; real changed combat choice pending.

Independent of the other danger slips in the same Rust group.

Evidence: **source-checked**. Neo/Mandos: **shared**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0005

**Black Market Teleport Other rod class exception is reversed** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_good_buy](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

A useful escape device can be rejected for the wrong class; real purchase/survival effect pending.

Both current C and src/store/buy.ts use !=MAGE && ==ROGUE.

Evidence: **source-checked**. Neo/Mandos: **shared**.

Our proposals: none. Tracker: [#103](https://github.com/diegoami/mandos/issues/103).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0006

**Starvation shopping exception admits unrelated scrolls/subtypes** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_shop_buy_useful](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

A starving character can consider unrelated supplies; no observed starvation or loss of gold proved.

Both C and src/store/buy.ts use the conjunction that exempts every scroll and any matching numeric sval.

Evidence: **source-checked**. Neo/Mandos: **shared**.

Our proposals: none. Tracker: [#104](https://github.com/diegoami/mandos/issues/104).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0007

**Home trial early exits leave reduced quantities/charges** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_buy_useful](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

Later C trials can see a modified home snapshot; real item loss is not claimed.

C decrements before the two-empty-slot continue. TS BuySim path does not mutate those wares.

Evidence: **source-checked**. Neo/Mandos: **absent-value-simulation**.

Our proposals: none. Tracker: [#105](https://github.com/diegoami/mandos/issues/105).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0008

**Ring-side scores persist across home wares** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_buy_useful](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

C can compare a ring using an earlier ware's score when the other slot holds the One Ring.

p_left/p_right declared outside the loop; current TS helper has no corresponding accumulators. Broader ring parity is independent.

Evidence: **source-checked**. Neo/Mandos: **absent-different-ring-simulation**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0009

**Home ring trials use asymmetric quantities** — review-only; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_buy_useful](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

Potential unequal left/right power trial; legal qty>1 ring reachability remains unproven.

Do not fabricate stacked-ring gameplay or call this a proven bad equip decision.

Evidence: **source-checked**. Neo/Mandos: **absent-different-ring-simulation**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0010

**Home grab skip flag leaks to later wares** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_grab_useless](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

Once one recently sold ware is skipped, later C wares may be skipped too.

TS src/store/buy.ts declares let skip=false inside each ware loop.

Evidence: **source-checked**. Neo/Mandos: **absent-per-ware-reset**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0011

**No-hole swap exit leaves valuation changed** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_buy_swap_weapon/armour](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

C returns with swap value -1 instead of restoring it; next real decision impact unproven.

TS returns through an optional evaluation seam and has no corresponding global mutation. #4 missing swap functionality is a separate port gap.

Evidence: **source-checked**. Neo/Mandos: **no-equivalent-swap-subsystem**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0012

**Swap trials overwrite the tracked swap inventory slot** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c:borg_think_home_buy_swap_weapon/armour](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 34. Checked 2026-11-05.

C's model can lose its old swap item until inventory refresh; no actual game item destruction claimed.

The TS evaluator does not copy candidates over a mutable C inventory array.

Evidence: **source-checked**. Neo/Mandos: **no-equivalent-swap-subsystem**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0013

**Latest purchase/sale is outside the history reader range** — investigate; not-carried.

Reference: [src/borg/borg-store-buy.c / borg-store-sell.c transaction counters](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 33, 34. Checked 2026-11-05.

Immediate buy-back/resale suppression can miss the newest record; full transaction scenario pending.

Writers store a last index, readers scan p<num. Group34's purchase half shares the cause already reported in33; one catalogue entry.

Evidence: **source-checked**. Neo/Mandos: **shared**.

Our proposals: none. Tracker: [#106](https://github.com/diegoami/mandos/issues/106).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0014

**Ten-entry transaction arrays never use the tenth slot** — review-only; not-carried.

Reference: [src/borg/borg-store-buy.c / borg-store-sell.c transaction wrap](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c); borg-rs group(s) 33, 34. Checked 2026-11-05.

History capacity is nine rather than ten; whether this is intentional or harmful remains unproven.

Keep this separate from the latest-entry omission; do not inflate it into a gameplay failure.

Evidence: **source-checked**. Neo/Mandos: **shared**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0015

**Critical escape returns with pretend full mana** — investigate; not-carried.

Reference: [src/borg/borg-escape.c:borg_escape danger level1](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c); borg-rs group(s) 35. Checked 2026-11-05.

C trait state retains MAXSP until notice refresh after a successful critical attempt; later bad choice unproven.

TS never assigns pretend full mana here. Its over-exertion parity is a separate question, not this leak.

Evidence: **source-checked**. Neo/Mandos: **absent-no-full-mana-assignment**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0016

**Stair predicate queues a climb before phase guards finish** — investigate; not-carried.

Reference: [src/borg/borg-escape.c:borg_escape levels3/4/5/6/8](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c); borg-rs group(s) 35. Checked 2026-11-05.

C may leave climb keys queued or queue both climb and phase while applying phase bookkeeping.

TS returns commands rather than queuing keys: a stair AgentCommand used as a boolean is discarded. See PORT-0001; this is not the same faithful C queue symptom.

Evidence: **source-checked**. Neo/Mandos: **different-port-defect**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0017

**Guarded anti-summon timer reset is unreachable** — review-only; not-carried.

Reference: [src/borg/borg-escape.c:borg_escape](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c); borg-rs group(s) 35. Checked 2026-11-05.

A >50 guarded branch cannot execute its nested <50 reset; practical need for that reset unproven.

TS resetAntisummon applies the same <50 test in those branches. Other call sites can still reset it.

Evidence: **source-checked**. Neo/Mandos: **shared-helper-semantics**.

Our proposals: none. Tracker: intake [#102](https://github.com/diegoami/mandos/issues/102).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0018

**Dimension Door destination lacks legality/range filters** — investigate; not-carried.

Reference: [src/borg/borg-escape.c:borg_dimension_door](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c); borg-rs group(s) 35. Checked 2026-11-05.

An emergency target can be a rejected destination; actual engine outcome still needs a legal scenario.

C also ignores borg_spell's result; TS returns it. Missing floor/occupancy/range selection guards are shared.

Evidence: **source-checked**. Neo/Mandos: **partially-shared**.

Our proposals: none. Tracker: [#107](https://github.com/diegoami/mandos/issues/107).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

## Related port leads

- **PORT-0001**: Returned stair command discarded inside phase predicates; related CBUG-0016; [#108](https://github.com/diegoami/mandos/issues/108). Classify and reproduce independently before any Neo port report; no C submission.

## Complete source-group inventory

This covers all 35 source groups. A group can contain several unrelated causes; a linked finding does not validate its other symptoms.

| Group | Area | Intake / latest note | Detailed IDs |
| --- | --- | --- | --- |
| 1 | banishment | Activation reads object counts as HP. source comparison: C uses has[BI_CURHP]; Mandos already uses the HP trait | intake only |
| 2 | item-ids | Subtype lookup names copied incorrectly. lookup/registration audit pending | intake only |
| 3 | formulas | Malformed formula block ordering. configuration-only lead; valid-input impact unproven | intake only |
| 4 | light | West shoulders omitted and light-list duplicates. west-light existing #87/#89; flags reproduced, practical impact pending | CBUG-0003 |
| 5 | magic | Initial spell status and book iteration. catalogue notes effective guards; no independent play defect established | intake only |
| 6 | formulas | Formula errors overwritten by static formatting buffer. diagnostic lead; large-input memory behavior needs reachability proof | intake only |
| 7 | formulas | range() errors misleading or silent. configuration-diagnostic lead | intake only |
| 8 | home | Spell-stat score discontinuity and dead neck branch. needs an actual keep/retrieve/equip consequence | intake only |
| 9 | magic | Dark flag tested by equality. still present in magic-play.ts; interaction with no-light guards needs scenario | intake only |
| 10 | preparedness | Dead or mislabelled readiness checks. separate diagnostic text from reachable policy behavior | intake only |
| 11 | birth-ui | Respawn menu letters. C UI lead; Neo uses direct birth commands | intake only |
| 12 | home | All item sustains counted as STR; banishment counts missing. sustain bug still visible in Mandos home.ts; transaction consequence pending | intake only |
| 13 | diagnostics | Map-dump NULL-file crash plus display slips. map cancellation C-game reproduced; other slips separate | CBUG-0001 |
| 14 | messages | Reaction suppression reset uses wrong variable. current C mismatch; old imported C resets global correctly | CBUG-0002 |
| 15 | item-ui | Debug quiver inscriptions use equipment keys. C debug-key path; no direct Neo counterpart assumed | intake only |
| 16 | inventory | Unreachable pval tie-break and empty-pack lookup. pval condition preserved; empty-pack symptom must be classified separately | intake only |
| 17 | danger | Resistance/stat/bolt-state/index errors. cold-vs-acid source checked; other compound symptoms remain leads | CBUG-0004 |
| 18 | valuation | Stat bonuses tested as flags. current Neo perItemValue explicitly preserves C's sustain-flag mixup | intake only |
| 19 | flow | Farthest stairs and item tracking slips. normal flow and optional-mode symptoms must be separated | intake only |
| 20 | items | Device fail math, staff/ring/food use. TS division guard and both-ring scan differ; staff gates still suspect | intake only |
| 21 | equipment | Swap chooses higher danger; best-search bookkeeping. C/port comparison needed after B99 ring/home adoption; #4 remains partly absent | intake only |
| 22 | light | Panel-relative beams and last-lantern refuel. panel UI differs; current TS refuel still starts at borgSlot's selected lantern | intake only |
| 23 | item-ui | Curse-removal item letters. C menu path; direct-command port applicability unproven | intake only |
| 24 | tracking | Wrong monster indices, sticky state and pursuit checks. multiple candidates; compare with B99 deletion/history fixes | intake only |
| 25 | item-ui | Enchant prompt inventory context. C menu-selection lead; no direct-command bug inferred | intake only |
| 26 | recovery | Recovery note, duplicate cure and unchecked rod slot. split harmless note/duplicate from reachable missing-rod access | intake only |
| 27 | timers | No-rest int16 overflow from level 33. C narrow-integer effect is absent from the JS number assignment | intake only |
| 28 | buffs | Regeneration simulation side effect and wrong Venom cost. TS guards regen simulation already; Venom cost still references Smite Evil | intake only |
| 29 | glyphs | Terrain, counters and array bounds in glyph flow. legal message/state sequence needed before claiming reachable memory failure | intake only |
| 30 | optional-mode | Munchkin attack/simulation flags leak. optional-mode lead; not ordinary-mode proof | intake only |
| 31 | exploration | Farthest stairs, trap interest and forgotten danger marks. stair cause overlaps group19; split remaining symptoms | intake only |
| 32 | flow | Shop/door predicates, bounds and dead cleanup. legal border/door scenarios needed; dead no-op is not a crash proof | intake only |
| 33 | selling | Trial charges, wrong ego and transaction history. history counter shared with34; other symptoms need separate verification | CBUG-0013, CBUG-0014 |
| 34 | shopping | Purchase filters, home trial state and history. ten symptoms classified below; no new native C scenario claimed | CBUG-0005, CBUG-0006, CBUG-0007, CBUG-0008, CBUG-0009, CBUG-0010, CBUG-0011, CBUG-0012, CBUG-0013, CBUG-0014 |
| 35 | escape | Emergency mana, queued stairs, timer and destination checks. four symptoms classified below; returned-command port has a distinct stair issue | CBUG-0015, CBUG-0016, CBUG-0017, CBUG-0018 |

## Maintenance

Canonical data: [c-bugs.json](c-bugs.json). Regenerate with `node tools/c-bugs.mjs --write`; verify with `node tools/c-bugs.mjs --check`. The tool is offline and never posts or applies a fix.

On a borg-rs/source update, compare pinned content (including edits within existing groups), split independent causes, deduplicate shared callers, recheck C/Neo/Mandos separately and update checked dates. Revisit after a local proposal changes, a fix merges, a consumer adopts/reverts it, or an upstream reference changes. A new file or PR is not proof of application.

Keep local PR ownership/base/head and before/after/control receipts visible. Native C evidence is required before calling a C-game consequence reproduced. If impact is missing, keep the proposal explicitly unvalidated. Local-only C policy is in [RULES.md](../RULES.md), [process](process.md) and [UPSTREAM.md](UPSTREAM.md). No background poller or automatic submission is created.
