# C Borg bugs and candidates

This is our maintained catalogue, not an upstream C maintenance commitment. **No submissions to angband/angband.** Proposed fixes stay in our repositories; an owner may later choose to share the list.

Updated 2026-11-05. Credit: [borg-rs catalogue](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md), plus our independent source/scenario checks. Current refresh [#110](https://github.com/diegoami/mandos/issues/110), carry queue [#111](https://github.com/diegoami/mandos/issues/111), broader audit [#93](https://github.com/diegoami/mandos/issues/93).

The source has **36 numbered groups**. There are **20 separately tracked C findings** here: 1 native C-game outcome reproduction, 1 C-game flag-only reproduction, and 18 source checks. Other symptoms in the group inventory remain intake leads. These counts are not a count of confirmed gameplay defects.

Groups 1–35 are unchanged from the prior pin. Group36 adds two shop-choice symptoms; urgent-goal loss is a source-checked shared candidate, while the repeated town predicate is redundant code with no independent gameplay effect.

A source check establishes code/predicate/state flow, not legal reachability or a changed outcome. Priority ranks validation work. Harmless/dead branches and unproven stacked-ring reachability are explicitly kept below demonstrated failures.

## Reference pins

- C: `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`. The imported 4.2.6 snapshot is a different reference.
- Neo Borg: `74a017d2f695939eb2f046b7c9ff286ef1e82568`.
- Mandos runtime source checked: `48405e9621ffc400f7af43e7fd1ed2385225ca1f`.
- Rust source: `ecc23aad8970eac4d1932f892a0c17c207d89710`; prior `6fb471179e28224ac3259434c768afaff0a367ae`.

## Local fix workflow

C-source PRs target **diegoami/neo-angband:c-borg-reference** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. Local PRs may remain drafts and never need to be submitted upstream.

Current implementation priority: carry validated fixes from both C and Neo in each applicable consumer (tracking [#111](https://github.com/diegoami/mandos/issues/111)). A draft or an absent counterpart does not count as an applied fix.

A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.

## Classified findings

| ID | Finding | Priority | Evidence | Pinned references | Neo/Mandos | Fix proposal | Carry | Tracker |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [CBUG-0001](#cbug-0001) | Cancelling a map dump dereferences a NULL file | high | c game reproduced | [C src/borg/borg-log.c:190–204](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L190-L204) | no corresponding port path | [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — draft, c-game-reproduced | not carried | [#94](https://github.com/diegoami/mandos/issues/94) |
| [CBUG-0002](#cbug-0002) | Paralysis/knockout message suppression resets a different variable | high | source checked | [C src/borg/borg.c:310–314](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg.c#L310-L314) | C only; different port pipeline | none | not carried | [#95](https://github.com/diegoami/mandos/issues/95) |
| [CBUG-0003](#cbug-0003) | West radius-two shoulder grids are omitted | med | c game flags only | [C src/borg/borg-cave-light.c:135–143](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L135-L143)<br>[Neo src/perceive.ts:285–290](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/perceive.ts#L285-L290)<br>[Mandos src/perceive.ts:288–293](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/perceive.ts#L288-L293) | present in both | [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — draft, impact-unproven | not carried | [#87](https://github.com/diegoami/mandos/issues/87) |
| [CBUG-0004](#cbug-0004) | Cold melee uses temporary acid resistance | high | source checked | [C src/borg/borg-danger.c:262–276](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L262-L276)<br>[Neo src/danger/danger.ts:206–219](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/danger/danger.ts#L206-L219)<br>[Mandos src/danger/danger.ts:209–222](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/danger/danger.ts#L209-L222) | present in both | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0005](#cbug-0005) | Black Market Teleport Other rod class exception is reversed | high | source checked | [C src/borg/borg-store-buy.c:127–133](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L127-L133)<br>[Neo src/store/buy.ts:189–193](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L189-L193)<br>[Mandos src/store/buy.ts:189–193](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L189-L193) | present in both | none | not carried | [#103](https://github.com/diegoami/mandos/issues/103) |
| [CBUG-0006](#cbug-0006) | Starvation shopping exception admits unrelated scrolls/subtypes | high | source checked | [C src/borg/borg-store-buy.c:281–288](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L281-L288)<br>[Neo src/store/buy.ts:294–303](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L294-L303)<br>[Mandos src/store/buy.ts:294–303](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L294-L303) | present in both | none | not carried | [#104](https://github.com/diegoami/mandos/issues/104) |
| [CBUG-0007](#cbug-0007) | Home trial early exits leave reduced quantities/charges | med | source checked | [C src/borg/borg-store-buy.c:501–523](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L501-L523)<br>[Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387)<br>[Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) | C only; port uses value simulation | none | not carried | [#105](https://github.com/diegoami/mandos/issues/105) |
| [CBUG-0008](#cbug-0008) | Ring-side scores persist across home wares | med | source checked | [C src/borg/borg-store-buy.c:455–475](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L455-L475)<br>[Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387)<br>[Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) | C only; different ring trial | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0009](#cbug-0009) | Home ring trials use asymmetric quantities | low | source checked | [C src/borg/borg-store-buy.c:535–539](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L535-L539)<br>[Neo src/store/buy.ts:371–376](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L371-L376)<br>[Mandos src/store/buy.ts:371–376](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L371-L376) | C only; different ring trial | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0010](#cbug-0010) | Home grab skip flag leaks to later wares | med | source checked | [C src/borg/borg-store-buy.c:859–896](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L859-L896)<br>[Neo src/store/buy.ts:494–510](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L494-L510)<br>[Mandos src/store/buy.ts:494–510](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L494-L510) | C only; port resets per ware | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0011](#cbug-0011) | No-hole swap exit leaves valuation changed | med | source checked | [C src/borg/borg-store-buy.c:972–983](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L972-L983)<br>[Neo src/store/buy.ts:548–551](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L548-L551)<br>[Mandos src/store/buy.ts:548–551](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L548-L551) | port subsystem missing | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0012](#cbug-0012) | Swap trials overwrite the tracked swap inventory slot | med | source checked | [C src/borg/borg-store-buy.c:1002–1026](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1002-L1026)<br>[Neo src/store/buy.ts:543–571](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L543-L571)<br>[Mandos src/store/buy.ts:543–571](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L543-L571) | port subsystem missing | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0013](#cbug-0013) | Latest purchase/sale is outside the history reader range | med | source checked | [C src/borg/borg-store-buy.c:1226–1233](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1233)<br>[Neo src/store/store.ts:151–154](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L151-L154)<br>[Mandos src/store/store.ts:154–157](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L154-L157) | present in both | none | not carried | [#106](https://github.com/diegoami/mandos/issues/106) |
| [CBUG-0014](#cbug-0014) | Ten-entry transaction arrays never use the tenth slot | low | source checked | [C src/borg/borg-store-buy.c:1226–1228](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1228)<br>[Neo src/store/store.ts:147–155](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L147-L155)<br>[Mandos src/store/store.ts:150–158](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L150-L158) | present in both | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0015](#cbug-0015) | Critical escape returns with pretend full mana | med | source checked | [C src/borg/borg-escape.c:780–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L780-L835)<br>[Neo src/fight/escape.ts:533–563](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L533-L563)<br>[Mandos src/fight/escape.ts:536–566](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L536-L566) | C only; no pretend-mana mutation | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0016](#cbug-0016) | Stair predicate queues a climb before phase guards finish | high | source checked | [C src/borg/borg-escape.c:521–537](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L521-L537)<br>[Neo src/fight/escape.ts:618–632](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L618-L632)<br>[Mandos src/fight/escape.ts:621–635](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L621-L635) | different port defect | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0017](#cbug-0017) | Guarded anti-summon timer reset is unreachable | low | source checked | [C src/borg/borg-escape.c:879–889](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L879-L889)<br>[Neo src/fight/escape.ts:435–437](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L435-L437)<br>[Mandos src/fight/escape.ts:438–440](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L438-L440) | same guarded condition | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |
| [CBUG-0018](#cbug-0018) | Dimension Door destination lacks legality/range filters | high | source checked | [C src/borg/borg-escape.c:569–621](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L569-L621)<br>[Neo src/fight/escape.ts:317–342](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L317-L342)<br>[Mandos src/fight/escape.ts:320–345](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L320-L345) | partly shared | none | not carried | [#107](https://github.com/diegoami/mandos/issues/107) |
| [CBUG-0019](#cbug-0019) | Urgent shop goal is overwritten or paired with stale ware | high | source checked | [C src/borg/borg-think-store.c:105–157](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L105-L157)<br>[Neo src/store/think-store.ts:70–118](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L70-L118)<br>[Mandos src/store/think-store.ts:73–121](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L73-L121) | present in both | none | not carried | [#112](https://github.com/diegoami/mandos/issues/112) |
| [CBUG-0020](#cbug-0020) | Money-scumming repeats an already-satisfied town predicate | low | source checked | [C src/borg/borg-think-store.c:90–94](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L90-L94)<br>[Neo src/store/think-store.ts:60–63](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L60-L63)<br>[Mandos src/store/think-store.ts:63–66](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L63-L66) | present in both | none | not carried | carry queue [#111](https://github.com/diegoami/mandos/issues/111) |

### CBUG-0001

**Cancelling a map dump dereferences a NULL file** — local proposal; not carried.

Checked 2026-11-05; borg-rs group(s) 13.

Pinned source references:

- [C src/borg/borg-log.c:190–204](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L190-L204) — if (ask && get_string
- [C src/borg/borg-log.c:666–668](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L666-L668) — file_close(borg_map_file);
- [borg-rs docs/c-bugs.md:167–181](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L167-L181) — discovery group 13

Escape at the map filename prompt crashes the C game (SIGSEGV); the guard returns safely. No lost-progress claim.

59 C Borg units, no Rust Borg linked; direct function diagnostic in a normally born C game. Top-level Ctrl-Z dispatch and failed-open branch were not separately runtime-tested.

Evidence: **c game reproduced**. [Reproduction report](audit/c-reports/B94/README.md). Neo/Mandos: **no corresponding port path**.

Fix proposal: [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — draft, c-game-reproduced. Tracker: [#94](https://github.com/diegoami/mandos/issues/94).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0002

**Paralysis/knockout message suppression resets a different variable** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 14.

Pinned source references:

- [C src/borg/borg.c:310–314](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg.c#L310-L314) — borg.dont_react = false;
- [C src/borg/borg-messages-react.c:45–49](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages-react.c#L45-L49) — if (borg_dont_react
- [C src/borg/borg-messages.c:439–448](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages.c#L439-L448) — borg_dont_react = true;
- [borg-rs docs/c-bugs.md:182–198](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L182-L198) — discovery group 14

C reactions can remain suppressed after recovery; no actual later death/decision change observed.

Older imported C resets the global correctly. This is a newer C regression, not a Neo omission.

Evidence: **source checked**. Neo/Mandos: **C only; different port pipeline**.

Fix proposal: none. Tracker: [#95](https://github.com/diegoami/mandos/issues/95).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0003

**West radius-two shoulder grids are omitted** — held impact; not carried.

Checked 2026-11-05; borg-rs group(s) 4.

Pinned source references:

- [C src/borg/borg-cave-light.c:135–143](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L135-L143) — /* West of the player */
- [Neo src/perceive.ts:285–290](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/perceive.ts#L285-L290) — if (floorAt(cy, cx - 2))
- [Mandos src/perceive.ts:288–293](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/perceive.ts#L288-L293) — if (floorAt(cy, cx - 2))
- [borg-rs docs/c-bugs.md:41–54](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L41-L54) — discovery group 4

Native C marks 19 distinct grids versus 21 after correction; no meaningful gameplay outcome established.

Duplicate light-list entries are a separate symptom; avoid claiming two missing flags saved a life.

Evidence: **c game flags only**. [Related evidence](https://github.com/diegoami/mandos/issues/89). Neo/Mandos: **present in both**.

Fix proposal: [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — draft, impact-unproven. Tracker: [#87](https://github.com/diegoami/mandos/issues/87).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0004

**Cold melee uses temporary acid resistance** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:262–276](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L262-L276) — case MONBLOW_COLD:
- [Neo src/danger/danger.ts:206–219](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/danger/danger.ts#L206-L219) — case MONBLOW.COLD:
- [Mandos src/danger/danger.ts:209–222](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/danger/danger.ts#L209-L222) — case MONBLOW.COLD:
- [borg-rs docs/c-bugs.md:226–260](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L226-L260) — discovery group 17

Can misestimate a cold blow when only one temporary resistance is active; real changed combat choice pending.

Independent of the other danger slips in the same Rust group.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0005

**Black Market Teleport Other rod class exception is reversed** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:127–133](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L127-L133) — && borg.trait[BI_CLASS] == CLASS_ROGUE)
- [Neo src/store/buy.ts:189–193](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L189-L193) — item.sval === Ro.teleport_other
- [Mandos src/store/buy.ts:189–193](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L189-L193) — item.sval === Ro.teleport_other
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

A useful escape device can be rejected for the wrong class; real purchase/survival effect pending.

Both current C and src/store/buy.ts use !=MAGE && ==ROGUE.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#103](https://github.com/diegoami/mandos/issues/103).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0006

**Starvation shopping exception admits unrelated scrolls/subtypes** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:281–288](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L281-L288) — /* Special check for 'immediate shopping' */
- [Neo src/store/buy.ts:294–303](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L294-L303) — /* immediate-shopping food gate
- [Mandos src/store/buy.ts:294–303](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L294-L303) — /* immediate-shopping food gate
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

A starving character can consider unrelated supplies; no observed starvation or loss of gold proved.

Both C and src/store/buy.ts use the conjunction that exempts every scroll and any matching numeric sval.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#104](https://github.com/diegoami/mandos/issues/104).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0007

**Home trial early exits leave reduced quantities/charges** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:501–523](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L501-L523) — borg_shops[BORG_HOME].ware[n].iqty -= qty;
- [Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

Later C trials can see a modified home snapshot; real item loss is not claimed.

C decrements before the two-empty-slot continue. TS BuySim path does not mutate those wares.

Evidence: **source checked**. Neo/Mandos: **C only; port uses value simulation**.

Fix proposal: none. Tracker: [#105](https://github.com/diegoami/mandos/issues/105).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0008

**Ring-side scores persist across home wares** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:455–475](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L455-L475) — int32_t p_left
- [C src/borg/borg-store-buy.c:542–548](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L542-L548) — p_left = borg_power();
- [Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

C can compare a ring using an earlier ware's score when the other slot holds the One Ring.

p_left/p_right declared outside the loop; current TS helper has no corresponding accumulators. Broader ring parity is independent.

Evidence: **source checked**. Neo/Mandos: **C only; different ring trial**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0009

**Home ring trials use asymmetric quantities** — review only; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:535–539](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L535-L539) — borg_items[slot].iqty = 1;
- [C src/borg/borg-store-buy.c:567–571](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L567-L571) — borg_items[INVEN_RIGHT].iqty = qty;
- [Neo src/store/buy.ts:371–376](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L371-L376) — const sim: BuySim
- [Mandos src/store/buy.ts:371–376](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L371-L376) — const sim: BuySim
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

Potential unequal left/right power trial; legal qty>1 ring reachability remains unproven.

Do not fabricate stacked-ring gameplay or call this a proven bad equip decision.

Evidence: **source checked**. Neo/Mandos: **C only; different ring trial**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0010

**Home grab skip flag leaks to later wares** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:859–896](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L859-L896) — skip_it = false;
- [Neo src/store/buy.ts:494–510](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L494-L510) — let skip = false;
- [Mandos src/store/buy.ts:494–510](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L494-L510) — let skip = false;
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

Once one recently sold ware is skipped, later C wares may be skipped too.

TS src/store/buy.ts declares let skip=false inside each ware loop.

Evidence: **source checked**. Neo/Mandos: **C only; port resets per ware**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0011

**No-hole swap exit leaves valuation changed** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:972–983](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L972-L983) — = -1L;
- [C src/borg/borg-store-buy.c:1088–1099](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1088-L1099) — = -1L;
- [Neo src/store/buy.ts:548–551](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L548-L551) — const evalFn
- [Mandos src/store/buy.ts:548–551](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L548-L551) — const evalFn
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

C returns with swap value -1 instead of restoring it; next real decision impact unproven.

TS returns through an optional evaluation seam and has no corresponding global mutation. #4 missing swap functionality is a separate port gap.

Evidence: **source checked**. Neo/Mandos: **port subsystem missing**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0012

**Swap trials overwrite the tracked swap inventory slot** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:1002–1026](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1002-L1026) — memcpy(&borg_items[hole]
- [C src/borg/borg-store-buy.c:1112–1136](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1112-L1136) — memcpy(&borg_items[hole]
- [Neo src/store/buy.ts:543–571](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L543-L571) — borgThinkHomeBuySwap
- [Mandos src/store/buy.ts:543–571](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L543-L571) — borgThinkHomeBuySwap
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

C's model can lose its old swap item until inventory refresh; no actual game item destruction claimed.

The TS evaluator does not copy candidates over a mutable C inventory array.

Evidence: **source checked**. Neo/Mandos: **port subsystem missing**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0013

**Latest purchase/sale is outside the history reader range** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 33, 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:1226–1233](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1233) — bought_item_nxt++;
- [C src/borg/borg-store-sell.c:1128–1135](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L1128-L1135) — sold_item_nxt++;
- [C src/borg/borg-store-buy.c:171–176](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L171-L176) — p < sold_item_num
- [C src/borg/borg-store-sell.c:349–354](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L349-L354) — p < bought_item_num
- [Neo src/store/store.ts:151–154](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L151-L154) — mem.boughtNum =
- [Mandos src/store/store.ts:154–157](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L154-L157) — mem.boughtNum =
- [Neo src/store/store.ts:136–139](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L136-L139) — mem.soldNum =
- [Mandos src/store/store.ts:139–142](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L139-L142) — mem.soldNum =
- [Neo src/store/sell.ts:410–414](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/sell.ts#L410-L414) — i < mem.boughtNum
- [Mandos src/store/sell.ts:410–414](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/sell.ts#L410-L414) — i < mem.boughtNum
- [Neo src/store/buy.ts:362–366](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L362-L366) — i < mem.soldNum
- [Mandos src/store/buy.ts:362–366](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L362-L366) — i < mem.soldNum
- [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L578-L606) — discovery group 33
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

Immediate buy-back/resale suppression can miss the newest record; full transaction scenario pending.

Writers store a last index, readers scan p<num. Group34's purchase half shares the cause already reported in33; one catalogue entry.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#106](https://github.com/diegoami/mandos/issues/106).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0014

**Ten-entry transaction arrays never use the tenth slot** — review only; not carried.

Checked 2026-11-05; borg-rs group(s) 33, 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:1226–1228](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1228) — if (bought_item_nxt >= 9)
- [C src/borg/borg-store-sell.c:1128–1130](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L1128-L1130) — if (sold_item_nxt >= 9)
- [Neo src/store/store.ts:147–155](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L147-L155) — if (mem.boughtNxt >= 9)
- [Mandos src/store/store.ts:150–158](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L150-L158) — if (mem.boughtNxt >= 9)
- [Neo src/store/store.ts:132–140](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L132-L140) — if (mem.soldNxt >= 9)
- [Mandos src/store/store.ts:135–143](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L135-L143) — if (mem.soldNxt >= 9)
- [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L578-L606) — discovery group 33
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) — discovery group 34

History capacity is nine rather than ten; whether this is intentional or harmful remains unproven.

Keep this separate from the latest-entry omission; do not inflate it into a gameplay failure.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0015

**Critical escape returns with pretend full mana** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:780–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L780-L835) — borg.trait[BI_CURSP] = borg.trait[BI_MAXSP];
- [Neo src/fight/escape.ts:533–563](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L533-L563) — /* critical emergency attempts
- [Mandos src/fight/escape.ts:536–566](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L536-L566) — /* critical emergency attempts
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666) — discovery group 35

C trait state retains MAXSP until notice refresh after a successful critical attempt; later bad choice unproven.

TS never assigns pretend full mana here. Its over-exertion parity is a separate question, not this leak.

Evidence: **source checked**. Neo/Mandos: **C only; no pretend-mana mutation**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0016

**Stair predicate queues a climb before phase guards finish** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:521–537](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L521-L537) — borg_escape_stair
- [C src/borg/borg-escape.c:905–920](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L905-L920) — (borg_escape_stair() \|\| borg_caution_phase(25
- [Neo src/fight/escape.ts:618–632](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L618-L632) — (borgEscapeStair(ctx) \|\| borgCautionPhase(ctx, 25
- [Mandos src/fight/escape.ts:621–635](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L621-L635) — (borgEscapeStair(ctx) \|\| borgCautionPhase(ctx, 25
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666) — discovery group 35

C may leave climb keys queued or queue both climb and phase while applying phase bookkeeping.

TS returns commands rather than queuing keys: a stair AgentCommand used as a boolean is discarded. See PORT-0001; this is not the same faithful C queue symptom.

Evidence: **source checked**. Neo/Mandos: **different port defect**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0017

**Guarded anti-summon timer reset is unreachable** — review only; not carried.

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:879–889](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L879-L889) — borg_caution_phase(50, 2)
- [Neo src/fight/escape.ts:435–437](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L435-L437) — resetAntisummon
- [Mandos src/fight/escape.ts:438–440](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L438-L440) — resetAntisummon
- [Neo src/fight/escape.ts:597–612](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L597-L612) — borgCautionPhase(ctx, 50, 2)
- [Mandos src/fight/escape.ts:600–615](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L600-L615) — borgCautionPhase(ctx, 50, 2)
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666) — discovery group 35

A >50 guarded branch cannot execute its nested <50 reset; practical need for that reset unproven.

TS resetAntisummon applies the same <50 test in those branches. Other call sites can still reset it.

Evidence: **source checked**. Neo/Mandos: **same guarded condition**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0018

**Dimension Door destination lacks legality/range filters** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:569–621](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L569-L621) — borg_dimension_door
- [Neo src/fight/escape.ts:317–342](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L317-L342) — borgDimensionDoor
- [Mandos src/fight/escape.ts:320–345](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L320-L345) — borgDimensionDoor
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666) — discovery group 35

An emergency target can be a rejected destination; actual engine outcome still needs a legal scenario.

C also ignores borg_spell's result; TS returns it. Missing floor/occupancy/range selection guards are shared.

Evidence: **source checked**. Neo/Mandos: **partly shared**.

Fix proposal: none. Tracker: [#107](https://github.com/diegoami/mandos/issues/107).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0019

**Urgent shop goal is overwritten or paired with stale ware** — investigate; not carried.

Checked 2026-11-05; borg-rs group(s) 36.

Pinned source references:

- [C src/borg/borg-think-store.c:105–157](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L105-L157) — /* If poisoned or bleeding
- [Neo src/store/think-store.ts:70–118](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L70-L118) — /* If poisoned or bleeding
- [Mandos src/store/think-store.ts:73–121](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L73-L121) — /* If poisoned or bleeding
- [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L667-L681) — discovery group 36

A poisoned, bleeding or hungry character can select another shop or a ware from an earlier goal; actual game transaction outcome pending.

Forced shop assignment is followed by helpers that ignore that forced shop and by unconditional goal reset. A stale ware can instead make the second already-flowing test accept the forced shop.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#112](https://github.com/diegoami/mandos/issues/112).

Next: Validate a legal normal-rule scene and negative controls before calling a gameplay correction carried.

### CBUG-0020

**Money-scumming repeats an already-satisfied town predicate** — review only; not carried.

Checked 2026-11-05; borg-rs group(s) 36.

Pinned source references:

- [C src/borg/borg-think-store.c:90–94](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L90-L94) — /* Must be in town */
- [C src/borg/borg-think-store.c:164–168](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L164-L168) — !borg.trait[BI_CDEPTH]
- [Neo src/store/think-store.ts:60–63](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L60-L63) — /* Must be in town
- [Mandos src/store/think-store.ts:63–66](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L63-L66) — /* Must be in town
- [Neo src/store/think-store.ts:113–117](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L113-L117) — !st(ctx, BI.CDEPTH)
- [Mandos src/store/think-store.ts:116–120](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L116-L120) — !st(ctx, BI.CDEPTH)
- [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L667-L681) — discovery group 36

No independent behavior effect established; the duplicate depth test is redundant.

The function has already returned when CDEPTH is nonzero. Removing the duplicate test alone is cleanup, not a demonstrated gameplay correction.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: carry queue [#111](https://github.com/diegoami/mandos/issues/111).

Next: Validate a legal normal-rule scene and negative controls before calling a gameplay correction carried.

## Related port leads

- **PORT-0001**: Returned stair command discarded inside phase predicates; related CBUG-0016; [#108](https://github.com/diegoami/mandos/issues/108). Classify and reproduce independently before any Neo port report; no C submission.
  - [C src/borg/borg-escape.c:521–537](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L521-L537)
  - [C src/borg/borg-escape.c:905–920](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L905-L920)
  - [Neo src/fight/escape.ts:618–632](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L618-L632)
  - [Mandos src/fight/escape.ts:621–635](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L621-L635)
  - [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666)

## Complete source-group inventory

This covers all 36 source groups. A group can contain several unrelated causes; a linked finding does not validate its other symptoms.

| Group | Source reference | Area | Intake / latest note | Detailed IDs |
| --- | --- | --- | --- | --- |
| 1 | [borg-rs docs/c-bugs.md:8–22](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L8-L22) | banishment | Activation reads object counts as HP. source comparison: C uses has[BI_CURHP]; Mandos already uses the HP trait | intake only |
| 2 | [borg-rs docs/c-bugs.md:23–31](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L23-L31) | item-ids | Subtype lookup names copied incorrectly. lookup/registration audit pending | intake only |
| 3 | [borg-rs docs/c-bugs.md:32–40](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L32-L40) | formulas | Malformed formula block ordering. configuration-only lead; valid-input impact unproven | intake only |
| 4 | [borg-rs docs/c-bugs.md:41–54](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L41-L54) | light | West shoulders omitted and light-list duplicates. west-light existing #87/#89; flags reproduced, practical impact pending | CBUG-0003 |
| 5 | [borg-rs docs/c-bugs.md:55–69](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L55-L69) | magic | Initial spell status and book iteration. catalogue notes effective guards; no independent play defect established | intake only |
| 6 | [borg-rs docs/c-bugs.md:70–88](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L70-L88) | formulas | Formula errors overwritten by static formatting buffer. diagnostic lead; large-input memory behavior needs reachability proof | intake only |
| 7 | [borg-rs docs/c-bugs.md:89–95](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L89-L95) | formulas | range() errors misleading or silent. configuration-diagnostic lead | intake only |
| 8 | [borg-rs docs/c-bugs.md:96–108](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L96-L108) | home | Spell-stat score discontinuity and dead neck branch. needs an actual keep/retrieve/equip consequence | intake only |
| 9 | [borg-rs docs/c-bugs.md:109–119](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L109-L119) | magic | Dark flag tested by equality. still present in magic-play.ts; interaction with no-light guards needs scenario | intake only |
| 10 | [borg-rs docs/c-bugs.md:120–140](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L120-L140) | preparedness | Dead or mislabelled readiness checks. separate diagnostic text from reachable policy behavior | intake only |
| 11 | [borg-rs docs/c-bugs.md:141–153](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L141-L153) | birth-ui | Respawn menu letters. C UI lead; Neo uses direct birth commands | intake only |
| 12 | [borg-rs docs/c-bugs.md:154–166](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L154-L166) | home | All item sustains counted as STR; banishment counts missing. sustain bug still visible in Mandos home.ts; transaction consequence pending | intake only |
| 13 | [borg-rs docs/c-bugs.md:167–181](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L167-L181) | diagnostics | Map-dump NULL-file crash plus display slips. map cancellation C-game reproduced; other slips separate | CBUG-0001 |
| 14 | [borg-rs docs/c-bugs.md:182–198](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L182-L198) | messages | Reaction suppression reset uses wrong variable. current C mismatch; old imported C resets global correctly | CBUG-0002 |
| 15 | [borg-rs docs/c-bugs.md:199–211](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L199-L211) | item-ui | Debug quiver inscriptions use equipment keys. C debug-key path; no direct Neo counterpart assumed | intake only |
| 16 | [borg-rs docs/c-bugs.md:212–225](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L212-L225) | inventory | Unreachable pval tie-break and empty-pack lookup. pval condition preserved; empty-pack symptom must be classified separately | intake only |
| 17 | [borg-rs docs/c-bugs.md:226–260](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L226-L260) | danger | Resistance/stat/bolt-state/index errors. cold-vs-acid source checked; other compound symptoms remain leads | CBUG-0004 |
| 18 | [borg-rs docs/c-bugs.md:261–273](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L261-L273) | valuation | Stat bonuses tested as flags. current Neo perItemValue explicitly preserves C's sustain-flag mixup | intake only |
| 19 | [borg-rs docs/c-bugs.md:274–300](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L274-L300) | flow | Farthest stairs and item tracking slips. normal flow and optional-mode symptoms must be separated | intake only |
| 20 | [borg-rs docs/c-bugs.md:301–324](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L301-L324) | items | Device fail math, staff/ring/food use. TS division guard and both-ring scan differ; staff gates still suspect | intake only |
| 21 | [borg-rs docs/c-bugs.md:325–354](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L325-L354) | equipment | Swap chooses higher danger; best-search bookkeeping. C/port comparison needed after B99 ring/home adoption; #4 remains partly absent | intake only |
| 22 | [borg-rs docs/c-bugs.md:355–374](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L355-L374) | light | Panel-relative beams and last-lantern refuel. panel UI differs; current TS refuel still starts at borgSlot's selected lantern | intake only |
| 23 | [borg-rs docs/c-bugs.md:375–390](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L375-L390) | item-ui | Curse-removal item letters. C menu path; direct-command port applicability unproven | intake only |
| 24 | [borg-rs docs/c-bugs.md:391–424](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L391-L424) | tracking | Wrong monster indices, sticky state and pursuit checks. multiple candidates; compare with B99 deletion/history fixes | intake only |
| 25 | [borg-rs docs/c-bugs.md:425–440](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L425-L440) | item-ui | Enchant prompt inventory context. C menu-selection lead; no direct-command bug inferred | intake only |
| 26 | [borg-rs docs/c-bugs.md:441–454](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L441-L454) | recovery | Recovery note, duplicate cure and unchecked rod slot. split harmless note/duplicate from reachable missing-rod access | intake only |
| 27 | [borg-rs docs/c-bugs.md:455–469](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L455-L469) | timers | No-rest int16 overflow from level 33. C narrow-integer effect is absent from the JS number assignment | intake only |
| 28 | [borg-rs docs/c-bugs.md:470–490](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L470-L490) | buffs | Regeneration simulation side effect and wrong Venom cost. TS guards regen simulation already; Venom cost still references Smite Evil | intake only |
| 29 | [borg-rs docs/c-bugs.md:491–512](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L491-L512) | glyphs | Terrain, counters and array bounds in glyph flow. legal message/state sequence needed before claiming reachable memory failure | intake only |
| 30 | [borg-rs docs/c-bugs.md:513–529](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L513-L529) | optional-mode | Munchkin attack/simulation flags leak. optional-mode lead; not ordinary-mode proof | intake only |
| 31 | [borg-rs docs/c-bugs.md:530–550](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L530-L550) | exploration | Farthest stairs, trap interest and forgotten danger marks. stair cause overlaps group19; split remaining symptoms | intake only |
| 32 | [borg-rs docs/c-bugs.md:551–577](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L551-L577) | flow | Shop/door predicates, bounds and dead cleanup. legal border/door scenarios needed; dead no-op is not a crash proof | intake only |
| 33 | [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L578-L606) | selling | Trial charges, wrong ego and transaction history. history counter shared with34; other symptoms need separate verification | CBUG-0013, CBUG-0014 |
| 34 | [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L607-L641) | shopping | Purchase filters, home trial state and history. ten symptoms classified below; no new native C scenario claimed | CBUG-0005, CBUG-0006, CBUG-0007, CBUG-0008, CBUG-0009, CBUG-0010, CBUG-0011, CBUG-0012, CBUG-0013, CBUG-0014 |
| 35 | [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L642-L666) | escape | Emergency mana, queued stairs, timer and destination checks. four symptoms classified below; returned-command port has a distinct stair issue | CBUG-0015, CBUG-0016, CBUG-0017, CBUG-0018 |
| 36 | [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/ecc23aad8970eac4d1932f892a0c17c207d89710/docs/c-bugs.md#L667-L681) | shopping | Urgent shop goal/stale ware and redundant town guard. C and current port share the forced-goal flow; source checked, transaction scenario pending | CBUG-0019, CBUG-0020 |

## Maintenance

Canonical data: [c-bugs.json](c-bugs.json). Regenerate with `node tools/c-bugs.mjs --write`; verify with `node tools/c-bugs.mjs --check`. The tool is offline and never posts or applies a fix.

On a borg-rs/source update, compare pinned content (including edits within existing groups), split independent causes, deduplicate shared callers, recheck C/Neo/Mandos separately and update checked dates. Revisit after a local proposal changes, a fix merges, a consumer adopts/reverts it, or an upstream reference changes. A new file or PR is not proof of application.

Keep local PR ownership/base/head and before/after/control receipts visible. Native C evidence is required before calling a C-game consequence reproduced. If impact is missing, keep the proposal explicitly unvalidated. Local-only C policy is in [RULES.md](../RULES.md), [process](process.md) and [UPSTREAM.md](UPSTREAM.md). No background poller or automatic submission is created.
