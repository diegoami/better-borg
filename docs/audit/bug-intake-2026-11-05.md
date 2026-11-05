# Borg bug intake — 2026-11-05

Tracking: [#93](https://github.com/diegoami/mandos/issues/93), reference watch #86.
Scope: bug hunting and fixing only.

## Pins and confidence

The [borg-rs catalogue](https://github.com/diegoami/borg-rs/blob/66dced95ba5c61b95fb011b01c3d214b7ab2c4a6/docs/c-bugs.md)
at `66dced95ba5c61b95fb011b01c3d214b7ab2c4a6` contains **33 numbered groups**,
many with multiple symptoms. These are leads credited to borg-rs, not 33
independently confirmed Mandos defects. Our own runs and source audits remain
another intake source.

Checked references: Mandos main `9a5a74a`; C master
`e473720ed88a0f0c7ca66815cef3000eb4a38bc3`; Neo Borg master
`43eccea5e787459dff9ca0c5516b24dac097f25b`; Neo engine master
`0cc75b4afcbe6f5128730e4b910408c7be4ac5c5`. The local
`reference/src/borg` is the older imported C snapshot, not current C.
Current C was fetched separately; upstream-sync refreshes the Neo trees.

“Source checked” below means the specified code was inspected, not that a
gameplay consequence was reproduced. “Lead” means intake only: source,
reachability, duplicates and impact remain unverified. Do not propagate
an entire compound group as confirmed because one symptom matches.

## Catalogue intake

| Group | Lead and next discrimination | Current disposition |
| --- | --- | --- |
| 1 | Banishment activation indexes object counts as HP | Source checked: older C uses `has[BI_CURHP]`; Mandos `src/fight/defend.ts` uses the HP trait already. No Mandos fix inferred. C scenario pending. |
| 2 | Item subtype lookups use copied names | Lead; compare runtime-resolved kinds, not names alone. Separate harmful lookups from harmless duplicates. |
| 3 | Formula precedence skips a final token | Lead; malformed-input handling, low priority unless a valid supported formula changes behavior. |
| 4 | West-side light and duplicate light grids | Existing #87/#89, held. Native C flags differ; meaningful decision/outcome still unproven. Do not duplicate. |
| 5 | Spell initialization status and book limits | Lead; catalogue itself notes effective guards/no ninth book. Low priority. |
| 6 | Formula diagnostic overwritten by static formatting buffer | Lead; distinguish poor error text from reachable freed-buffer access. |
| 7 | Formula range errors are misleading or silent | Lead; configuration diagnostic, below crashes/decision defects. |
| 8 | Home stat-value drop and dead amulet penalty | Lead; show actual store/keep/equip decision, not just discontinuous score. Related home-search tracker #79 is not automatically the same bug. |
| 9 | Dark-grid equality instead of bit test | Source checked in Neo `src/item/magic-play.ts`; preserved equality. Establish whether other light guards make it harmless before proposing a C change. |
| 10 | Preparedness checks unreachable/mislabelled | Lead; split dead text from effective readiness policy. No changed strategy justified by dead branches alone. |
| 11 | Respawn uses wrong menu letters | Lead; current C reincarnation was recently rewritten. Recheck latest source, and do not map C menu keystrokes onto Neo's direct birth commands. |
| 12 | Home sustains all count as STR; banishment count absent | Source checked: Mandos `src/store/home.ts` explicitly preserves sustain slip; genocide count is initialized/read but requires scenario audit. Related #79; actual home decision needed. |
| 13 | Cancelling/unwritable map dump may crash | Current-C NULL-file path source checked; dedicated #94, native C-game cancellation crash reproduced; correction/control receipt in [B94](c-reports/B94/README.md). Logging-color slips are separate low-priority leads. |
| 14 | Message suppression never resets after paralysis/knockout | Current-C source checked; dedicated #95. Older imported C correctly resets the global; this is a newer C regression, not a Neo port defect. Legal paralysis/recovery scenario pending. |
| 15 | Debug identification uses wrong quiver selection keys | Lead; debug-only path. Check accepted throwing weapons and actual prompt; no direct Neo keystroke counterpart assumed. |
| 16 | Slot tie-break unreachable; empty pack reports full | Source checked: Mandos `src/item/deps.ts:borgSlot` preserves unreachable pval tie-break. Empty-pack issue is separate; direct handles may avoid it. Decision scenario pending. |
| 17 | Danger uses wrong resist/stat, sticky bolt state, wrong indices | Cold-melee acid-resistance read source checked in current C and Mandos `src/danger/danger.ts`. Split each other symptom; prioritize a normal combat/escape decision with independent resistances. |
| 18 | Stat modifiers tested as object flags | Lead; related item-analysis tracker #81, but prove exact valuation branch before deduplicating. |
| 19 | Item flows choose farthest stairs and track stale objects | Lead; split normal flow leash from optional munchkin/lunal-only defects. |
| 20 | Device division by zero, staff escape gates, rings, food | Source checked: Mandos `deviceFail` guards denominator zero and ring helpers scan both equipped rings; C crash/one-ring defect is not a Mandos crash. Mandos staff gates retain suspect conditions. CCW timing differs between old/new C and must be attributed by revision. |
| 21 | Backup swap chooses higher danger; best-equipment iteration | Lead; potential high impact, but swap subsystem incomplete here (#4). First prove C reachable scenario and compare implemented Neo paths. |
| 22 | Panel-relative light beams; refuel checks only last lantern | Lead; distinguish C panel UI from panel-free Neo. Last-lantern selection may share §16; demonstrate failing refuel before filing. |
| 23 | Curse removal types wrong menu letters | Lead; separate C prompt behavior from direct-command port, validate normal inventory/quiver arrangement. |
| 24 | Monster tracking indices, sticky skip, wrong scoot monster | Lead; high-impact candidate set. Recent Neo tracking cleanup must be reviewed before filing duplicates. |
| 25 | Enchant prompt selects wrong inventory context | Lead; C prompt/input issue, no direct-command Neo defect presumed. |
| 26 | Recovery notes, duplicate cure, unchecked rod slot | Lead; guard reachability by real item-count consistency before calling the slot read a crash. |
| 27 | Level-scaled no-rest timer overflows int16 at level 33 | Source checked: Mandos stores JavaScript numbers, so the C signed-width overflow is not reproduced by that assignment. C gameplay scenario pending. |
| 28 | Regeneration casts while scoring; wrong Venom cost | Source checked: Mandos `auxRegen` already returns before casting in simulation; `auxVenom` still reads Smite Evil cost. Split symptoms; do not port C's missing simulation guard back into Neo. |
| 29 | Sea-of-Runes terrain, counters and bounds | Lead; high-impact counter-underflow candidate needs legal glyph attempt/message sequence. Related stub tracker #80 is not proof of this bug. |
| 30 | Munchkin attack flags leak | Lead; optional mode, compare reset ownership and post-return danger decision. |
| 31 | Exploration chooses farthest stairs; trap/deletion quirks | Lead; shared farthest-stair symptom with §19; deduplicate by cause and affected callers. |
| 32 | Shop/door-flow predicates, bounds and dead cleanup | Lead; require reachable edge/door state. Catalogue's dead local event/double-free-after-NULL are not proven crashes. |
| 33 | Home trial charges, wrong ego lookup, recent transaction lists | Lead; potential real selling/stashing mistakes. Compare Neo's new inventory/value corrections first; require actual changed transaction. |

## First priorities

1. Adopt verified Neo follow-up corrections to our already-carried fixes.
   These are actionable port defects with maintainer review and tests.
2. #94: map-dump cancellation/file failure, exact C game and C Borg,
   corrected and successful-write controls. A crash is explainable without
   claiming a stronger player or a saved life.
3. #95: legal paralysis/knockout then recovery and a subsequent combat
   reaction. Source mismatch alone does not prove the resulting decision.
4. Cold danger, staff escape, swap choice and monster-index leads: first
   normal-rule decision-changing scenarios, then individually scoped issues.
5. Formula diagnostics, colors, duplicate harmless operations and dead
   branches remain below live gameplay defects.

## Upstream movement

Neo closed our original PRs after taking their commits through successor
PRs, preserving authorship. A closed original PR with `merged=false` does
not mean rejection. Read the maintainer's explanation and successor source.

| Mandos tracker | Original mod PR → successor | Follow-up to inspect/adopt |
| --- | --- | --- |
| #69 | #38 → #42 | Original fix unchanged. |
| #68 | #39 → #43 | Comment corrections. |
| #49 | #24 → #45 | Purge clears grid pointers and pursuit goals. |
| #44 | #22 → #46 | Position ring records once per decision; no store entries. |
| #59 | #32 → #47 | Trap/door activation item dependencies, controller tests. |
| #55, #57 | #26, #28 → #48 | Original fixes unchanged; broader production-view tests. |
| #64 | #34 → #49 | Shared class-book kinds; test-cast prompt arguments. |
| #65 | #36 → #51 | Published affliction grades, not hidden per-turn countdowns. |
| #58 | #30 → #52 | Town guard skips a unique, not every low-level town monster. |
| #50 | #41 → #53 | Knowledge/value/quiver handling and discarded-decision state. |

Their master contains these changes at the pin above. This audit does not
claim Mandos has adopted the follow-ups or a released Neo version. Keep
existing carry labels for our original fixes and list follow-up gaps
separately. Do not remove engine patches on account of Borg PR closures.

The engine #431 maintainer also says #433 is being reviewed as a broader
core change and may need splitting. No split or public reply is implied by
this intake; retain our existing source and consumers while evaluating it.

## Posting and duplicate checks

Owner authorization on 2026-11-05 permits confirmed **Neo port-defect**
issues/PRs after the established source/reproduction/duplicate checks,
without another per-report permission question. **C posts still need explicit
approval of their internal evidence.** No C post was made in this pass. [#96](https://github.com/diegoami/mandos/issues/96)
owns adoption of the reviewed Neo follow-ups; the existing carry trackers
now list their successor PRs and distinguish original carry from additions.

Closed Angband Borg PRs #6779, #6776 and #6794 show brief descriptions tied
to one concrete effect. Use that concise style for a future approved PR,
backed by our detailed internal report. Brevity is not evidence of an
exemption from our validation gate.

Initial broad C issue/PR searches cover “borg resistance” and “borg crash”,
both open and closed. Hits #6362 (base-game charge-combination divide by
zero) and PR #5934 (map trait dump array overflow) have different causes
from the current candidates; they are not proof that no exact duplicate
exists. Individual candidate-specific searches and review remain necessary.
