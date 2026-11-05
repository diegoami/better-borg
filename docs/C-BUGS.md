# C Borg bugs and candidates

[Findings](#classified-findings) · [Reuse a fix](#reusing-a-local-c-fix) · [Source inventory](#complete-source-group-inventory)

This is the C-only catalogue for eventual Angband community use. Port omissions stay on our internal issues. **We make no submissions to angband/angband now**; another developer may reuse our linked local proposals. Lead sources may be borg-rs, our own audits/runs or community reports, and validation attribution is kept separate.

Updated 2026-11-05. Credit: [borg-rs catalogue](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md), plus our independent source/scenario checks. Current refresh [#110](https://github.com/diegoami/mandos/issues/110), carry queue [#111](https://github.com/diegoami/mandos/issues/111), broader audit [#93](https://github.com/diegoami/mandos/issues/93).

The source has **36 numbered groups**. This page maps all **116 substantive leaf reports** to **118 C findings/observations**: 1 native C-game outcome reproduction, 1 flags-only reproduction, 18 source checks and 98 reported leads. Some reports contain related sub-symptoms; shared causes are deduplicated. These are not counts of independently confirmed gameplay bugs.

The latest borg-rs source has 36 numbered groups, unchanged from the prior content pin. Every substantive leaf report is now mapped to a finding instead of hiding most reports in a grouped intake summary. Reported observations remain distinct from independently checked defects.

A source check establishes code/predicate/state flow, not legal reachability or a changed outcome. Priority ranks validation work. Harmless/dead branches and unproven stacked-ring reachability are explicitly kept below demonstrated failures.

## Reference pins

These pins identify affected/reference code. Fix links identify correction proposals. Our internal issue labels and bodies are the source of truth for current carry/application status; this catalogue does not duplicate that live status.

- C: `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`. The imported 4.2.6 snapshot is a different reference.
- Neo Borg: `74a017d2f695939eb2f046b7c9ff286ef1e82568`.
- Mandos affected baseline inspected: `48405e9621ffc400f7af43e7fd1ed2385225ca1f`.
- Rust source: `590783e1f3bd26a4dc99cc60ca6b43131876f04b`; prior `ecc23aad8970eac4d1932f892a0c17c207d89710`.

## Local fix workflow

C-source PRs target **diegoami/neo-angband:c-borg-reference** at the pinned C revision. This is a C reference branch in our existing fork; its default Neo engine branch is separate. C proposals use c-proposal/postponed labels and may stay closed/unmerged while their commits, branches and patches remain reusable.

Current priority: board status first, then triage/catalogue maintenance, then Neo port fixes. With no actionable port bugs, complete the C local-proposal pass; carry validated C corrections in a second pass. Internal issues own current state.

## Reusing a local C fix

This section is for another Angband contributor who chooses to propose a correction. We are not making an upstream C submission. The PR, commit, branch and patch remain usable even when our local proposal is closed unmerged.

Example: [local C proposal #1](https://github.com/diegoami/neo-angband/pull/1), commit `540f621960e674d9fde227a175eeb1d27cc02132`, base `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`. It changes only `src/borg/borg-log.c`. GitHub identifies our fork's network source as angband/angband, although its immediate parent/default branch is Neo. Choose the C topic branch `pr/c-borg-map-dump-cancel`.

### Copy into your own Angband fork

Recheck current C and open/closed reports first: the correction may already exist. Start a clean topic branch from official C master in a clone of your own fork:

```sh
git clone https://github.com/YOUR_ACCOUNT/angband.git angband-fix
cd angband-fix
git remote add upstream https://github.com/angband/angband.git
git fetch upstream master
git switch -c fix/borg-map-dump upstream/master
```

Choose one copy method. Cherry-picking preserves the author and `-x` records the original commit:

```sh
git fetch https://github.com/diegoami/neo-angband.git refs/pull/1/head
git cherry-pick -x 540f621960e674d9fde227a175eeb1d27cc02132
git show --stat --oneline HEAD
```

Or download the immutable commit patch and apply it with commit metadata:

```sh
curl --fail --location \
  https://github.com/diegoami/neo-angband/commit/540f621960e674d9fde227a175eeb1d27cc02132.patch \
  --output B94-map-dump-cancel.patch
git am --3way B94-map-dump-cancel.patch
```

The commit URL is pinned; a PR-wide `.patch` can change when its branch changes. If application conflicts or is empty, inspect the current implementation before continuing. The normal abort commands are `git cherry-pick --abort` and `git am --abort`.

Build/test against the current C version using [Angband's compilation guide](https://github.com/angband/angband/blob/master/docs/hacking/compiling.rst), then rerun the [native scenario and controls](audit/c-reports/B94/README.md). Our [copy receipt](audit/c-reports/B94/reuse-receipt.json) verifies both methods reproduce the proposed source tree at the recorded base; it does not verify an arbitrary future upstream revision.

When satisfied, push your branch and create your own upstream PR:

```sh
git push -u origin fix/borg-map-dump
gh pr create --repo angband/angband --base master \
  --head YOUR_ACCOUNT:fix/borg-map-dump \
  --title 'Borg: return when map dumping has no file' \
  --body-file proposal.md
```

`proposal.md` should identify the observed effect, original commit/local proposal, source/testing pins and actual tests you ran. Preserve credit to the original author and discovery source. Link `diegoami/mandos#94` as a reference; use `Fixes` only for the actual issue you intend to close in the correct repository. There is no automatic PR transfer between repositories.

### Open a new PR directly from the existing C branch

An Angband organization member or someone with the required head-branch permissions can use [Compare across forks](https://github.com/angband/angband/compare):

1. Base repository: `angband/angband`; base branch: `master`.
2. Head fork: `diegoami/neo-angband`; compare branch: `pr/c-borg-map-dump-cancel`.
3. Review the resulting diff and create a new PR, linking our local proposal and evidence.

GitHub requires head/source write access or the applicable organization membership to open a public PR. A contributor without that access should use their own fork/branch through the copy workflow above. Opening a compare page alone submits nothing.

### Patch/report-only proposals

Some older proposals, such as [Mandos #88](https://github.com/diegoami/mandos/pull/88), contain a nested `patches/upstream-c/*.patch` and a report. For those, extract the actual C patch, inspect it, use `git apply --check` and then `git apply`, and create your own attributed commit. Cherry-picking the wrapper commit would add the report/patch file instead of applying its C hunks. That lighting proposal still lacks demonstrated practical impact.

### Make the upstream result discoverable

Please include the catalogue ID, original local proposal and internal tracker in the new upstream report/PR. Add the official `angband/angband#N` reference to our tracker when known. Our read-only watches then flag thread/head/source changes for review. A merge triggers adoption with our changes, rebuild and verification before a tracker becomes `fixed`; applied backports are removed only when their own consumer has adopted the replacement.

References: [Git cherry-pick](https://git-scm.com/docs/git-cherry-pick), [Git format-patch/git-am](https://git-scm.com/docs/git-format-patch), [GitHub fork PR permissions and steps](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork), [comparing forks](https://docs.github.com/en/pull-requests/how-tos/commit-changes/comparing-commits).


A proposal branch, a patch stored on main and a fix applied to a maintained consumer are different states. The C proposal does not automatically correct Neo/Mandos. Neo's C-parity policy still applies; an unmerged proposal in our fork is not an upstream C correction.

## Classified findings

| ID | Finding | Priority | Evidence | Pinned references | Neo/Mandos | Fix proposal | Internal issue (status) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [CBUG-0001](#cbug-0001) | Cancelling a map dump dereferences a NULL file | high | c game reproduced | [C src/borg/borg-log.c:190–204](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L190-L204) | no corresponding port path | [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — c-game-reproduced | [#94](https://github.com/diegoami/mandos/issues/94) |
| [CBUG-0002](#cbug-0002) | Paralysis/knockout message suppression resets a different variable | high | source checked | [C src/borg/borg.c:310–314](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg.c#L310-L314) | C only; different port pipeline | none | [#95](https://github.com/diegoami/mandos/issues/95) |
| [CBUG-0003](#cbug-0003) | West radius-two shoulder grids are omitted | med | c game flags only | [C src/borg/borg-cave-light.c:135–143](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L135-L143)<br>[Neo src/perceive.ts:285–290](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/perceive.ts#L285-L290)<br>[Mandos src/perceive.ts:288–293](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/perceive.ts#L288-L293) | present in both | [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — impact-unproven | [#87](https://github.com/diegoami/mandos/issues/87) |
| [CBUG-0004](#cbug-0004) | Cold melee uses temporary acid resistance | high | source checked | [C src/borg/borg-danger.c:262–276](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L262-L276)<br>[Neo src/danger/danger.ts:206–219](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/danger/danger.ts#L206-L219)<br>[Mandos src/danger/danger.ts:209–222](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/danger/danger.ts#L209-L222) | present in both | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0005](#cbug-0005) | Black Market Teleport Other rod class exception is reversed | high | source checked | [C src/borg/borg-store-buy.c:127–133](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L127-L133)<br>[Neo src/store/buy.ts:189–193](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L189-L193)<br>[Mandos src/store/buy.ts:189–193](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L189-L193) | present in both | none | [#103](https://github.com/diegoami/mandos/issues/103) |
| [CBUG-0006](#cbug-0006) | Starvation shopping exception admits unrelated scrolls/subtypes | high | source checked | [C src/borg/borg-store-buy.c:281–288](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L281-L288)<br>[Neo src/store/buy.ts:294–303](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L294-L303)<br>[Mandos src/store/buy.ts:294–303](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L294-L303) | present in both | none | [#104](https://github.com/diegoami/mandos/issues/104) |
| [CBUG-0007](#cbug-0007) | Home trial early exits leave reduced quantities/charges | med | source checked | [C src/borg/borg-store-buy.c:501–523](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L501-L523)<br>[Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387)<br>[Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) | C only; port uses value simulation | none | [#105](https://github.com/diegoami/mandos/issues/105) |
| [CBUG-0008](#cbug-0008) | Ring-side scores persist across home wares | med | source checked | [C src/borg/borg-store-buy.c:455–475](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L455-L475)<br>[Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387)<br>[Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) | C only; different ring trial | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0009](#cbug-0009) | Home ring trials use asymmetric quantities | low | source checked | [C src/borg/borg-store-buy.c:535–539](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L535-L539)<br>[Neo src/store/buy.ts:371–376](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L371-L376)<br>[Mandos src/store/buy.ts:371–376](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L371-L376) | C only; different ring trial | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0010](#cbug-0010) | Home grab skip flag leaks to later wares | med | source checked | [C src/borg/borg-store-buy.c:859–896](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L859-L896)<br>[Neo src/store/buy.ts:494–510](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L494-L510)<br>[Mandos src/store/buy.ts:494–510](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L494-L510) | C only; port resets per ware | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0011](#cbug-0011) | No-hole swap exit leaves valuation changed | med | source checked | [C src/borg/borg-store-buy.c:972–983](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L972-L983)<br>[Neo src/store/buy.ts:548–551](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L548-L551)<br>[Mandos src/store/buy.ts:548–551](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L548-L551) | port subsystem missing | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0012](#cbug-0012) | Swap trials overwrite the tracked swap inventory slot | med | source checked | [C src/borg/borg-store-buy.c:1002–1026](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1002-L1026)<br>[Neo src/store/buy.ts:543–571](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L543-L571)<br>[Mandos src/store/buy.ts:543–571](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L543-L571) | port subsystem missing | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0013](#cbug-0013) | Latest purchase/sale is outside the history reader range | med | source checked | [C src/borg/borg-store-buy.c:1226–1233](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1233)<br>[Neo src/store/store.ts:151–154](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L151-L154)<br>[Mandos src/store/store.ts:154–157](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L154-L157) | present in both | none | [#106](https://github.com/diegoami/mandos/issues/106) |
| [CBUG-0014](#cbug-0014) | Ten-entry transaction arrays never use the tenth slot | low | source checked | [C src/borg/borg-store-buy.c:1226–1228](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1228)<br>[Neo src/store/store.ts:147–155](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L147-L155)<br>[Mandos src/store/store.ts:150–158](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L150-L158) | present in both | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0015](#cbug-0015) | Critical escape returns with pretend full mana | med | source checked | [C src/borg/borg-escape.c:780–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L780-L835)<br>[Neo src/fight/escape.ts:533–563](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L533-L563)<br>[Mandos src/fight/escape.ts:536–566](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L536-L566) | C only; no pretend-mana mutation | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0016](#cbug-0016) | Stair predicate queues a climb before phase guards finish | high | source checked | [C src/borg/borg-escape.c:521–537](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L521-L537)<br>[Neo src/fight/escape.ts:618–632](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L618-L632)<br>[Mandos src/fight/escape.ts:621–635](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L621-L635) | different port defect | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0017](#cbug-0017) | Guarded anti-summon timer reset is unreachable | low | source checked | [C src/borg/borg-escape.c:879–889](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L879-L889)<br>[Neo src/fight/escape.ts:435–437](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L435-L437)<br>[Mandos src/fight/escape.ts:438–440](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L438-L440) | same guarded condition | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0018](#cbug-0018) | Dimension Door destination lacks legality/range filters | high | source checked | [C src/borg/borg-escape.c:569–621](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L569-L621)<br>[Neo src/fight/escape.ts:317–342](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L317-L342)<br>[Mandos src/fight/escape.ts:320–345](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L320-L345) | partly shared | none | [#107](https://github.com/diegoami/mandos/issues/107) |
| [CBUG-0019](#cbug-0019) | Urgent shop goal is overwritten or paired with stale ware | high | source checked | [C src/borg/borg-think-store.c:105–157](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L105-L157)<br>[Neo src/store/think-store.ts:70–118](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L70-L118)<br>[Mandos src/store/think-store.ts:73–121](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L73-L121) | present in both | none | [#112](https://github.com/diegoami/mandos/issues/112) |
| [CBUG-0020](#cbug-0020) | Money-scumming repeats an already-satisfied town predicate | low | source checked | [C src/borg/borg-think-store.c:90–94](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L90-L94)<br>[Neo src/store/think-store.ts:60–63](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L60-L63)<br>[Mandos src/store/think-store.ts:63–66](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L63-L66) | present in both | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0021](#cbug-0021) | using_artifact = borg_equips_item(act_loskill, true) && borg.has[BI_CURHP] > 100; borg.has[] is indexed by object kind, so BI_CURHP is treated as a… | med | reported lead | [C src/borg/borg-fight-defend.c:2474–2659](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-defend.c#L2474-L2659) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0022](#cbug-0022) | borg_init_item_val, all seeds, startup: sv_wand_confuse_monster is looked up as "Scare Monster" (the same as sv_wand_fear_monster) and sv_wand_elec… | low | reported lead | [C src/borg/borg-item-val.c:261–516](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-val.c#L261-L516) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0023](#cbug-0023) | adjust_order_operations(): the blocks passed to adjust_order_ops_depth_block(f, pdepth, start, itoken - 1) are scanned with tok < end, so the last… | low | reported lead | [C src/borg/borg-formulas-calc.c:445–471](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas-calc.c#L445-L471) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0024](#cbug-0024) | Light-coordinate lists can contain duplicate grids | med | reported lead | [C src/borg/borg-cave-light.c:69–223](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L69-L223) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0025](#cbug-0025) | borg_init_spell(), all caster seeds, startup: spell->status = spell_okay_to_cast(player, spell_num); stores a bool in a field that holds BORG_MAGIC… | low | reported lead | [C src/borg/borg-magic.c:744–766](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L744-L766) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0026](#cbug-0026) | borg_cheat_spells() resets borg.book_idx[0..9] but only cheats books 0..7 (book_idx < 8); no class has a ninth book. | low | reported lead | [C src/borg/borg-magic.c:677–718](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L677-L718) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0027](#cbug-0027) | borg_spell_stat() tests &books[0].spells[0] != NULL, which is always true. | low | reported lead | [C src/borg/borg-magic.c:239–249](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L239-L249) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0028](#cbug-0028) | Three callers pass format(...) as the error argument of borg_formula_error(): "value type (first parameter '%s') not found" and (twice) "value erro… | low | reported lead | [C src/borg/borg-formulas.c:123–132](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas.c#L123-L132) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0029](#cbug-0029) | parse_range(), only with borg_uses_dynamic_calcs | low | reported lead | [C src/borg/borg-formulas.c:273–345](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas.c#L273-L345) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0030](#cbug-0030) | Spell stat: the last tier is 20 * 100L + 6 * 300L + (s - 26) * 5L; the tier below it starts from 20 * 400L | med | reported lead | [C src/borg/borg-home-power.c:33–352](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-power.c#L33-L352) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0031](#cbug-0031) | Amulets: if (num_neck > 3) .. | med | reported lead | [C src/borg/borg-home-power.c:33–352](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-power.c#L33-L352) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0032](#cbug-0032) | borg_play_magic(), every call (study and town spell testing): if (borg_grids[borg.c.y][borg.c.x].info == BORG_DARK) compares the whole info byte, s… | low | reported lead | [C src/borg/borg-magic-play.c:88–229](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic-play.c#L88-L229) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0033](#cbug-0033) | borg_prepared() calls borg_restock() first and returns "Clevel < depth" when max clevel < depth (below 50), so in borg_prepared_aux(): "1 Lite" and… | low | reported lead | [C src/borg/borg-prepared.c:538–686](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L538-L686) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0034](#cbug-0034) | borg_restock(): "restock fuel" and "restock fuel < 2" need light 0, which already returned "restock light radius < 1". | low | reported lead | [C src/borg/borg-prepared.c:694–826](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L694-L826) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0035](#cbug-0035) | "Scumming *Heal* potions (%d to go)" tests the home counts from before borg_notice_home() but prints 10 - num_ezheal from after it, and ignores the… | low | reported lead | [C src/borg/borg-prepared.c:538–686](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L538-L686) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0036](#cbug-0036) | borg_reincarnate_start(), only when the Borg respawns (game option cheat_live on and borg_cheat_death off, or borg_respawn_winners) | med | reported lead | [C src/borg/borg-reincarnate.c:304–362](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-reincarnate.c#L304-L362) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0037](#cbug-0037) | Sustains on items: the five of_has(item->flags, OF_SUST_*) tests all add to num_sustain_str, so num_sustain_int/wis/dex/con only ever count the pla… | med | reported lead | [C src/borg/borg-home-notice.c:343–932](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-notice.c#L343-L932) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0038](#cbug-0038) | num_genocide is reset but never counted (scrolls of Banishment are not looked for), so the home power reward for them is always 0 | med | reported lead | [C src/borg/borg-home-notice.c:343–932](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-notice.c#L343-L932) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0039](#cbug-0039) | borg_write_map(): "Your hands are glowing dull red." tests TMD_CONFUSED again (it meant a different timed effect), so a confused Borg's map dump pr… | high | reported lead | [C src/borg/borg-log.c:145–669](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L145-L669) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0040](#cbug-0040) | borg_display_status(): for "Demon" and "Dragon" the slay's blue is always overwritten (if (WS) blue; if (WK) green; else slate;), so a plain slay s… | high | reported lead | [C src/borg/borg-log.c:775–1326](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L775-L1326) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0041](#cbug-0041) | Harmless, same file: borg_react_prompted() returns key (a pointer) from a bool function in three places; it is never NULL, so this is just true. | low | reported lead | [C src/borg/borg-messages-react.c:95–324](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages-react.c#L95-L324) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0042](#cbug-0042) | borg_object_fully_id(), by code reading | low | reported lead | [C src/borg/borg-item-id.c:38–138](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-id.c#L38-L138) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0043](#cbug-0043) | borg_slot(): the "Prefer largest pval (even if smaller pile)" test skips an item only when item->iqty > borg_items[n].iqty, but the "Prefer smalles… | med | reported lead | [C src/borg/borg-inventory.c:88–127](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-inventory.c#L88-L127) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0044](#cbug-0044) | borg_first_empty_inventory_slot() scans down from the last pack slot for the last used one and returns the slot after it | med | reported lead | [C src/borg/borg-inventory.c:255–267](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-inventory.c#L255-L267) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0045](#cbug-0045) | LOSE_CON blows add the "below 8" fear when BI_CSTR < 8 (strength). | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0046](#cbug-0046) | HURT: the stun test z > d_dice * d_side comes right after z = d_dice * d_side, so it is never true (dead code). | low | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0047](#cbug-0047) | The hit chance 150 - ((ac * 300) / 4 / 1 + (level + power) * 3) is below 5 for any armour class of 2 or more, so partial damage (full_damage == fal… | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0048](#cbug-0048) | bolt is set by the first bolt spell and never reset, so every later spell of the same monster (bolt or not) has its damage zeroed when the monster… | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0049](#cbug-0049) | The summon cases' grid scan assigns to the x/y parameters (harmless: not read again) | low | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0050](#cbug-0050) | The second borg_crush_spell block (in the ranged part) clears v1 again instead of v2. | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0051](#cbug-0051) | The Teleport Other skip list is read with ii <= borg_tp_other_n, one entry past the count. | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0052](#cbug-0052) | The first move simulation tests feat == FEAT_GRANITE, the second feat >= FEAT_GRANITE (so it also treats terrain above the permanent wall, e.g | high | reported lead | [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0053](#cbug-0053) | borg_danger() overwrites its full_damage argument with true, so the partial-damage paths above are only reached through direct borg_danger_one_kill… | high | reported lead | [C src/borg/borg-danger.c:2824–2865](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L2824-L2865) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0054](#cbug-0054) | "Give credit for stat bonuses" tests of_has(item->flags, STAT_STR) .. | med | reported lead | [C src/borg/borg-item-analyze.c:43–261](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-analyze.c#L43-L261) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0055](#cbug-0055) | borg_flow_take(), borg_flow_take_scum(), borg_flow_take_lunal(): the "nearest up stairs" scan skips a stair when b_j >= j, so it keeps the *farthes… | med | reported lead | [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0056](#cbug-0056) | if (!k_ptr) continue; tests &k_info[take->kidx], which is never NULL, so dead entries below borg_takes_nxt are not skipped: their location (0,0) be… | med | reported lead | [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0057](#cbug-0057) | item_bad is worked out (with its "Lunal Item" notes) but never read: every entry that passes the view and stairs tests is a target, worthless ones… | med | reported lead | [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0058](#cbug-0058) | borg_follow_take(): an object under the Borg is deleted, but the function goes on with the wiped entry: the "on screen" test reads grid (0,0), and… | low | reported lead | [C src/borg/borg-flow-take.c:155–194](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L155-L194) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0059](#cbug-0059) | observe_take_move(): the attr test only applies when the kind's char is '!' and its attr is not 11; for every other kind the attr is not compared a… | med | reported lead | [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0060](#cbug-0060) | The device fail check 100 * ((skill - lev) - 140) / ((lev - skill) - 90) (rods, staffs, rings, borg_activate_failure) divides by zero when the item… | high | reported lead | [C src/borg/borg-item-use.c:1008–1045](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L1008-L1045) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0061](#cbug-0061) | borg_quaff_crit(): "Avoid drinking CCW twice in a row" returns false (74 times in 100) when the last CCW was quaffed *more* than 4 game turns ago;… | high | reported lead | [C src/borg/borg-item-use.c:46–72](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L46-L72) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0062](#cbug-0062) | borg_equips_ring() / borg_activate_ring() loop from INVEN_RIGHT to < INVEN_LEFT, so only the right ring is ever checked. | high | reported lead | [C src/borg/borg-item-use.c:726–776](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L726-L776) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0063](#cbug-0063) | borg_use_staff_fail(): the "desperation" Teleportation branch tests fail > 500 again inside fail > 500, so a not-confused, not-blind Borg always gi… | high | reported lead | [C src/borg/borg-item-use.c:578–632](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L578-L632) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0064](#cbug-0064) | borg_eat_food_any(): "when hurting" is CURHP < 4 \|\| CURHP <= MAXHP, which is true whenever current HP is not above the maximum (so nearly always). | high | reported lead | [C src/borg/borg-item-use.c:325–407](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L325-L407) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0065](#cbug-0065) | borg_use_things(): the Enlightenment potion branch only breaks (never quaffs); the comment says "Check the scroll". | high | reported lead | [C src/borg/borg-item-use.c:1050–1176](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L1050-L1176) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0066](#cbug-0066) | "Pass on the swap which yields the best result" keeps the *higher* danger: if (b_p1 <= b_p2) b_p = b_p2 (weapon) else b_p = b_p1 (armour) | high | reported lead | [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0067](#cbug-0067) | With an armour swap and no weapon swap, b_p2 stays 0, so an armour danger of 0 picks swap = weapon_swap - 1 = -1 and the key is all_letters_nohjkl[… | high | reported lead | [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0068](#cbug-0068) | The i == -1 fixes are dead (the swap index is non-zero there). | high | reported lead | [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0069](#cbug-0069) | borg_one_step_wearing_best(): int skipping = skip; sits inside the loop, so it is reset on every pass | high | reported lead | [C src/borg/borg-item-wear.c:1077–1207](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L1077-L1207) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0070](#cbug-0070) | borg_best_stuff_aux(): the "don't test the same item in both ring slots" test for INVEN_LEFT (order 8) reads test[n + 1], the INVEN_RIGHT entry (or… | high | reported lead | [C src/borg/borg-item-wear.c:1212–1321](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L1212-L1321) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0071](#cbug-0071) | borg_wear_stuff(): track_worn_time is an int16_t, so borg.time.now is truncated; once the time passes 32767 the "worn more than 10 turns ago" test… | high | reported lead | [C src/borg/borg-item-wear.c:745–1037](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L745-L1037) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0072](#cbug-0072) | borg_light_beam(): "Don't do it if on the edge of shifting the panel" compares the Borg's absolute dungeon row borg.c.y with the panel height (borg… | med | reported lead | [C src/borg/borg-light.c:683–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L683-L835) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0073](#cbug-0073) | borg_light_beam(): the west test starts at step 1 while north, south and east start at step 0 (the Borg's own grid), so with a light radius of 0 th… | low | reported lead | [C src/borg/borg-light.c:683–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L683-L835) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0074](#cbug-0074) | borg_refuel_lantern(): with no flask of oil, the lantern scan starts at borg_slot(TV_LIGHT, sv_light_lantern), which (lanterns do not stack, all pi… | med | reported lead | [C src/borg/borg-light.c:552–608](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L552-L608) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0075](#cbug-0075) | BI_FIRST_CURSED is set by borg_notice() in the order equipment, quiver, inventory, so in the quiver branch BORG_EQUIP is never set and the BI_WHERE… | low | reported lead | [C src/borg/borg-item-decurse.c:111–156](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L111-L156) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0076](#cbug-0076) | A cursed ammo stack in the pack (outside the quiver) sets BORG_QUILL, not BORG_INVEN | med | reported lead | [C src/borg/borg-item-decurse.c:111–156](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L111-L156) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0077](#cbug-0077) | borg_decurse_armour() / borg_decurse_weapon() send all_letters_nohjkl[swap - 1] without checking the swap: with a decurse_*_swap flag but *_swap ==… | med | reported lead | [C src/borg/borg-item-decurse.c:37–69](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L37-L69) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0078](#cbug-0078) | borg_update_kill_old(): the "unique is dead" fix-up writes borg_race_death[i] with the *kill* index i, not the race index. | high | reported lead | [C src/borg/borg-flow-kill.c:243–383](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L243-L383) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0079](#cbug-0079) | borg_new_kill(): r_ptr is taken from the slot's race *before* kill->r_idx is set, so the "force the grid to floor / granite" step at the end uses t… | high | reported lead | [C src/borg/borg-flow-kill.c:709–850](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L709-L850) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0080](#cbug-0080) | borg_follow_kill(): randint1(100) < 1 is never true (but still draws a random number) | high | reported lead | [C src/borg/borg-flow-kill.c:529–704](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L529-L704) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0081](#cbug-0081) | observe_kill_move(): for a unique, d = d * 2 changes the parameter, so the allowed distance stays doubled (and doubles again per unique) for the re… | high | reported lead | [C src/borg/borg-flow-kill.c:243–383](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L243-L383) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0082](#cbug-0082) | borg_flow_kill(): hall_walls and skip_monster are set up once, not per monster | high | reported lead | [C src/borg/borg-flow-kill.c:1651–1917](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1651-L1917) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0083](#cbug-0083) | borg_flow_kill_aim(): the "next to a monster" check scans slot 0 and dead slots too (their stale or (0,0) positions). | high | reported lead | [C src/borg/borg-flow-kill.c:1951–2035](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1951-L2035) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0084](#cbug-0084) | borg_shoot_scoot_safe(): the danger of an adjacent monster is borg_danger_one_kill(..., i, ...) with i the *direction* index (0..7), not the monste… | high | reported lead | [C src/borg/borg-flow-kill.c:2882–3084](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L2882-L3084) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0085](#cbug-0085) | borg_init_flow_kill(): the "extract dead uniques" cheat says "skip non-uniques" but skips uniques, so it marks non-unique races with max_num == 0 (… | high | reported lead | [C src/borg/borg-flow-kill.c:3300–3339](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L3300-L3339) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0086](#cbug-0086) | borg_locate_kill(): my_strnicmp(who, "It", 2) treats any name that starts with "it" (any case) as an invisible monster. | high | reported lead | [C src/borg/borg-flow-kill.c:1274–1626](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1274-L1626) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0087](#cbug-0087) | borg_pick_weapon() decides whether to send '/' (to equipment) or '\|' (to quiver) by looking for bows, diggers, hafted weapons, polearms and swords… | med | reported lead | [C src/borg/borg-item-enchant.c:73–107](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-enchant.c#L73-L107) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0088](#cbug-0088) | borg_pick_armor() tests TV_HELM twice; borg_enchant_to_d() tests BI_AMMO_POWER < 3 twice in its ammo loop (both harmless). | low | reported lead | [C src/borg/borg-item-enchant.c:39–70](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-enchant.c#L39-L70) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0089](#cbug-0089) | The munchkin "cure blindness by resting" branch calls borg_note("# Resting to cure problem | low | reported lead | [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0090](#cbug-0090) | The "expensive" poison cure tries borg_eat(TV_MUSHROOM, sv_mush_fast_recovery) twice in the same \|\| chain (the second try repeats the first; harmle… | low | reported lead | [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0091](#cbug-0091) | The rod recharge rest indexes borg_items[borg_slot(TV_ROD, sval)] without checking for -1; it relies on borg.has[kind] meaning the rod is in the pack. | med | reported lead | [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0092](#cbug-0092) | borg_prep_leave_level_spells() sets borg.no_rest_prep = borg.trait[BI_CLEVEL] * 1000 after casting Protection from Evil | med | reported lead | [C src/borg/borg-flow-stairs.c:253–342](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-stairs.c#L253-L342) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0093](#cbug-0093) | borg_flow_cost_stair() does not check b_stair against track_less.num (it reads any allocated entry). | med | reported lead | [C src/borg/borg-flow-stairs.c:46–71](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-stairs.c#L46-L71) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0094](#cbug-0094) | borg_perma_aux_regen() has no if (borg_simulate) return ...; test, so the scoring loop of borg_perma_spell() really casts Rapid Regeneration (keys… | med | reported lead | [C src/borg/borg-fight-perm.c:428–470](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L428-L470) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0095](#cbug-0095) | borg_perma_aux_venom() checks the cost of SMITE_EVIL, not VENOM (for a class without Smite Evil the cost is -1, so it always passes). | med | reported lead | [C src/borg/borg-fight-perm.c:522–564](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L522-L564) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0096](#cbug-0096) | borg_perma_aux_fastcast() scores 5 when simulating but returns 1 when cast (harmless: the real call's value is not used). | low | reported lead | [C src/borg/borg-fight-perm.c:328–370](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L328-L370) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0097](#cbug-0097) | borg_perma_aux_bless() and borg_perma_aux_resist() ignore whether the cast worked and always set no_rest_prep; ..._resist_colluin() always returns… | med | reported lead | [C src/borg/borg-fight-perm.c:73–117](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L73-L117) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0098](#cbug-0098) | The "Skip every non floor/glyph" test is ag->feat != FEAT_FLOOR && ag->glyph: it skips only glyphed non-floor grids, so every other grid (walls, do… | high | reported lead | [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0099](#cbug-0099) | In the "old center" branch tmp_glyph is never counted, so the score is always 500 - cost. | high | reported lead | [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0100](#cbug-0100) | On arrival borg_needs_new_sea is cleared (and the center stored) even if no glyph can be made | high | reported lead | [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0101](#cbug-0101) | The "is the sea complete" check reads borg_grids[center + ddd] without a bounds check (a center on row/column 1 would read index -1). | high | reported lead | [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0102](#cbug-0102) | track_glyph.num can go below 0: borg-messages.c's "The object resists the spell" / "There is no clear floor" handler does num-- without a check (af… | high | reported lead | [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0103](#cbug-0103) | borg_munchkin_mage() sets borg_attacking = true before its monster scan, but the two return false inside the scan (a monster adjacent, or within 2… | low | reported lead | [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0104](#cbug-0104) | Both functions set borg_simulate = true and, when no attack scores above 0, return without setting it back to false. | low | reported lead | [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0105](#cbug-0105) | borg_munchkin_mage() has no class check: despite the name and the comment ("use MM"), every class tries every attack type except BF_REST and BF_THR… | low | reported lead | [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0106](#cbug-0106) | borg_flow_dark_interesting(): the "Explore visible traps" branch is dead | med | reported lead | [C src/borg/borg-flow-dark.c:46–199](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L46-L199) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0107](#cbug-0107) | borg_flow_dark_4(): "Clear the edges" sets borg_data_know and borg_data_icky of the whole border rectangle to false, so danger marks set on those g… | med | reported lead | [C src/borg/borg-flow-dark.c:742–849](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L742-L849) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0108](#cbug-0108) | borg_flow_dark_5(): the clevel <= 5 and clevel <= 30 spread branches are identical (short leash). | med | reported lead | [C src/borg/borg-flow-dark.c:854–939](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L854-L939) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0109](#cbug-0109) | borg_flow_spread() skips a shop entrance that is not the goal shop only when it is in neither the Borg's row nor its column (y != borg.c.y && x !=… | med | reported lead | [C src/borg/borg-flow.c:255–501](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L255-L501) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0110](#cbug-0110) | borg_play_step() (breeder levels) skips doors when track_door.num >= 255, but track_door has only 100 entries, so the test is never true: doors the… | med | reported lead | [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0111](#cbug-0111) | borg_play_step() looks up the chest under the goal grid (loc(x2, y2)), not under the grid stepped on; the two are the same for the only caller (bor… | med | reported lead | [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0112](#cbug-0112) | borg_flow_old() reads borg_data_flow at the neighbour before its "avoid screen edges" test (a Borg on row/column 0 would read index -1). | med | reported lead | [C src/borg/borg-flow.c:1122–1203](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L1122-L1203) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0113](#cbug-0113) | borg_play_step() ends with a dead ui_event "unhook" (a local that is never set); borg_free_flow() frees borg_data_flow twice (the second test sees… | med | reported lead | [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0114](#cbug-0114) | borg_flow_enqueue_grid() computes the danger of every new grid even when desperate/lunal/munchkin/digging, then ignores it (no effect but cost). | low | reported lead | [C src/borg/borg-flow.c:506–580](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L506-L580) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0115](#cbug-0115) | borg_think_home_sell_useful(): the two memsets that "clear out our initial best/test objects" pass sizeof(z_info->store_inven_max * sizeof(uint8_t)… | low | reported lead | [C src/borg/borg-store-sell.c:529–643](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L529-L643) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0116](#cbug-0116) | borg_think_home_sell_best(): for a staff or wand, each trial takes charge_each charges off the pack item, but the restore after the trial only puts… | med | reported lead | [C src/borg/borg-store-sell.c:398–524](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L398-L524) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0117](#cbug-0117) | borg_good_sell(): the "ego item not fully identified" test asks borg_ego_has_random_power() about the ego of the cloak slot (borg_items[INVEN_OUTER… | med | reported lead | [C src/borg/borg-store-sell.c:816–941](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L816-L941) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |
| [CBUG-0118](#cbug-0118) | borg_count_sell(): an unidentified item that is not part of a pile makes the function return false (0) at once | med | reported lead | [C src/borg/borg-store-sell.c:1162–1266](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L1162-L1266) | unreviewed | none | intake [#93](https://github.com/diegoami/mandos/issues/93) |

### CBUG-0001

**Cancelling a map dump dereferences a NULL file**

Checked 2026-11-05; borg-rs group(s) 13.

Pinned source references:

- [C src/borg/borg-log.c:190–204](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L190-L204) — if (ask && get_string
- [C src/borg/borg-log.c:666–668](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L666-L668) — file_close(borg_map_file);
- [borg-rs docs/c-bugs.md:167–181](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L167-L181) — discovery group 13
- [borg-rs docs/c-bugs.md:173–177](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L173-L177) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:173–177](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L173-L177)

> `borg_write_map(true)` (the `^z` map command, not in any suite): when the
>   file prompt is cancelled or the file cannot be opened, the file stays
>   NULL. `file_putf()` ignores a NULL file, but `file_put()` (the "Swap
>   ...: NONE" lines, with `borg_uses_swaps`) and the final `file_close()`
>   dereference it, so the game crashes.


Independent validation: Mandos native C-game reproduction ([#94](https://github.com/diegoami/mandos/issues/94)).

Escape at the map filename prompt crashes the C game (SIGSEGV); the guard returns safely. No lost-progress claim.

59 C Borg units, no Rust Borg linked; direct function diagnostic in a normally born C game. Top-level Ctrl-Z dispatch and failed-open branch were not separately runtime-tested.

Evidence: **c game reproduced**. [Reproduction report](audit/c-reports/B94/README.md). Neo/Mandos: **no corresponding port path**.

Fix proposal: [diegoami/neo-angband#1](https://github.com/diegoami/neo-angband/pull/1) — c-game-reproduced. Tracker: [#94](https://github.com/diegoami/mandos/issues/94).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0002

**Paralysis/knockout message suppression resets a different variable**

Checked 2026-11-05; borg-rs group(s) 14.

Pinned source references:

- [C src/borg/borg.c:310–314](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg.c#L310-L314) — borg.dont_react = false;
- [C src/borg/borg-messages-react.c:45–49](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages-react.c#L45-L49) — if (borg_dont_react
- [C src/borg/borg-messages.c:439–448](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages.c#L439-L448) — borg_dont_react = true;
- [borg-rs docs/c-bugs.md:182–198](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L182-L198) — discovery group 14
- [borg-rs docs/c-bugs.md:184–193](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L184-L193) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:184–193](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L184-L193)

> `borg-messages.c` sets the global `borg_dont_react` on "You have been
>   knocked out." and "You are paralyzed"; `borg_react()`
>   (`borg-messages-react.c`) then queues nothing and only notes "# Ignoring
>   messages.". The reset in `borg.c` (`borg_inkey_hack` path:
>   `borg.dont_react = false;`) clears the unused struct field
>   `borg.dont_react` instead, so once set the global stays true for the rest
>   of the process: the Borg never again queues hit/miss/kill/SELF messages
>   for `borg_update()`, and `borg_caution()` notes "# Borg ignoring messges."
>   every turn. By code reading; the full suite never sets it (checked with
>   a temporary log of the flag).


C reactions can remain suppressed after recovery; no actual later death/decision change observed.

Older imported C resets the global correctly. This is a newer C regression, not a Neo omission.

Evidence: **source checked**. Neo/Mandos: **C only; different port pipeline**.

Fix proposal: none. Tracker: [#95](https://github.com/diegoami/mandos/issues/95).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0003

**West radius-two shoulder grids are omitted**

Checked 2026-11-05; borg-rs group(s) 4.

Pinned source references:

- [C src/borg/borg-cave-light.c:135–143](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L135-L143) — /* West of the player */
- [Neo src/perceive.ts:285–290](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/perceive.ts#L285-L290) — if (floorAt(cy, cx - 2))
- [Mandos src/perceive.ts:288–293](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/perceive.ts#L288-L293) — if (floorAt(cy, cx - 2))
- [borg-rs docs/c-bugs.md:41–54](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L41-L54) — discovery group 4
- [borg-rs docs/c-bugs.md:45–52](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L45-L52) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:45–52](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L45-L52)

> The "East" block lights (y, x+2), (y+1, x+2), (y-1, x+2), but the "West"
>   block lights (y, x-2), (y+2, x-2), (y-2, x-2) instead of (y+1, x-2) and
>   (y-1, x-2). So (y+-1, x-2) never get `BORG_LIGHT`, and (y+-2, x-2) can be
>   added a second time to `borg_light_x/y` (already added by the South/North
>   blocks), contrary to the macro's comment. Also, with radius 4+ the four
>   (y+-3, x+-3) grids can be entered twice (once by the diagonal checks and
>   once by the box scan). Duplicates only make readers of the array
>   (`borg_flow_dark`, `borg_update`) visit a grid twice.


Independent validation: Mandos native C flag observation; practical impact unproven ([#89](https://github.com/diegoami/mandos/issues/89)).

Native C marks 19 distinct grids versus 21 after correction; no meaningful gameplay outcome established.

Duplicate light-list entries are a separate symptom; avoid claiming two missing flags saved a life.

Evidence: **c game flags only**. [Related evidence](https://github.com/diegoami/mandos/issues/89). Neo/Mandos: **present in both**.

Fix proposal: [diegoami/mandos#88](https://github.com/diegoami/mandos/pull/88) — impact-unproven. Tracker: [#87](https://github.com/diegoami/mandos/issues/87).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0004

**Cold melee uses temporary acid resistance**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:262–276](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L262-L276) — case MONBLOW_COLD:
- [Neo src/danger/danger.ts:206–219](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/danger/danger.ts#L206-L219) — case MONBLOW.COLD:
- [Mandos src/danger/danger.ts:209–222](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/danger/danger.ts#L209-L222) — case MONBLOW.COLD:
- [borg-rs docs/c-bugs.md:226–260](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L226-L260) — discovery group 17
- [borg-rs docs/c-bugs.md:231–232](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L231-L232) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:231–232](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L231-L232)

> COLD blows test the temporary *acid* resistance (`borg.temp.res_acid`),
>     not `res_cold`.


Can misestimate a cold blow when only one temporary resistance is active; real changed combat choice pending.

Independent of the other danger slips in the same Rust group.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0005

**Black Market Teleport Other rod class exception is reversed**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:127–133](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L127-L133) — && borg.trait[BI_CLASS] == CLASS_ROGUE)
- [Neo src/store/buy.ts:189–193](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L189-L193) — item.sval === Ro.teleport_other
- [Mandos src/store/buy.ts:189–193](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L189-L193) — item.sval === Ro.teleport_other
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:610–613](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L610-L613) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:610–613](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L610-L613)

> `borg_good_buy()`: the Black Market Rod of Teleport Other test reads
>   `class != CLASS_MAGE && class == CLASS_ROGUE` (comment: "mage and rogue
>   can cast teleport away"), so only rogues may buy it there; `!=` was
>   meant for both.


A useful escape device can be rejected for the wrong class; real purchase/survival effect pending.

Both current C and src/store/buy.ts use !=MAGE && ==ROGUE.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#103](https://github.com/diegoami/mandos/issues/103).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0006

**Starvation shopping exception admits unrelated scrolls/subtypes**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:281–288](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L281-L288) — /* Special check for 'immediate shopping' */
- [Neo src/store/buy.ts:294–303](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L294-L303) — /* immediate-shopping food gate
- [Mandos src/store/buy.ts:294–303](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L294-L303) — /* immediate-shopping food gate
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:614–618](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L614-L618) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:614–618](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L614-L618)

> `borg_think_shop_buy_useful()`: the "immediate shopping" test (no food)
>   is `tval != TV_FOOD && (tval != TV_SCROLL && sval !=
>   sv_scroll_satisfy_hunger)`: every scroll, and every item whose sval
>   happens to equal Satisfy Hunger's, gets through; `!(tval == TV_SCROLL &&
>   sval == ...)` was meant.


A starving character can consider unrelated supplies; no observed starvation or loss of gold proved.

Both C and src/store/buy.ts use the conjunction that exempts every scroll and any matching numeric sval.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#104](https://github.com/diegoami/mandos/issues/104).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0007

**Home trial early exits leave reduced quantities/charges**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:501–523](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L501-L523) — borg_shops[BORG_HOME].ware[n].iqty -= qty;
- [Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625)

> `borg_think_home_buy_useful()`: the two "require two empty slots"
>   `continue`s come after the ware was taken out of the home
>   (`iqty -= qty`, and `pval` for staffs/wands), so that home ware keeps the
>   reduced count until the next store read. `p_left`/`p_right` are not
>   reset per ware: when a ring slot holds the One Ring, the other hand's
>   value comes from an earlier ring. The left-hand trial uses one ring, the
>   right-hand trial `qty` rings.


Later C trials can see a modified home snapshot; real item loss is not claimed.

C decrements before the two-empty-slot continue. TS BuySim path does not mutate those wares.

Evidence: **source checked**. Neo/Mandos: **C only; port uses value simulation**.

Fix proposal: none. Tracker: [#105](https://github.com/diegoami/mandos/issues/105).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0008

**Ring-side scores persist across home wares**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:455–475](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L455-L475) — int32_t p_left
- [C src/borg/borg-store-buy.c:542–548](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L542-L548) — p_left = borg_power();
- [Neo src/store/buy.ts:348–387](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [Mandos src/store/buy.ts:348–387](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L348-L387) — borgThinkHomeBuyUseful
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625)

> `borg_think_home_buy_useful()`: the two "require two empty slots"
>   `continue`s come after the ware was taken out of the home
>   (`iqty -= qty`, and `pval` for staffs/wands), so that home ware keeps the
>   reduced count until the next store read. `p_left`/`p_right` are not
>   reset per ware: when a ring slot holds the One Ring, the other hand's
>   value comes from an earlier ring. The left-hand trial uses one ring, the
>   right-hand trial `qty` rings.


C can compare a ring using an earlier ware's score when the other slot holds the One Ring.

p_left/p_right declared outside the loop; current TS helper has no corresponding accumulators. Broader ring parity is independent.

Evidence: **source checked**. Neo/Mandos: **C only; different ring trial**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0009

**Home ring trials use asymmetric quantities**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:535–539](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L535-L539) — borg_items[slot].iqty = 1;
- [C src/borg/borg-store-buy.c:567–571](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L567-L571) — borg_items[INVEN_RIGHT].iqty = qty;
- [Neo src/store/buy.ts:371–376](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L371-L376) — const sim: BuySim
- [Mandos src/store/buy.ts:371–376](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L371-L376) — const sim: BuySim
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:619–625](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L619-L625)

> `borg_think_home_buy_useful()`: the two "require two empty slots"
>   `continue`s come after the ware was taken out of the home
>   (`iqty -= qty`, and `pval` for staffs/wands), so that home ware keeps the
>   reduced count until the next store read. `p_left`/`p_right` are not
>   reset per ware: when a ring slot holds the One Ring, the other hand's
>   value comes from an earlier ring. The left-hand trial uses one ring, the
>   right-hand trial `qty` rings.


Potential unequal left/right power trial; legal qty>1 ring reachability remains unproven.

Do not fabricate stacked-ring gameplay or call this a proven bad equip decision.

Evidence: **source checked**. Neo/Mandos: **C only; different ring trial**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0010

**Home grab skip flag leaks to later wares**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:859–896](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L859-L896) — skip_it = false;
- [Neo src/store/buy.ts:494–510](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L494-L510) — let skip = false;
- [Mandos src/store/buy.ts:494–510](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L494-L510) — let skip = false;
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:626–627](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L626-L627) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:626–627](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L626-L627)

> `borg_think_home_grab_useless()`: `skip_it` is never reset, so after the
>   first ware that was just sold to the home, every later ware is skipped.


Once one recently sold ware is skipped, later C wares may be skipped too.

TS src/store/buy.ts declares let skip=false inside each ware loop.

Evidence: **source checked**. Neo/Mandos: **C only; port resets per ware**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0011

**No-hole swap exit leaves valuation changed**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:972–983](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L972-L983) — = -1L;
- [C src/borg/borg-store-buy.c:1088–1099](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1088-L1099) — = -1L;
- [Neo src/store/buy.ts:548–551](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L548-L551) — const evalFn
- [Mandos src/store/buy.ts:548–551](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L548-L551) — const evalFn
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:628–634](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L628-L634) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:628–634](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L628-L634)

> `borg_think_home_buy_swap_weapon()` / `_armour()`: when there is no
>   hole, they return without restoring `weapon_swap_value` /
>   `armour_swap_value` (left at -1). When a swap exists, the trial slot is
>   the swap's own pack slot: each candidate is copied over it and its
>   `iqty` set to 0 afterwards, and the slot is not restored from
>   `safe_items`, so the swap item is gone from `borg_items` until the next
>   inventory read (the final `borg_notice(true)` already sees no swap).


C returns with swap value -1 instead of restoring it; next real decision impact unproven.

TS returns through an optional evaluation seam and has no corresponding global mutation. #4 missing swap functionality is a separate port gap.

Evidence: **source checked**. Neo/Mandos: **port subsystem missing**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0012

**Swap trials overwrite the tracked swap inventory slot**

Checked 2026-11-05; borg-rs group(s) 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:1002–1026](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1002-L1026) — memcpy(&borg_items[hole]
- [C src/borg/borg-store-buy.c:1112–1136](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1112-L1136) — memcpy(&borg_items[hole]
- [Neo src/store/buy.ts:543–571](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/buy.ts#L543-L571) — borgThinkHomeBuySwap
- [Mandos src/store/buy.ts:543–571](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/buy.ts#L543-L571) — borgThinkHomeBuySwap
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:628–634](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L628-L634) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:628–634](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L628-L634)

> `borg_think_home_buy_swap_weapon()` / `_armour()`: when there is no
>   hole, they return without restoring `weapon_swap_value` /
>   `armour_swap_value` (left at -1). When a swap exists, the trial slot is
>   the swap's own pack slot: each candidate is copied over it and its
>   `iqty` set to 0 afterwards, and the slot is not restored from
>   `safe_items`, so the swap item is gone from `borg_items` until the next
>   inventory read (the final `borg_notice(true)` already sees no swap).


C's model can lose its old swap item until inventory refresh; no actual game item destruction claimed.

The TS evaluator does not copy candidates over a mutable C inventory array.

Evidence: **source checked**. Neo/Mandos: **port subsystem missing**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0013

**Latest purchase/sale is outside the history reader range**

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
- [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L578-L606) — discovery group 33
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:595–599](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L595-L599) — reported C observation; not an independent validation
- [borg-rs docs/c-bugs.md:635–639](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L635-L639) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:595–599](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L595-L599)

> The sale list: `borg_think_shop_sell()` sets `sold_item_num` to the
>   index just written (not a count), and every reader (here and in
>   borg-store-buy.c) scans `p < sold_item_num`, so the most recent sale is
>   never seen. `sold_item_nxt` wraps at 9, so slot 9 is never used.
>   borg-store-buy.c does the same with its `bought_item_*` list.

[borg-rs docs/c-bugs.md:635–639](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L635-L639)

> `bought_item_num` is the index of the last entry written, but the
>   readers (`borg_store_sell`) loop `p < bought_item_num`, so the latest
>   purchase is never checked; `bought_item_nxt` wraps at 9, so entry 9 is
>   never used. (`sold_item_*` in borg-store-sell.c work the same way and are
>   read the same way here.)


Immediate buy-back/resale suppression can miss the newest record; full transaction scenario pending.

Writers store a last index, readers scan p<num. Group34's purchase half shares the cause already reported in33; one catalogue entry.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#106](https://github.com/diegoami/mandos/issues/106).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0014

**Ten-entry transaction arrays never use the tenth slot**

Checked 2026-11-05; borg-rs group(s) 33, 34.

Pinned source references:

- [C src/borg/borg-store-buy.c:1226–1228](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-buy.c#L1226-L1228) — if (bought_item_nxt >= 9)
- [C src/borg/borg-store-sell.c:1128–1130](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L1128-L1130) — if (sold_item_nxt >= 9)
- [Neo src/store/store.ts:147–155](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L147-L155) — if (mem.boughtNxt >= 9)
- [Mandos src/store/store.ts:150–158](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L150-L158) — if (mem.boughtNxt >= 9)
- [Neo src/store/store.ts:132–140](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/store.ts#L132-L140) — if (mem.soldNxt >= 9)
- [Mandos src/store/store.ts:135–143](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/store.ts#L135-L143) — if (mem.soldNxt >= 9)
- [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L578-L606) — discovery group 33
- [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) — discovery group 34
- [borg-rs docs/c-bugs.md:595–599](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L595-L599) — reported C observation; not an independent validation
- [borg-rs docs/c-bugs.md:635–639](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L635-L639) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:595–599](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L595-L599)

> The sale list: `borg_think_shop_sell()` sets `sold_item_num` to the
>   index just written (not a count), and every reader (here and in
>   borg-store-buy.c) scans `p < sold_item_num`, so the most recent sale is
>   never seen. `sold_item_nxt` wraps at 9, so slot 9 is never used.
>   borg-store-buy.c does the same with its `bought_item_*` list.

[borg-rs docs/c-bugs.md:635–639](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L635-L639)

> `bought_item_num` is the index of the last entry written, but the
>   readers (`borg_store_sell`) loop `p < bought_item_num`, so the latest
>   purchase is never checked; `bought_item_nxt` wraps at 9, so entry 9 is
>   never used. (`sold_item_*` in borg-store-sell.c work the same way and are
>   read the same way here.)


History capacity is nine rather than ten; whether this is intentional or harmful remains unproven.

Keep this separate from the latest-entry omission; do not inflate it into a gameplay failure.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0015

**Critical escape returns with pretend full mana**

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:780–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L780-L835) — borg.trait[BI_CURSP] = borg.trait[BI_MAXSP];
- [Neo src/fight/escape.ts:533–563](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L533-L563) — /* critical emergency attempts
- [Mandos src/fight/escape.ts:536–566](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L536-L566) — /* critical emergency attempts
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L642-L666) — discovery group 35
- [borg-rs docs/c-bugs.md:645–650](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L645-L650) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:645–650](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L645-L650)

> `borg_escape()`, danger level 1: before the "critical" attempts (1.1 to
>   1.3) the Borg pretends to have full mana
>   (`borg.trait[BI_CURSP] = borg.trait[BI_MAXSP]`). The real value is put
>   back only when all three fail. When one of them succeeds, the function
>   returns with `BI_CURSP` still at `BI_MAXSP` until the traits are next
>   recomputed.


C trait state retains MAXSP until notice refresh after a successful critical attempt; later bad choice unproven.

TS never assigns pretend full mana here. Its over-exertion parity is a separate question, not this leak.

Evidence: **source checked**. Neo/Mandos: **C only; no pretend-mana mutation**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0016

**Stair predicate queues a climb before phase guards finish**

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:521–537](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L521-L537) — borg_escape_stair
- [C src/borg/borg-escape.c:905–920](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L905-L920) — (borg_escape_stair() \|\| borg_caution_phase(25
- [Neo src/fight/escape.ts:618–632](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L618-L632) — (borgEscapeStair(ctx) \|\| borgCautionPhase(ctx, 25
- [Mandos src/fight/escape.ts:621–635](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L621-L635) — (borgEscapeStair(ctx) \|\| borgCautionPhase(ctx, 25
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L642-L666) — discovery group 35
- [borg-rs docs/c-bugs.md:651–658](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L651-L658) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:651–658](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L651-L658)

> Danger levels 3.1, 4.1, 5.1, 6.1 and 8 test
>   `(borg_escape_stair() || borg_caution_phase(..)) && ... && (phase spell
>   || scroll ...)`. On an up staircase `borg_escape_stair()` already queues
>   `<` (and its note) and skips the landing-zone check. If no phase is then
>   possible (or the anti-summon timer is <= 50), the `<` stays queued and
>   the function goes on to the next tests; if a phase is possible, both the
>   `<` and the phase keys are queued and the phase bookkeeping
>   (`borg.escapes--`, "Danger Level 3.1" etc.) is applied.


C may leave climb keys queued or queue both climb and phase while applying phase bookkeeping.

C queues keys as a side effect. The command-returning port has a separate omission tracked in internal issue108; it is not a C-list entry or a claim that the same C queued-key symptom occurs there.

Evidence: **source checked**. Neo/Mandos: **different port defect**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0017

**Guarded anti-summon timer reset is unreachable**

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:879–889](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L879-L889) — borg_caution_phase(50, 2)
- [Neo src/fight/escape.ts:435–437](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L435-L437) — resetAntisummon
- [Mandos src/fight/escape.ts:438–440](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L438-L440) — resetAntisummon
- [Neo src/fight/escape.ts:597–612](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L597-L612) — borgCautionPhase(ctx, 50, 2)
- [Mandos src/fight/escape.ts:600–615](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L600-L615) — borgCautionPhase(ctx, 50, 2)
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L642-L666) — discovery group 35
- [borg-rs docs/c-bugs.md:659–661](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L659-L661) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:659–661](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L659-L661)

> The anti-summon reset (`if (borg_timer(borg.time.antisummon) < 50)
>   borg.time.antisummon = 0;`) after 2.2, 3.1, 3.3, 4.1, 4.3, 6.1 and the
>   first level 8 test is dead: those branches require the timer to be > 50.


A >50 guarded branch cannot execute its nested <50 reset; practical need for that reset unproven.

TS resetAntisummon applies the same <50 test in those branches. Other call sites can still reset it.

Evidence: **source checked**. Neo/Mandos: **same guarded condition**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0018

**Dimension Door destination lacks legality/range filters**

Checked 2026-11-05; borg-rs group(s) 35.

Pinned source references:

- [C src/borg/borg-escape.c:569–621](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-escape.c#L569-L621) — borg_dimension_door
- [Neo src/fight/escape.ts:317–342](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/fight/escape.ts#L317-L342) — borgDimensionDoor
- [Mandos src/fight/escape.ts:320–345](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/fight/escape.ts#L320-L345) — borgDimensionDoor
- [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L642-L666) — discovery group 35
- [borg-rs docs/c-bugs.md:662–665](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L662-L665) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:662–665](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L662-L665)

> `borg_dimension_door()` targets the least dangerous grid of the 100x100
>   box (offsets -50..49) that is in bounds, without checking that it is a
>   known floor grid without a monster, or in range of the spell; it ignores
>   the result of `borg_spell()`.


An emergency target can be a rejected destination; actual engine outcome still needs a legal scenario.

C also ignores borg_spell's result; TS returns it. Missing floor/occupancy/range selection guards are shared.

Evidence: **source checked**. Neo/Mandos: **partly shared**.

Fix proposal: none. Tracker: [#107](https://github.com/diegoami/mandos/issues/107).

Next: Retain a legal/reachable normal-rule scenario, initialization/pins, actual before/after commands/outcomes and negative controls before marking a fix validated.

### CBUG-0019

**Urgent shop goal is overwritten or paired with stale ware**

Checked 2026-11-05; borg-rs group(s) 36.

Pinned source references:

- [C src/borg/borg-think-store.c:105–157](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L105-L157) — /* If poisoned or bleeding
- [Neo src/store/think-store.ts:70–118](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L70-L118) — /* If poisoned or bleeding
- [Mandos src/store/think-store.ts:73–121](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L73-L121) — /* If poisoned or bleeding
- [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L667-L681) — discovery group 36
- [borg-rs docs/c-bugs.md:670–678](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L670-L678) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:670–678](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L670-L678)

> `borg_choose_shop()`: "If poisoned or bleeding -- flow to temple"
>   (`goal.shop = 3`) and "flow to general store" (`goal.shop = 0`) have no
>   effect on the choice: none of the buy/sell helpers reads `goal.shop`, and
>   unless one of them sets a ware the next step resets
>   `goal.shop = goal.ware = goal.item = -1`. They matter only if
>   `goal.ware != -1` came in with `goal.shop == -1`: then
>   `borg_think_shop_buy_useful()` returns false at once ("already have a
>   target") and the second "already flowing" test returns true with the
>   forced shop and the stale ware.


A poisoned, bleeding or hungry character can select another shop or a ware from an earlier goal; actual game transaction outcome pending.

Forced shop assignment is followed by helpers that ignore that forced shop and by unconditional goal reset. A stale ware can instead make the second already-flowing test accept the forced shop.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: [#112](https://github.com/diegoami/mandos/issues/112).

Next: Validate a legal normal-rule scene and negative controls before calling a gameplay correction carried.

### CBUG-0020

**Money-scumming repeats an already-satisfied town predicate**

Checked 2026-11-05; borg-rs group(s) 36.

Pinned source references:

- [C src/borg/borg-think-store.c:90–94](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L90-L94) — /* Must be in town */
- [C src/borg/borg-think-store.c:164–168](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-think-store.c#L164-L168) — !borg.trait[BI_CDEPTH]
- [Neo src/store/think-store.ts:60–63](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L60-L63) — /* Must be in town
- [Mandos src/store/think-store.ts:63–66](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L63-L66) — /* Must be in town
- [Neo src/store/think-store.ts:113–117](https://github.com/neostryder/neo-angband-mod-borg/blob/74a017d2f695939eb2f046b7c9ff286ef1e82568/src/store/think-store.ts#L113-L117) — !st(ctx, BI.CDEPTH)
- [Mandos src/store/think-store.ts:116–120](https://github.com/diegoami/mandos/blob/48405e9621ffc400f7af43e7fd1ed2385225ca1f/src/store/think-store.ts#L116-L120) — !st(ctx, BI.CDEPTH)
- [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L667-L681) — discovery group 36
- [borg-rs docs/c-bugs.md:679–680](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L679-L680) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:679–680](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L679-L680)

> The money-scumming test repeats `!borg.trait[BI_CDEPTH]`, already
>   returned on at the top of the function.


No independent behavior effect established; the duplicate depth test is redundant.

The function has already returned when CDEPTH is nonzero. Removing the duplicate test alone is cleanup, not a demonstrated gameplay correction.

Evidence: **source checked**. Neo/Mandos: **present in both**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Validate a legal normal-rule scene and negative controls before calling a gameplay correction carried.

### CBUG-0021

**using_artifact = borg_equips_item(act_loskill, true) && borg.has[BI_CURHP] > 100; borg.has[] is indexed by object kind, so BI_CURHP is treated as a…**

Checked 2026-11-05; borg-rs group(s) 1.

Pinned source references:

- [C src/borg/borg-fight-defend.c:2474–2659](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-defend.c#L2474-L2659) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:15–19](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L15-L19) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:15–19](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L15-L19)

> `using_artifact = borg_equips_item(act_loskill, true) && borg.has[BI_CURHP] > 100;`
>   `borg.has[]` is indexed by object kind, so `BI_CURHP` is treated as a
>   k_idx. The test reads how many of some unrelated object kind the Borg
>   carries, when the intended check is surely "current HP > 100" (as the
>   comment-free sibling checks elsewhere do with `borg.trait[BI_CURHP]`).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0022

**borg_init_item_val, all seeds, startup: sv_wand_confuse_monster is looked up as "Scare Monster" (the same as sv_wand_fear_monster) and sv_wand_elec…**

Checked 2026-11-05; borg-rs group(s) 2.

Pinned source references:

- [C src/borg/borg-item-val.c:261–516](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-val.c#L261-L516) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:25–30](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L25-L30) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:25–30](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L25-L30)

> `borg-item-val.c`, `borg_init_item_val`, all seeds, startup:
>   `sv_wand_confuse_monster` is looked up as "Scare Monster" (the same as
>   `sv_wand_fear_monster`) and `sv_wand_elec_ball` as "Lightning Bolts" (the
>   same as `sv_wand_elec_bolt`); copy-and-paste slips. `sv_mush_cure_mind` is
>   "Clear Mind" like `sv_mush_mana` and `sv_potion_berserk` is looked up twice
>   (both harmless). Kept as is in `borg_item_val.rs`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0023

**adjust_order_operations(): the blocks passed to adjust_order_ops_depth_block(f, pdepth, start, itoken - 1) are scanned with tok < end, so the last…**

Checked 2026-11-05; borg-rs group(s) 3.

Pinned source references:

- [C src/borg/borg-formulas-calc.c:445–471](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas-calc.c#L445-L471) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:34–40](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L34-L40) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:34–40](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L34-L40)

> borg-formulas-calc.c, `adjust_order_operations()`: the blocks passed to
>   `adjust_order_ops_depth_block(f, pdepth, start, itoken - 1)` are scanned
>   with `tok < end`, so the last token of each block is never looked at.
>   Harmless for well-formed formulas (a block ends in a value); a malformed
>   one such as `(1 + 2 +) 3` parses and evaluates to 3 with "error
>   calculating a formula value" notes. Only with `borg_uses_dynamic_calcs`;
>   not seen in any suite. Pinned by a unit test in `borg_formulas_calc.rs`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0024

**Light-coordinate lists can contain duplicate grids**

Checked 2026-11-05; borg-rs group(s) 4.

Pinned source references:

- [C src/borg/borg-cave-light.c:69–223](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-cave-light.c#L69-L223) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:45–52](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L45-L52) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:45–52](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L45-L52)

> The "East" block lights (y, x+2), (y+1, x+2), (y-1, x+2), but the "West"
>   block lights (y, x-2), (y+2, x-2), (y-2, x-2) instead of (y+1, x-2) and
>   (y-1, x-2). So (y+-1, x-2) never get `BORG_LIGHT`, and (y+-2, x-2) can be
>   added a second time to `borg_light_x/y` (already added by the South/North
>   blocks), contrary to the macro's comment. Also, with radius 4+ the four
>   (y+-3, x+-3) grids can be entered twice (once by the diagonal checks and
>   once by the box scan). Duplicates only make readers of the array
>   (`borg_flow_dark`, `borg_update`) visit a grid twice.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0025

**borg_init_spell(), all caster seeds, startup: spell->status = spell_okay_to_cast(player, spell_num); stores a bool in a field that holds BORG_MAGIC…**

Checked 2026-11-05; borg-rs group(s) 5.

Pinned source references:

- [C src/borg/borg-magic.c:744–766](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L744-L766) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:57–63](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L57-L63) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:57–63](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L57-L63)

> `borg-magic.c`, `borg_init_spell()`, all caster seeds, startup:
>   `spell->status = spell_okay_to_cast(player, spell_num);` stores a `bool`
>   in a field that holds `BORG_MAGIC_*` values, so a spell starts as 0
>   (`BORG_MAGIC_ICKY`) or 1 (`BORG_MAGIC_LOST`) until
>   `borg_cheat_spells()` sees its book in the pack. Harmless in practice:
>   every reader also requires the book to be carried, and carried books are
>   re-cheated first.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0026

**borg_cheat_spells() resets borg.book_idx[0..9] but only cheats books 0..7 (book_idx < 8); no class has a ninth book.**

Checked 2026-11-05; borg-rs group(s) 5.

Pinned source references:

- [C src/borg/borg-magic.c:677–718](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L677-L718) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:64–65](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L64-L65) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:64–65](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L64-L65)

> `borg_cheat_spells()` resets `borg.book_idx[0..9]` but only cheats books
>   0..7 (`book_idx < 8`); no class has a ninth book.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0027

**borg_spell_stat() tests &books[0].spells[0] != NULL, which is always true.**

Checked 2026-11-05; borg-rs group(s) 5.

Pinned source references:

- [C src/borg/borg-magic.c:239–249](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic.c#L239-L249) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:66–67](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L66-L67) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:66–67](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L66-L67)

> `borg_spell_stat()` tests `&books[0].spells[0] != NULL`, which is always
>   true.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0028

**Three callers pass format(...) as the error argument of borg_formula_error(): "value type (first parameter '%s') not found" and (twice) "value erro…**

Checked 2026-11-05; borg-rs group(s) 6.

Pinned source references:

- [C src/borg/borg-formulas.c:123–132](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas.c#L123-L132) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:75–85](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L75-L85) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:75–85](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L75-L85)

> Three callers pass `format(...)` as the `error` argument of
>   `borg_formula_error()`: "value type (first parameter '%s') not found" and
>   (twice) "value error for object type '%s' subtype '%s'". `format()`
>   returns its static buffer, and `borg_formula_error()` formats its own
>   notes with `format()` before it notes `error`. So the error note repeats
>   the "** error for section value '...'" note and the caller's message is
>   never shown. (That message also has an off-by-one: it prints
>   `value_type_names[t].name`, but the table starts at `VT_NONE`, so it is
>   the name of type `t - 1`, e.g. 'scroll' for a potion.) If the "error on
>   line" note grew `format()`'s buffer (a line of more than ~1000 bytes), C
>   would read freed memory instead; the Rust port assumes it does not.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0029

**parse_range(), only with borg_uses_dynamic_calcs**

Checked 2026-11-05; borg-rs group(s) 7.

Pinned source references:

- [C src/borg/borg-formulas.c:273–345](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-formulas.c#L273-L345) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:91–95](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L91-L95) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:91–95](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L91-L95)

> borg-formulas.c, `parse_range()`, only with `borg_uses_dynamic_calcs`.
>   A missing ')' is reported as "** first value is not a number", and a first
>   value that really is not a number fails with no note at all, so the
>   formulas are turned off silently. (The section printed in these errors is
>   cut at the ',', where C wrote a NUL.) Kept as is.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0030

**Spell stat: the last tier is 20 * 100L + 6 * 300L + (s - 26) * 5L; the tier below it starts from 20 * 400L**

Checked 2026-11-05; borg-rs group(s) 8.

Pinned source references:

- [C src/borg/borg-home-power.c:33–352](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-power.c#L33-L352) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:101–103](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L101-L103) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:101–103](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L101-L103)

> Spell stat: the last tier is `20 * 100L + 6 * 300L + (s - 26) * 5L`; the
>   tier below it starts from `20 * 400L`. So the home value of the spell stat
>   falls from 9500 at +25 to 3800 at +26, surely meant to be `20 * 400L`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0031

**Amulets: if (num_neck > 3) ..**

Checked 2026-11-05; borg-rs group(s) 8.

Pinned source references:

- [C src/borg/borg-home-power.c:33–352](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-power.c#L33-L352) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:104–106](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L104-L106) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:104–106](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L104-L106)

> Amulets: `if (num_neck > 3) ... else if (num_neck > 3) value -= (num_neck
>   - 3) * 700L;` repeats the condition, so the 700 penalty never applies
>   (the other item types use a lower second threshold, e.g. rings 6 / 4).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0032

**borg_play_magic(), every call (study and town spell testing): if (borg_grids[borg.c.y][borg.c.x].info == BORG_DARK) compares the whole info byte, s…**

Checked 2026-11-05; borg-rs group(s) 9.

Pinned source references:

- [C src/borg/borg-magic-play.c:88–229](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-magic-play.c#L88-L229) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:111–117](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L111-L117) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:111–117](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L111-L117)

> `borg-magic-play.c`, `borg_play_magic()`, every call (study and town
>   spell testing): `if (borg_grids[borg.c.y][borg.c.x].info == BORG_DARK)`
>   compares the whole info byte, so the "Dark" early return only fires when
>   `BORG_DARK` is the grid's only flag. Every other reader of `BORG_DARK`
>   (borg-commands.c, borg-think-dungeon-util.c) tests the bit. The player's
>   grid normally also has `BORG_VIEW`/`BORG_MARK` etc., so in practice the
>   check almost never triggers; `BI_LIGHT` is the real guard.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0033

**borg_prepared() calls borg_restock() first and returns "Clevel < depth" when max clevel < depth (below 50), so in borg_prepared_aux(): "1 Lite" and…**

Checked 2026-11-05; borg-rs group(s) 10.

Pinned source references:

- [C src/borg/borg-prepared.c:538–686](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L538-L686) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:126–134](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L126-L134) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:126–134](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L126-L134)

> `borg_prepared()` calls `borg_restock()` first and returns "Clevel <
>   depth" when `max clevel < depth` (below 50), so in `borg_prepared_aux()`:
>   "1 Lite" and "5 Fuel" (light 0 is already "restock light radius < 1"),
>   "2 tele + teleport staffs" (same test as "restock tele + tele staff < 2")
>   and the dlevel 10-19 class checks "dlevel - 4 >= clevel" and "dlevel >=
>   clevel" never fire. "2 cures (clw + csw + ccw)" repeats the "2 cure"
>   test exactly. The level-100 block ("10 restore mana", which tests for 15,
>   "5 Heal", "15 *heal* or life", "10 speed potions") is dead because
>   `borg_prepared_aux()` is only called for `depth <= 99`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0034

**borg_restock(): "restock fuel" and "restock fuel < 2" need light 0, which already returned "restock light radius < 1".**

Checked 2026-11-05; borg-rs group(s) 10.

Pinned source references:

- [C src/borg/borg-prepared.c:694–826](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L694-L826) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:135–136](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L135-L136) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:135–136](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L135-L136)

> `borg_restock()`: "restock fuel" and "restock fuel < 2" need light 0,
>   which already returned "restock light radius < 1".


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0035

**"Scumming *Heal* potions (%d to go)" tests the home counts from before borg_notice_home() but prints 10 - num_ezheal from after it, and ignores the…**

Checked 2026-11-05; borg-rs group(s) 10.

Pinned source references:

- [C src/borg/borg-prepared.c:538–686](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-prepared.c#L538-L686) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:137–139](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L137-L139) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:137–139](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L137-L139)

> "Scumming *Heal* potions (%d to go)" tests the home counts from before
>   `borg_notice_home()` but prints `10 - num_ezheal` from after it, and
>   ignores the Life potions and the ones carried.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0036

**borg_reincarnate_start(), only when the Borg respawns (game option cheat_live on and borg_cheat_death off, or borg_respawn_winners)**

Checked 2026-11-05; borg-rs group(s) 11.

Pinned source references:

- [C src/borg/borg-reincarnate.c:304–362](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-reincarnate.c#L304-L362) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:143–152](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L143-L152) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:143–152](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L143-L152)

> `borg-reincarnate.c`, `borg_reincarnate_start()`, only when the Borg
>   respawns (game option `cheat_live` on and `borg_cheat_death` off, or
>   `borg_respawn_winners`). It types `all_letters[race]` and
>   `all_letters[class]`, but the birth menus use `all_letters_nohjkl`
>   (ui-birth.c). So index 7 (Half-Troll, Ranger) types 'h', which is no
>   menu letter, and indexes 8 and up select the entry before the one meant
>   (race 8, Dunadan, types 'i' and gets a Half-Troll; class 8, Blackguard,
>   gets the Ranger; race 10, Kobold, types 'k', no menu letter either).
>   The random name is still made for the race meant. Seen in local respawn
>   runs (seed 1011: race 8 chosen, a Half-Troll with a human name rolled).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0037

**Sustains on items: the five of_has(item->flags, OF_SUST_*) tests all add to num_sustain_str, so num_sustain_int/wis/dex/con only ever count the pla…**

Checked 2026-11-05; borg-rs group(s) 12.

Pinned source references:

- [C src/borg/borg-home-notice.c:343–932](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-notice.c#L343-L932) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:158–161](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L158-L161) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:158–161](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L158-L161)

> Sustains on items: the five `of_has(item->flags, OF_SUST_*)` tests all
>   add to `num_sustain_str`, so `num_sustain_int/wis/dex/con` only ever count
>   the player's own race/class sustains (added at the end with `rf_has`),
>   and `borg_power_home()` sees too many STR sustains.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0038

**num_genocide is reset but never counted (scrolls of Banishment are not looked for), so the home power reward for them is always 0**

Checked 2026-11-05; borg-rs group(s) 12.

Pinned source references:

- [C src/borg/borg-home-notice.c:343–932](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-home-notice.c#L343-L932) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:162–164](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L162-L164) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:162–164](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L162-L164)

> `num_genocide` is reset but never counted (scrolls of Banishment are not
>   looked for), so the home power reward for them is always 0. (The
>   `num_brand_weapon` global is never written at all.)


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0039

**borg_write_map(): "Your hands are glowing dull red." tests TMD_CONFUSED again (it meant a different timed effect), so a confused Borg's map dump pr…**

Checked 2026-11-05; borg-rs group(s) 13.

Pinned source references:

- [C src/borg/borg-log.c:145–669](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L145-L669) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:170–172](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L170-L172) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:170–172](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L170-L172)

> `borg_write_map()`: "Your hands are glowing dull red." tests
>   `TMD_CONFUSED` again (it meant a different timed effect), so a confused
>   Borg's map dump prints both lines. Seen in the full suite's death maps.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0040

**borg_display_status(): for "Demon" and "Dragon" the slay's blue is always overwritten (if (WS) blue; if (WK) green; else slate;), so a plain slay s…**

Checked 2026-11-05; borg-rs group(s) 13.

Pinned source references:

- [C src/borg/borg-log.c:775–1326](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-log.c#L775-L1326) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:178–180](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L178-L180) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:178–180](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L178-L180)

> `borg_display_status()`: for "Demon" and "Dragon" the slay's blue is
>   always overwritten (`if (WS) blue; if (WK) green; else slate;`), so a
>   plain slay shows as slate.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0041

**Harmless, same file: borg_react_prompted() returns key (a pointer) from a bool function in three places; it is never NULL, so this is just true.**

Checked 2026-11-05; borg-rs group(s) 14.

Pinned source references:

- [C src/borg/borg-messages-react.c:95–324](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-messages-react.c#L95-L324) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:194–196](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L194-L196) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:194–196](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L194-L196)

> Harmless, same file: `borg_react_prompted()` returns `key` (a pointer)
>   from a `bool` function in three places; it is never NULL, so this is
>   just `true`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0042

**borg_object_fully_id(), by code reading**

Checked 2026-11-05; borg-rs group(s) 15.

Pinned source references:

- [C src/borg/borg-item-id.c:38–138](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-id.c#L38-L138) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:201–209](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L201-L209) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:201–209](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L201-L209)

> `borg-item-id.c`, `borg_object_fully_id()`, by code reading. The loop
>   runs to `QUIVER_END`, and every slot from `INVEN_WIELD` up is selected
>   with `'/'` and `all_letters_nohjkl[i - INVEN_WIELD]`. For a quiver slot
>   that is index 12 and up ('q', 'r', ...), past the 12 equipment slots;
>   the quiver is selected with `'|'` and digits (as `borg_deinscribe()`
>   does). Only a quiver item with tval in `TV_BOW..TV_RING` (a throwing
>   weapon) that is an artifact or an ego with a random power is affected,
>   and the function is only called from the Borg's debug commands
>   (`borg-commands.c`), so no suite reaches it.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0043

**borg_slot(): the "Prefer largest pval (even if smaller pile)" test skips an item only when item->iqty > borg_items[n].iqty, but the "Prefer smalles…**

Checked 2026-11-05; borg-rs group(s) 16.

Pinned source references:

- [C src/borg/borg-inventory.c:88–127](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-inventory.c#L88-L127) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:215–219](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L215-L219) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:215–219](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L215-L219)

> `borg_slot()`: the "Prefer largest pval (even if smaller pile)" test
>   skips an item only when `item->iqty > borg_items[n].iqty`, but the
>   "Prefer smallest pile" test just before has already skipped every such
>   item. So pval is never compared: of equally small piles the last one
>   wins.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0044

**borg_first_empty_inventory_slot() scans down from the last pack slot for the last used one and returns the slot after it**

Checked 2026-11-05; borg-rs group(s) 16.

Pinned source references:

- [C src/borg/borg-inventory.c:255–267](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-inventory.c#L255-L267) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:220–224](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L220-L224) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:220–224](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L220-L224)

> `borg_first_empty_inventory_slot()` scans down from the last pack slot
>   for the last used one and returns the slot after it. With an empty pack
>   there is no used slot and it returns -1 ("no room"), not 0, so the
>   buy/wear/remove code that needs a hole gives up. (Unlikely in play:
>   the Borg nearly always carries something.)


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0045

**LOSE_CON blows add the "below 8" fear when BI_CSTR < 8 (strength).**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:233](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L233) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:233](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L233)

> LOSE_CON blows add the "below 8" fear when `BI_CSTR < 8` (strength).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0046

**HURT: the stun test z > d_dice * d_side comes right after z = d_dice * d_side, so it is never true (dead code).**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:234–235](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L234-L235) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:234–235](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L234-L235)

> HURT: the stun test `z > d_dice * d_side` comes right after
>     `z = d_dice * d_side`, so it is never true (dead code).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0047

**The hit chance 150 - ((ac * 300) / 4 / 1 + (level + power) * 3) is below 5 for any armour class of 2 or more, so partial damage (full_damage == fal…**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:236–238](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L236-L238) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:236–238](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L236-L238)

> The hit chance `150 - ((ac * 300) / 4 / 1 + (level + power) * 3)` is
>     below 5 for any armour class of 2 or more, so partial damage
>     (`full_damage == false`) is always 5% of the blow damage.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0048

**bolt is set by the first bolt spell and never reset, so every later spell of the same monster (bolt or not) has its damage zeroed when the monster…**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:240–242](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L240-L242) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:240–242](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L240-L242)

> `bolt` is set by the first bolt spell and never reset, so every later
>     spell of the same monster (bolt or not) has its damage zeroed when the
>     monster has no clean shot at the Borg.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0049

**The summon cases' grid scan assigns to the x/y parameters (harmless: not read again)**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:243–247](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L243-L247) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:243–247](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L243-L247)

> The summon cases' grid scan assigns to the `x`/`y` parameters
>     (harmless: not read again). S_HI_DRAGON with protection from evil
>     adds no fear before dividing; S_AINU tests `borg.near.unique` in both
>     the first and the (then dead) second branch. STORM ends with a no-op
>     `if (borg.trait[BI_RCONF]) break;`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0050

**The second borg_crush_spell block (in the ranged part) clears v1 again instead of v2.**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:249–250](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L249-L250) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:249–250](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L249-L250)

> The second `borg_crush_spell` block (in the ranged part) clears `v1`
>     again instead of `v2`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0051

**The Teleport Other skip list is read with ii <= borg_tp_other_n, one entry past the count.**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:251–252](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L251-L252) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:251–252](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L251-L252)

> The Teleport Other skip list is read with `ii <= borg_tp_other_n`, one
>     entry past the count.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0052

**The first move simulation tests feat == FEAT_GRANITE, the second feat >= FEAT_GRANITE (so it also treats terrain above the permanent wall, e.g**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:64–545](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L64-L545) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:253–255](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L253-L255) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:253–255](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L253-L255)

> The first move simulation tests `feat == FEAT_GRANITE`, the second
>     `feat >= FEAT_GRANITE` (so it also treats terrain above the permanent
>     wall, e.g. lava and passable rubble, as wall).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0053

**borg_danger() overwrites its full_damage argument with true, so the partial-damage paths above are only reached through direct borg_danger_one_kill…**

Checked 2026-11-05; borg-rs group(s) 17.

Pinned source references:

- [C src/borg/borg-danger.c:2824–2865](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-danger.c#L2824-L2865) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:256–258](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L256-L258) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:256–258](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L256-L258)

> `borg_danger()` overwrites its `full_damage` argument with `true`, so the
>   partial-damage paths above are only reached through direct
>   `borg_danger_one_kill(..., false)` calls.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0054

**"Give credit for stat bonuses" tests of_has(item->flags, STAT_STR) ..**

Checked 2026-11-05; borg-rs group(s) 18.

Pinned source references:

- [C src/borg/borg-item-analyze.c:43–261](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-analyze.c#L43-L261) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:265–271](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L265-L271) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:265–271](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L265-L271)

> "Give credit for stat bonuses" tests `of_has(item->flags, STAT_STR)` ...
>   `of_has(item->flags, STAT_CON)`: stat indices (0..4) used as object flag
>   numbers. `STAT_STR` is 0 = `FLAG_END`, which `flag_has()` always reports
>   as unset; `STAT_INT`..`STAT_CON` (1..4) are `OF_SUST_STR`..`OF_SUST_DEX`.
>   So no stat bonus is ever credited (stat boosts are modifiers, not flags),
>   while a known STR/INT/WIS/DEX sustain adds `pval * 200` to the value of
>   an item that has a pval (and a CON sustain does not).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0055

**borg_flow_take(), borg_flow_take_scum(), borg_flow_take_lunal(): the "nearest up stairs" scan skips a stair when b_j >= j, so it keeps the *farthes…**

Checked 2026-11-05; borg-rs group(s) 19, 31.

Pinned source references:

- [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:277–280](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L277-L280) — reported C observation; not an independent validation
- [borg-rs docs/c-bugs.md:533–536](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L533-L536) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:277–280](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L277-L280)

> `borg_flow_take()`, `borg_flow_take_scum()`, `borg_flow_take_lunal()`:
>   the "nearest up stairs" scan skips a stair when `b_j >= j`, so it keeps
>   the *farthest* up staircase (the first of equally far ones). The leash
>   and "too far from the stairs" tests use that one.

[borg-rs docs/c-bugs.md:533–536](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L533-L536)

> `borg_flow_dark()`: the "nearest up stairs" scan skips a stair when
>   `b_j >= j`, so it keeps the *farthest* up staircase (the first of
>   equally far ones), as in borg-flow-take.c (section 19). Every method's
>   "too far from the stairs" test uses that one.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0056

**if (!k_ptr) continue; tests &k_info[take->kidx], which is never NULL, so dead entries below borg_takes_nxt are not skipped: their location (0,0) be…**

Checked 2026-11-05; borg-rs group(s) 19.

Pinned source references:

- [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:282–285](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L282-L285) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:282–285](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L282-L285)

> `if (!k_ptr) continue;` tests `&k_info[take->kidx]`, which is never
>     NULL, so dead entries below `borg_takes_nxt` are not skipped: their
>     location (0,0) becomes a target like any other (when in view and not
>     too far from the stairs).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0057

**item_bad is worked out (with its "Lunal Item" notes) but never read: every entry that passes the view and stairs tests is a target, worthless ones…**

Checked 2026-11-05; borg-rs group(s) 19.

Pinned source references:

- [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:286–288](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L286-L288) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:286–288](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L286-L288)

> `item_bad` is worked out (with its "Lunal Item" notes) but never
>     read: every entry that passes the view and stairs tests is a target,
>     worthless ones (value <= 0) included.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0058

**borg_follow_take(): an object under the Borg is deleted, but the function goes on with the wiped entry: the "on screen" test reads grid (0,0), and…**

Checked 2026-11-05; borg-rs group(s) 19.

Pinned source references:

- [C src/borg/borg-flow-take.c:155–194](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L155-L194) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:291–295](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L291-L295) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:291–295](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L291-L295)

> `borg_follow_take()`: an object under the Borg is deleted, but the
>   function goes on with the wiped entry: the "on screen" test reads grid
>   (0,0), and if that grid is `BORG_OKAY` (and no monster on the object's
>   old grid stops it) it notes "There was an object ..." and deletes the
>   entry again (a no-op). Only an extra note.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0059

**observe_take_move(): the attr test only applies when the kind's char is '!' and its attr is not 11; for every other kind the attr is not compared a…**

Checked 2026-11-05; borg-rs group(s) 19.

Pinned source references:

- [C src/borg/borg-flow-take.c:426–586](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-take.c#L426-L586) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:296–298](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L296-L298) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:296–298](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L296-L298)

> `observe_take_move()`: the attr test only applies when the kind's char
>   is `'!'` and its attr is not 11; for every other kind the attr is not
>   compared at all.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0060

**The device fail check 100 * ((skill - lev) - 140) / ((lev - skill) - 90) (rods, staffs, rings, borg_activate_failure) divides by zero when the item…**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:1008–1045](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L1008-L1045) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:304–308](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L304-L308) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:304–308](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L304-L308)

> The device fail check `100 * ((skill - lev) - 140) / ((lev - skill) - 90)`
>   (rods, staffs, rings, `borg_activate_failure`) divides by zero when the
>   item level is exactly 90 above the device skill (a crash in C, a panic
>   in Rust). Only `borg_equips_dragon()` guards against it. Needs a very
>   low skill (e.g. a confused low-level character) and a level 90+ device.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0061

**borg_quaff_crit(): "Avoid drinking CCW twice in a row" returns false (74 times in 100) when the last CCW was quaffed *more* than 4 game turns ago;…**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:46–72](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L46-L72) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:309–311](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L309-L311) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:309–311](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L309-L311)

> `borg_quaff_crit()`: "Avoid drinking CCW twice in a row" returns false
>   (74 times in 100) when the last CCW was quaffed *more* than 4 game turns
>   ago; the extra `borg_timer(..) > 0` test is implied by `> 4`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0062

**borg_equips_ring() / borg_activate_ring() loop from INVEN_RIGHT to < INVEN_LEFT, so only the right ring is ever checked.**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:726–776](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L726-L776) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:312–313](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L312-L313) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:312–313](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L312-L313)

> `borg_equips_ring()` / `borg_activate_ring()` loop from `INVEN_RIGHT`
>   to `< INVEN_LEFT`, so only the right ring is ever checked.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0063

**borg_use_staff_fail(): the "desperation" Teleportation branch tests fail > 500 again inside fail > 500, so a not-confused, not-blind Borg always gi…**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:578–632](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L578-L632) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:314–318](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L314-L318) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:314–318](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L314-L318)

> `borg_use_staff_fail()`: the "desperation" Teleportation branch tests
>   `fail > 500` again inside `fail > 500`, so a not-confused, not-blind Borg
>   always gives up there. `borg_equips_staff_fail()` does the opposite: a
>   not-confused Borg gives up when `500 < fail < 650` but accepts the
>   staff when its chance is even worse (`fail >= 650`).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0064

**borg_eat_food_any(): "when hurting" is CURHP < 4 || CURHP <= MAXHP, which is true whenever current HP is not above the maximum (so nearly always).**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:325–407](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L325-L407) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:319–321](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L319-L321) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:319–321](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L319-L321)

> `borg_eat_food_any()`: "when hurting" is `CURHP < 4 || CURHP <= MAXHP`,
>   which is true whenever current HP is not above the maximum (so nearly
>   always).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0065

**borg_use_things(): the Enlightenment potion branch only breaks (never quaffs); the comment says "Check the scroll".**

Checked 2026-11-05; borg-rs group(s) 20.

Pinned source references:

- [C src/borg/borg-item-use.c:1050–1176](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-use.c#L1050-L1176) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:322–323](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L322-L323) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:322–323](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L322-L323)

> `borg_use_things()`: the Enlightenment potion branch only `break`s
>   (never quaffs); the comment says "Check the scroll".


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0066

**"Pass on the swap which yields the best result" keeps the *higher* danger: if (b_p1 <= b_p2) b_p = b_p2 (weapon) else b_p = b_p1 (armour)**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:329–331](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L329-L331) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:329–331](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L329-L331)

> "Pass on the swap which yields the best result" keeps the *higher*
>     danger: `if (b_p1 <= b_p2) b_p = b_p2 (weapon) else b_p = b_p1
>     (armour)`. So with both swaps the worse one is weighed and worn.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0067

**With an armour swap and no weapon swap, b_p2 stays 0, so an armour danger of 0 picks swap = weapon_swap - 1 = -1 and the key is all_letters_nohjkl[…**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:332–337](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L332-L337) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:332–337](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L332-L337)

> With an armour swap and no weapon swap, `b_p2` stays 0, so an armour
>     danger of 0 picks `swap = weapon_swap - 1 = -1` and the key is
>     `all_letters_nohjkl[-1]`, the byte before the array. In the C and the
>     Rust harness binaries that byte is alignment padding (0, checked with
>     `objdump`), so `borg_keypress` refuses it ("BAD KEY" note) and only the
>     `'w'` is queued.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0068

**The i == -1 fixes are dead (the swap index is non-zero there).**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:534–728](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L534-L728) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:338](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L338) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:338](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L338)

> The `i == -1` fixes are dead (the swap index is non-zero there).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0069

**borg_one_step_wearing_best(): int skipping = skip; sits inside the loop, so it is reset on every pass**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:1077–1207](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L1077-L1207) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:339–343](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L339-L343) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:339–343](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L339-L343)

> `borg_one_step_wearing_best()`: `int skipping = skip;` sits inside the
>   loop, so it is reset on every pass. With `skip > 0` (inventory or home
>   full) every remaining entry is skipped instead of only `skip` of them:
>   the function returns false (or, when it ends on an empty entry, clears
>   the list but keeps `do_best`), so "try the next change" never tries one.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0070

**borg_best_stuff_aux(): the "don't test the same item in both ring slots" test for INVEN_LEFT (order 8) reads test[n + 1], the INVEN_RIGHT entry (or…**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:1212–1321](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L1212-L1321) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:344–348](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L344-L348) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:344–348](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L344-L348)

> `borg_best_stuff_aux()`: the "don't test the same item in both ring
>   slots" test for `INVEN_LEFT` (order 8) reads `test[n + 1]`, the
>   `INVEN_RIGHT` entry (order 9), which is only written deeper in the
>   recursion: it holds the last right ring of the previous subtree, so a
>   left-ring candidate equal to it is skipped for no reason.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0071

**borg_wear_stuff(): track_worn_time is an int16_t, so borg.time.now is truncated; once the time passes 32767 the "worn more than 10 turns ago" test…**

Checked 2026-11-05; borg-rs group(s) 21.

Pinned source references:

- [C src/borg/borg-item-wear.c:745–1037](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-wear.c#L745-L1037) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:349–352](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L349-L352) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:349–352](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L349-L352)

> `borg_wear_stuff()`: `track_worn_time` is an `int16_t`, so
>   `borg.time.now` is truncated; once the time passes 32767 the "worn
>   more than 10 turns ago" test is true at once. The test itself skips an
>   artifact worn on this level *more* than 10 turns ago (not recently).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0072

**borg_light_beam(): "Don't do it if on the edge of shifting the panel" compares the Borg's absolute dungeon row borg.c.y with the panel height (borg…**

Checked 2026-11-05; borg-rs group(s) 22.

Pinned source references:

- [C src/borg/borg-light.c:683–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L683-L835) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:358–363](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L358-L363) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:358–363](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L358-L363)

> `borg_light_beam()`: "Don't do it if on the edge of shifting the panel"
>   compares the Borg's absolute dungeon row `borg.c.y` with the panel
>   height (`borg.c.y > borg_panel_hgt() - 2`), not its row on the panel,
>   and uses that same "bottom edge" test for north (`dir == 8`) and south
>   (`dir == 2`). So a north or south beam is only ever cast in the top
>   rows of the dungeon (`borg.c.y <= borg_panel_hgt() - 2`).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0073

**borg_light_beam(): the west test starts at step 1 while north, south and east start at step 0 (the Borg's own grid), so with a light radius of 0 th…**

Checked 2026-11-05; borg-rs group(s) 22.

Pinned source references:

- [C src/borg/borg-light.c:683–835](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L683-L835) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:364–367](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L364-L367) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:364–367](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L364-L367)

> `borg_light_beam()`: the west test starts at step 1 while north, south
>   and east start at step 0 (the Borg's own grid), so with a light radius
>   of 0 the west loop never runs and never picks direction 4. The
>   `blocked == false` test inside each loop is always true there.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0074

**borg_refuel_lantern(): with no flask of oil, the lantern scan starts at borg_slot(TV_LIGHT, sv_light_lantern), which (lanterns do not stack, all pi…**

Checked 2026-11-05; borg-rs group(s) 22.

Pinned source references:

- [C src/borg/borg-light.c:552–608](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-light.c#L552-L608) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:368–373](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L368-L373) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:368–373](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L368-L373)

> `borg_refuel_lantern()`: with no flask of oil, the lantern scan starts
>   at `borg_slot(TV_LIGHT, sv_light_lantern)`, which (lanterns do not
>   stack, all piles are 1) is the *last* lantern in the pack. Only that one
>   is checked: if it is Everburning or empty, the next slot is not a
>   lantern (or the pack ends) and no lantern is used, even when an earlier
>   lantern has fuel.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0075

**BI_FIRST_CURSED is set by borg_notice() in the order equipment, quiver, inventory, so in the quiver branch BORG_EQUIP is never set and the BI_WHERE…**

Checked 2026-11-05; borg-rs group(s) 23.

Pinned source references:

- [C src/borg/borg-item-decurse.c:111–156](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L111-L156) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:378–381](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L378-L381) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:378–381](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L378-L381)

> `BI_FIRST_CURSED` is set by `borg_notice()` in the order equipment,
>   quiver, inventory, so in the quiver branch `BORG_EQUIP` is never set and
>   the `BI_WHERE_CURSED & BORG_EQUIP` test for the `'|'` key is dead (the
>   `& 1` next to it is `BORG_INVEN` written as a literal).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0076

**A cursed ammo stack in the pack (outside the quiver) sets BORG_QUILL, not BORG_INVEN**

Checked 2026-11-05; borg-rs group(s) 23.

Pinned source references:

- [C src/borg/borg-item-decurse.c:111–156](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L111-L156) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:382–384](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L382-L384) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:382–384](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L382-L384)

> A cursed ammo stack in the pack (outside the quiver) sets `BORG_QUILL`,
>   not `BORG_INVEN`. With such a stack and a cursed quiver slot first, no
>   `'|'` is sent although the item prompt can open on the pack.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0077

**borg_decurse_armour() / borg_decurse_weapon() send all_letters_nohjkl[swap - 1] without checking the swap: with a decurse_*_swap flag but *_swap ==…**

Checked 2026-11-05; borg-rs group(s) 23.

Pinned source references:

- [C src/borg/borg-item-decurse.c:37–69](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-decurse.c#L37-L69) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:385–389](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L385-L389) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:385–389](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L385-L389)

> `borg_decurse_armour()` / `borg_decurse_weapon()` send
>   `all_letters_nohjkl[swap - 1]` without checking the swap: with a
>   `decurse_*_swap` flag but `*_swap == 0` (not left behind by
>   `borg_notice_*_swap`, which clears the flag when there is no swap) C
>   would read the byte before the array (padding, 0, see section 21).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0078

**borg_update_kill_old(): the "unique is dead" fix-up writes borg_race_death[i] with the *kill* index i, not the race index.**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:243–383](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L243-L383) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:394–395](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L394-L395) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:394–395](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L394-L395)

> `borg_update_kill_old()`: the "unique is dead" fix-up writes
>   `borg_race_death[i]` with the *kill* index `i`, not the race index.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0079

**borg_new_kill(): r_ptr is taken from the slot's race *before* kill->r_idx is set, so the "force the grid to floor / granite" step at the end uses t…**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:709–850](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L709-L850) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:396–399](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L396-L399) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:396–399](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L396-L399)

> `borg_new_kill()`: `r_ptr` is taken from the slot's race *before*
>   `kill->r_idx` is set, so the "force the grid to floor / granite" step at
>   the end uses the old race of the slot (race 0 for a wiped slot, or a
>   stale race when `borg_kills_nxt` was reset without wiping the array).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0080

**borg_follow_kill(): randint1(100) < 1 is never true (but still draws a random number)**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:529–704](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L529-L704) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:400–404](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L400-L404) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:400–404](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L400-L404)

> `borg_follow_kill()`: `randint1(100) < 1` is never true (but still draws
>   a random number). The "delete monsters that did not really move" test
>   compares `kill->pos` with `oy`/`ox` before the position is changed, so
>   every path that gets past the earlier checks deletes the monster; the
>   code that moves it to the guessed grid is dead.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0081

**observe_kill_move(): for a unique, d = d * 2 changes the parameter, so the allowed distance stays doubled (and doubles again per unique) for the re…**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:243–383](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L243-L383) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:405–407](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L405-L407) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:405–407](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L405-L407)

> `observe_kill_move()`: for a unique, `d = d * 2` changes the parameter,
>   so the allowed distance stays doubled (and doubles again per unique) for
>   the rest of the scan.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0082

**borg_flow_kill(): hall_walls and skip_monster are set up once, not per monster**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:1651–1917](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1651-L1917) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:408–411](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L408-L411) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:408–411](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L408-L411)

> `borg_flow_kill()`: `hall_walls` and `skip_monster` are set up once,
>   not per monster. `hall_walls` keeps counting from the Borg's own
>   surroundings, and once one monster sets `skip_monster` every later
>   monster in the list is skipped too.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0083

**borg_flow_kill_aim(): the "next to a monster" check scans slot 0 and dead slots too (their stale or (0,0) positions).**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:1951–2035](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1951-L2035) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:412–413](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L412-L413) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:412–413](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L412-L413)

> `borg_flow_kill_aim()`: the "next to a monster" check scans slot 0 and
>   dead slots too (their stale or (0,0) positions).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0084

**borg_shoot_scoot_safe(): the danger of an adjacent monster is borg_danger_one_kill(..., i, ...) with i the *direction* index (0..7), not the monste…**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:2882–3084](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L2882-L3084) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:414–416](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L414-L416) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:414–416](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L414-L416)

> `borg_shoot_scoot_safe()`: the danger of an adjacent monster is
>   `borg_danger_one_kill(..., i, ...)` with `i` the *direction* index
>   (0..7), not the monster's kill index `ag->kill`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0085

**borg_init_flow_kill(): the "extract dead uniques" cheat says "skip non-uniques" but skips uniques, so it marks non-unique races with max_num == 0 (…**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:3300–3339](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L3300-L3339) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:417–420](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L417-L420) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:417–420](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L417-L420)

> `borg_init_flow_kill()`: the "extract dead uniques" cheat says "skip
>   non-uniques" but skips uniques, so it marks non-unique races with
>   `max_num == 0` (`borg_update()` redoes the unique check on each new
>   level).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0086

**borg_locate_kill(): my_strnicmp(who, "It", 2) treats any name that starts with "it" (any case) as an invisible monster.**

Checked 2026-11-05; borg-rs group(s) 24.

Pinned source references:

- [C src/borg/borg-flow-kill.c:1274–1626](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-kill.c#L1274-L1626) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:421–422](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L421-L422) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:421–422](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L421-L422)

> `borg_locate_kill()`: `my_strnicmp(who, "It", 2)` treats any name that
>   starts with "it" (any case) as an invisible monster.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0087

**borg_pick_weapon() decides whether to send '/' (to equipment) or '|' (to quiver) by looking for bows, diggers, hafted weapons, polearms and swords…**

Checked 2026-11-05; borg-rs group(s) 25.

Pinned source references:

- [C src/borg/borg-item-enchant.c:73–107](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-enchant.c#L73-L107) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:428–436](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L428-L436) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:428–436](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L428-L436)

> `borg_pick_weapon()` decides whether to send `'/'` (to equipment) or
>   `'|'` (to quiver) by looking for bows, diggers, hafted weapons,
>   polearms and swords in the pack. The enchant-weapon scrolls and spell
>   accept any `tval_is_weapon()` item, which includes shots, arrows and
>   bolts, and the item prompt opens on the pack when any accepted item is
>   there (`textui_get_item`). So with ammo in the pack (outside the
>   quiver) and no other weapon there, no `'/'` (or, for a quiver target
>   with nothing wielded, no `'|'`) is sent, and the equipment letter or
>   quiver digit is typed into the pack menu.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0088

**borg_pick_armor() tests TV_HELM twice; borg_enchant_to_d() tests BI_AMMO_POWER < 3 twice in its ammo loop (both harmless).**

Checked 2026-11-05; borg-rs group(s) 25.

Pinned source references:

- [C src/borg/borg-item-enchant.c:39–70](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-item-enchant.c#L39-L70) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:437–438](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L437-L438) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:437–438](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L437-L438)

> `borg_pick_armor()` tests `TV_HELM` twice; `borg_enchant_to_d()` tests
>   `BI_AMMO_POWER < 3` twice in its ammo loop (both harmless).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0089

**The munchkin "cure blindness by resting" branch calls borg_note("# Resting to cure problem**

Checked 2026-11-05; borg-rs group(s) 26.

Pinned source references:

- [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:444–446](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L444-L446) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:444–446](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L444-L446)

> The munchkin "cure blindness by resting" branch calls
>   `borg_note("# Resting to cure problem. (danger %d)...")` without
>   `format()`, so the note keeps a literal `%d`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0090

**The "expensive" poison cure tries borg_eat(TV_MUSHROOM, sv_mush_fast_recovery) twice in the same || chain (the second try repeats the first; harmle…**

Checked 2026-11-05; borg-rs group(s) 26.

Pinned source references:

- [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:447–449](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L447-L449) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:447–449](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L447-L449)

> The "expensive" poison cure tries `borg_eat(TV_MUSHROOM,
>   sv_mush_fast_recovery)` twice in the same `||` chain (the second try
>   repeats the first; harmless).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0091

**The rod recharge rest indexes borg_items[borg_slot(TV_ROD, sval)] without checking for -1; it relies on borg.has[kind] meaning the rod is in the pack.**

Checked 2026-11-05; borg-rs group(s) 26.

Pinned source references:

- [C src/borg/borg-recover.c:59–469](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-recover.c#L59-L469) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:450–452](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L450-L452) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:450–452](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L450-L452)

> The rod recharge rest indexes `borg_items[borg_slot(TV_ROD, sval)]`
>   without checking for -1; it relies on `borg.has[kind]` meaning the rod
>   is in the pack.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0092

**borg_prep_leave_level_spells() sets borg.no_rest_prep = borg.trait[BI_CLEVEL] * 1000 after casting Protection from Evil**

Checked 2026-11-05; borg-rs group(s) 27, 28.

Pinned source references:

- [C src/borg/borg-flow-stairs.c:253–342](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-stairs.c#L253-L342) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:458–464](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L458-L464) — reported C observation; not an independent validation
- [borg-rs docs/c-bugs.md:485–488](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L485-L488) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:458–464](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L458-L464)

> `borg_prep_leave_level_spells()` sets `borg.no_rest_prep =
>   borg.trait[BI_CLEVEL] * 1000` after casting Protection from Evil.
>   `no_rest_prep` is an `int16_t`, so from clevel 33 on the value wraps
>   (33 -> -32536, 50 -> -15536). The timer is then below 1, so the
>   "don't rest while prepared" checks (`borg_update()`, borg-flow-misc.c,
>   borg-think-dungeon.c) treat it as expired at once. borg-fight-defend.c
>   and borg-fight-perm.c have the same assignment.

[borg-rs docs/c-bugs.md:485–488](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L485-L488)

> Speed and Protection from Evil set the `int16_t` `borg.no_rest_prep`
>   to `CLEVEL * 1000`, which wraps negative from level 33 on (33000 ->
>   -32536), so `no_rest_prep` has no effect then (the same pattern is in
>   borg-fight-defend.c and borg-flow-stairs.c).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0093

**borg_flow_cost_stair() does not check b_stair against track_less.num (it reads any allocated entry).**

Checked 2026-11-05; borg-rs group(s) 27.

Pinned source references:

- [C src/borg/borg-flow-stairs.c:46–71](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-stairs.c#L46-L71) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:465–466](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L465-L466) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:465–466](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L465-L466)

> `borg_flow_cost_stair()` does not check `b_stair` against
>   `track_less.num` (it reads any allocated entry).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0094

**borg_perma_aux_regen() has no if (borg_simulate) return ...; test, so the scoring loop of borg_perma_spell() really casts Rapid Regeneration (keys…**

Checked 2026-11-05; borg-rs group(s) 28.

Pinned source references:

- [C src/borg/borg-fight-perm.c:428–470](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L428-L470) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:473–477](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L473-L477) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:473–477](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L473-L477)

> `borg_perma_aux_regen()` has no `if (borg_simulate) return ...;` test,
>   so the scoring loop of `borg_perma_spell()` really casts Rapid
>   Regeneration (keys queued, `no_rest_prep = 6000`) while it is only
>   simulating. If another move then scores higher, its spell is queued
>   after it; if Rapid Regeneration wins (value 1), it is queued twice.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0095

**borg_perma_aux_venom() checks the cost of SMITE_EVIL, not VENOM (for a class without Smite Evil the cost is -1, so it always passes).**

Checked 2026-11-05; borg-rs group(s) 28.

Pinned source references:

- [C src/borg/borg-fight-perm.c:522–564](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L522-L564) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:478–479](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L478-L479) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:478–479](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L478-L479)

> `borg_perma_aux_venom()` checks the cost of `SMITE_EVIL`, not `VENOM`
>   (for a class without Smite Evil the cost is -1, so it always passes).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0096

**borg_perma_aux_fastcast() scores 5 when simulating but returns 1 when cast (harmless: the real call's value is not used).**

Checked 2026-11-05; borg-rs group(s) 28.

Pinned source references:

- [C src/borg/borg-fight-perm.c:328–370](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L328-L370) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:480–481](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L480-L481) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:480–481](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L480-L481)

> `borg_perma_aux_fastcast()` scores 5 when simulating but returns 1 when
>   cast (harmless: the real call's value is not used).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0097

**borg_perma_aux_bless() and borg_perma_aux_resist() ignore whether the cast worked and always set no_rest_prep; ..._resist_colluin() always returns…**

Checked 2026-11-05; borg-rs group(s) 28.

Pinned source references:

- [C src/borg/borg-fight-perm.c:73–117](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-fight-perm.c#L73-L117) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:482–484](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L482-L484) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:482–484](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L482-L484)

> `borg_perma_aux_bless()` and `borg_perma_aux_resist()` ignore whether
>   the cast worked and always set `no_rest_prep`; `..._resist_colluin()`
>   always returns 2, even when no activation was sent.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0098

**The "Skip every non floor/glyph" test is ag->feat != FEAT_FLOOR && ag->glyph: it skips only glyphed non-floor grids, so every other grid (walls, do…**

Checked 2026-11-05; borg-rs group(s) 29.

Pinned source references:

- [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:494–497](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L494-L497) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:494–497](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L494-L497)

> The "Skip every non floor/glyph" test is `ag->feat != FEAT_FLOOR &&
>   ag->glyph`: it skips only glyphed non-floor grids, so every other grid
>   (walls, doors, rubble, ...) is scored too. With an old center, such a
>   grid in the 5x5 ring is a target if its flow cost is below 75.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0099

**In the "old center" branch tmp_glyph is never counted, so the score is always 500 - cost.**

Checked 2026-11-05; borg-rs group(s) 29.

Pinned source references:

- [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:498–499](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L498-L499) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:498–499](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L498-L499)

> In the "old center" branch `tmp_glyph` is never counted, so the score
>   is always `500 - cost`.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0100

**On arrival borg_needs_new_sea is cleared (and the center stored) even if no glyph can be made**

Checked 2026-11-05; borg-rs group(s) 29.

Pinned source references:

- [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:500–503](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L500-L503) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:500–503](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L500-L503)

> On arrival `borg_needs_new_sea` is cleared (and the center stored) even
>   if no glyph can be made. When the cast/read/activation works but the
>   grid is already in `track_glyph`, the function returns false although
>   the keys are queued.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0101

**The "is the sea complete" check reads borg_grids[center + ddd] without a bounds check (a center on row/column 1 would read index -1).**

Checked 2026-11-05; borg-rs group(s) 29.

Pinned source references:

- [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:504–505](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L504-L505) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:504–505](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L504-L505)

> The "is the sea complete" check reads `borg_grids[center + ddd]`
>   without a bounds check (a center on row/column 1 would read index -1).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0102

**track_glyph.num can go below 0: borg-messages.c's "The object resists the spell" / "There is no clear floor" handler does num-- without a check (af…**

Checked 2026-11-05; borg-rs group(s) 29.

Pinned source references:

- [C src/borg/borg-flow-glyph.c:81–329](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-glyph.c#L81-L329) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:506–509](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L506-L509) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:506–509](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L506-L509)

> `track_glyph.num` can go below 0: borg-messages.c's "The object resists
>   the spell" / "There is no clear floor" handler does `num--` without a
>   check (after writing `x[num]`, `y[num]`); the next glyph would then be
>   written at index -1.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0103

**borg_munchkin_mage() sets borg_attacking = true before its monster scan, but the two return false inside the scan (a monster adjacent, or within 2…**

Checked 2026-11-05; borg-rs group(s) 30.

Pinned source references:

- [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:516–522](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L516-L522) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:516–522](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L516-L522)

> `borg_munchkin_mage()` sets `borg_attacking = true` before its monster
>   scan, but the two `return false` inside the scan (a monster adjacent,
>   or within 2 grids and faster than the Borg; `borg.mon.scary`) do not
>   clear it. `borg_munchkin_melee()` has the same leak on its
>   `borg.mon.scary` return. While the flag stays set, `borg_danger()`
>   ignores Protection from Evil (`pfe && !borg_attacking`), until the
>   next `borg_attack()` (borg-fight-attack.c) clears it.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0104

**Both functions set borg_simulate = true and, when no attack scores above 0, return without setting it back to false.**

Checked 2026-11-05; borg-rs group(s) 30.

Pinned source references:

- [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:523–524](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L523-L524) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:523–524](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L523-L524)

> Both functions set `borg_simulate = true` and, when no attack scores
>   above 0, return without setting it back to false.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0105

**borg_munchkin_mage() has no class check: despite the name and the comment ("use MM"), every class tries every attack type except BF_REST and BF_THR…**

Checked 2026-11-05; borg-rs group(s) 30.

Pinned source references:

- [C src/borg/borg-attack-munchkin.c:47–182](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-attack-munchkin.c#L47-L182) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:525–527](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L525-L527) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:525–527](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L525-L527)

> `borg_munchkin_mage()` has no class check: despite the name and the
>   comment ("use MM"), every class tries every attack type except
>   `BF_REST` and `BF_THRUST` (ties go to the later type, `dam >= b_dam`).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0106

**borg_flow_dark_interesting(): the "Explore visible traps" branch is dead**

Checked 2026-11-05; borg-rs group(s) 31.

Pinned source references:

- [C src/borg/borg-flow-dark.c:46–199](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L46-L199) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:537–542](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L537-L542) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:537–542](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L537-L542)

> `borg_flow_dark_interesting()`: the "Explore visible traps" branch is
>   dead. It is only reached for features from `FEAT_SECRET` up (closed
>   doors return earlier), and in 4.2 only the open floor has the `TRAP`
>   terrain flag, so `feat_is_trap_holding()` is always false there (the
>   Borg keeps known traps in `ag->trap`, not in the feature). Visible traps
>   are never "interesting" for exploration.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0107

**borg_flow_dark_4(): "Clear the edges" sets borg_data_know and borg_data_icky of the whole border rectangle to false, so danger marks set on those g…**

Checked 2026-11-05; borg-rs group(s) 31.

Pinned source references:

- [C src/borg/borg-flow-dark.c:742–849](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L742-L849) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:543–546](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L543-L546) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:543–546](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L543-L546)

> `borg_flow_dark_4()`: "Clear the edges" sets `borg_data_know` and
>   `borg_data_icky` of the whole border rectangle to false, so danger marks
>   set on those grids before the call (they persist until the next
>   `borg_danger_wipe`) are forgotten as well.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0108

**borg_flow_dark_5(): the clevel <= 5 and clevel <= 30 spread branches are identical (short leash).**

Checked 2026-11-05; borg-rs group(s) 31.

Pinned source references:

- [C src/borg/borg-flow-dark.c:854–939](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow-dark.c#L854-L939) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:547–548](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L547-L548) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:547–548](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L547-L548)

> `borg_flow_dark_5()`: the `clevel <= 5` and `clevel <= 30` spread
>   branches are identical (short leash).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0109

**borg_flow_spread() skips a shop entrance that is not the goal shop only when it is in neither the Borg's row nor its column (y != borg.c.y && x !=…**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:255–501](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L255-L501) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:554–558](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L554-L558) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:554–558](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L554-L558)

> `borg_flow_spread()` skips a shop entrance that is not the goal shop
>   only when it is in neither the Borg's row nor its column
>   (`y != borg.c.y && x != borg.c.x`); an `||` (any grid but the Borg's)
>   was likely meant, so the flow may still run through other shops'
>   entrances in line with the Borg.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0110

**borg_play_step() (breeder levels) skips doors when track_door.num >= 255, but track_door has only 100 entries, so the test is never true: doors the…**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:559–563](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L559-L563) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:559–563](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L559-L563)

> `borg_play_step()` (breeder levels) skips doors when
>   `track_door.num >= 255`, but `track_door` has only 100 entries, so the
>   test is never true: doors the Borg keeps closing are never skipped
>   (once the list is full, new doors are just not noted). When several
>   open doors are adjacent, the last one scanned is closed.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0111

**borg_play_step() looks up the chest under the goal grid (loc(x2, y2)), not under the grid stepped on; the two are the same for the only caller (bor…**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:564–566](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L564-L566) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:564–566](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L564-L566)

> `borg_play_step()` looks up the chest under the goal grid
>   (`loc(x2, y2)`), not under the grid stepped on; the two are the same
>   for the only caller (`borg_flow_old()` passes an adjacent grid).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0112

**borg_flow_old() reads borg_data_flow at the neighbour before its "avoid screen edges" test (a Borg on row/column 0 would read index -1).**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:1122–1203](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L1122-L1203) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:567–568](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L567-L568) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:567–568](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L567-L568)

> `borg_flow_old()` reads `borg_data_flow` at the neighbour before its
>   "avoid screen edges" test (a Borg on row/column 0 would read index -1).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0113

**borg_play_step() ends with a dead ui_event "unhook" (a local that is never set); borg_free_flow() frees borg_data_flow twice (the second test sees…**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:613–1097](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L613-L1097) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:569–571](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L569-L571) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:569–571](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L569-L571)

> `borg_play_step()` ends with a dead `ui_event` "unhook" (a local that is
>   never set); `borg_free_flow()` frees `borg_data_flow` twice (the second
>   test sees NULL).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0114

**borg_flow_enqueue_grid() computes the danger of every new grid even when desperate/lunal/munchkin/digging, then ignores it (no effect but cost).**

Checked 2026-11-05; borg-rs group(s) 32.

Pinned source references:

- [C src/borg/borg-flow.c:506–580](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-flow.c#L506-L580) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:572–574](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L572-L574) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:572–574](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L572-L574)

> `borg_flow_enqueue_grid()` computes the danger of every new grid even
>   when desperate/lunal/munchkin/digging, then ignores it (no effect but
>   cost).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0115

**borg_think_home_sell_useful(): the two memsets that "clear out our initial best/test objects" pass sizeof(z_info->store_inven_max * sizeof(uint8_t)…**

Checked 2026-11-05; borg-rs group(s) 33.

Pinned source references:

- [C src/borg/borg-store-sell.c:529–643](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L529-L643) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:581–585](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L581-L585) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:581–585](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L581-L585)

> `borg_think_home_sell_useful()`: the two `memset`s that "clear out our
>   initial best/test objects" pass
>   `sizeof(z_info->store_inven_max * sizeof(uint8_t))`, the size of a
>   `size_t` (8 bytes), not `store_inven_max` bytes. No effect: both arrays
>   are rewritten before they are read.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0116

**borg_think_home_sell_best(): for a staff or wand, each trial takes charge_each charges off the pack item, but the restore after the trial only puts…**

Checked 2026-11-05; borg-rs group(s) 33.

Pinned source references:

- [C src/borg/borg-store-sell.c:398–524](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L398-L524) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:586–591](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L586-L591) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:586–591](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L586-L591)

> `borg_think_home_sell_best()`: for a staff or wand, each trial takes
>   `charge_each` charges off the pack item, but the restore after the
>   trial only puts the quantity back (`item->iqty++`). The pack item loses
>   charges with every trial of the scan, so later trials (and
>   `borg_think_home_sell_bad()`) see fewer charges. The caller restores all
>   items from `safe_items` afterwards.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0117

**borg_good_sell(): the "ego item not fully identified" test asks borg_ego_has_random_power() about the ego of the cloak slot (borg_items[INVEN_OUTER…**

Checked 2026-11-05; borg-rs group(s) 33.

Pinned source references:

- [C src/borg/borg-store-sell.c:816–941](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L816-L941) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:592–594](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L592-L594) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:592–594](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L592-L594)

> `borg_good_sell()`: the "ego item not fully identified" test asks
>   `borg_ego_has_random_power()` about the ego of the cloak slot
>   (`borg_items[INVEN_OUTER].ego_idx`), not about the item being sold.


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

### CBUG-0118

**borg_count_sell(): an unidentified item that is not part of a pile makes the function return false (0) at once**

Checked 2026-11-05; borg-rs group(s) 33.

Pinned source references:

- [C src/borg/borg-store-sell.c:1162–1266](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/src/borg/borg-store-sell.c#L1162-L1266) — C function context; reported fault site not yet independently checked
- [borg-rs docs/c-bugs.md:600–604](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L600-L604) — reported C observation; not an independent validation

Reported by borg-rs (lead text, not independent validation):

[borg-rs docs/c-bugs.md:600–604](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L600-L604)

> `borg_count_sell()`: an unidentified item that is not part of a pile
>   makes the function `return false` (0) at once. That return skips the
>   final `borg_notice(true)` ("reset the results"), so the traits stay as
>   computed for the last "what if" (the pack without an earlier sellable
>   item).


The report is retained below. Legal reachability, actual game consequence and port applicability still require independent review.

Lead supplied by borg-rs. A C function link below is context, not proof that this report is independently validated. Related sub-symptoms may be split during triage; no fix or carry is implied.

Evidence: **reported lead**. Neo/Mandos: **unreviewed**.

Fix proposal: none. Tracker: intake [#93](https://github.com/diegoami/mandos/issues/93).

Next: Check the cited C context and current port, separate harmless/unreachable behavior from defects, then retain a legal reproduction and controls before a ready local proposal.

## Complete source-group inventory

All substantive source reports are mapped below. A source report can contain related sub-symptoms; the exact report text and line reference remain available in the linked findings. A reported lead is not silently promoted to a checked defect.

| Group | Source reference | Area | Intake / latest note | Detailed IDs |
| --- | --- | --- | --- | --- |
| 1 | [borg-rs docs/c-bugs.md:8–22](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L8-L22) | banishment | Activation reads object counts as HP. source comparison: C uses has[BI_CURHP]; Mandos already uses the HP trait | CBUG-0021 |
| 2 | [borg-rs docs/c-bugs.md:23–31](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L23-L31) | item-ids | Subtype lookup names copied incorrectly. lookup/registration audit pending | CBUG-0022 |
| 3 | [borg-rs docs/c-bugs.md:32–40](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L32-L40) | formulas | Malformed formula block ordering. configuration-only lead; valid-input impact unproven | CBUG-0023 |
| 4 | [borg-rs docs/c-bugs.md:41–54](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L41-L54) | light | West shoulders omitted and light-list duplicates. west-light existing #87/#89; flags reproduced, practical impact pending | CBUG-0003, CBUG-0024 |
| 5 | [borg-rs docs/c-bugs.md:55–69](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L55-L69) | magic | Initial spell status and book iteration. catalogue notes effective guards; no independent play defect established | CBUG-0025, CBUG-0026, CBUG-0027 |
| 6 | [borg-rs docs/c-bugs.md:70–88](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L70-L88) | formulas | Formula errors overwritten by static formatting buffer. diagnostic lead; large-input memory behavior needs reachability proof | CBUG-0028 |
| 7 | [borg-rs docs/c-bugs.md:89–95](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L89-L95) | formulas | range() errors misleading or silent. configuration-diagnostic lead | CBUG-0029 |
| 8 | [borg-rs docs/c-bugs.md:96–108](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L96-L108) | home | Spell-stat score discontinuity and dead neck branch. needs an actual keep/retrieve/equip consequence | CBUG-0030, CBUG-0031 |
| 9 | [borg-rs docs/c-bugs.md:109–119](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L109-L119) | magic | Dark flag tested by equality. still present in magic-play.ts; interaction with no-light guards needs scenario | CBUG-0032 |
| 10 | [borg-rs docs/c-bugs.md:120–140](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L120-L140) | preparedness | Dead or mislabelled readiness checks. separate diagnostic text from reachable policy behavior | CBUG-0033, CBUG-0034, CBUG-0035 |
| 11 | [borg-rs docs/c-bugs.md:141–153](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L141-L153) | birth-ui | Respawn menu letters. C UI lead; Neo uses direct birth commands | CBUG-0036 |
| 12 | [borg-rs docs/c-bugs.md:154–166](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L154-L166) | home | All item sustains counted as STR; banishment counts missing. sustain bug still visible in Mandos home.ts; transaction consequence pending | CBUG-0037, CBUG-0038 |
| 13 | [borg-rs docs/c-bugs.md:167–181](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L167-L181) | diagnostics | Map-dump NULL-file crash plus display slips. map cancellation C-game reproduced; other slips separate | CBUG-0001, CBUG-0039, CBUG-0040 |
| 14 | [borg-rs docs/c-bugs.md:182–198](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L182-L198) | messages | Reaction suppression reset uses wrong variable. current C mismatch; old imported C resets global correctly | CBUG-0002, CBUG-0041 |
| 15 | [borg-rs docs/c-bugs.md:199–211](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L199-L211) | item-ui | Debug quiver inscriptions use equipment keys. C debug-key path; no direct Neo counterpart assumed | CBUG-0042 |
| 16 | [borg-rs docs/c-bugs.md:212–225](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L212-L225) | inventory | Unreachable pval tie-break and empty-pack lookup. pval condition preserved; empty-pack symptom must be classified separately | CBUG-0043, CBUG-0044 |
| 17 | [borg-rs docs/c-bugs.md:226–260](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L226-L260) | danger | Resistance/stat/bolt-state/index errors. cold-vs-acid source checked; other compound symptoms remain leads | CBUG-0004, CBUG-0045, CBUG-0046, CBUG-0047, CBUG-0048, CBUG-0049, CBUG-0050, CBUG-0051, CBUG-0052, CBUG-0053 |
| 18 | [borg-rs docs/c-bugs.md:261–273](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L261-L273) | valuation | Stat bonuses tested as flags. current Neo perItemValue explicitly preserves C's sustain-flag mixup | CBUG-0054 |
| 19 | [borg-rs docs/c-bugs.md:274–300](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L274-L300) | flow | Farthest stairs and item tracking slips. normal flow and optional-mode symptoms must be separated | CBUG-0055, CBUG-0056, CBUG-0057, CBUG-0058, CBUG-0059 |
| 20 | [borg-rs docs/c-bugs.md:301–324](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L301-L324) | items | Device fail math, staff/ring/food use. TS division guard and both-ring scan differ; staff gates still suspect | CBUG-0060, CBUG-0061, CBUG-0062, CBUG-0063, CBUG-0064, CBUG-0065 |
| 21 | [borg-rs docs/c-bugs.md:325–354](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L325-L354) | equipment | Swap chooses higher danger; best-search bookkeeping. C/port comparison needed after B99 ring/home adoption; #4 remains partly absent | CBUG-0066, CBUG-0067, CBUG-0068, CBUG-0069, CBUG-0070, CBUG-0071 |
| 22 | [borg-rs docs/c-bugs.md:355–374](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L355-L374) | light | Panel-relative beams and last-lantern refuel. panel UI differs; current TS refuel still starts at borgSlot's selected lantern | CBUG-0072, CBUG-0073, CBUG-0074 |
| 23 | [borg-rs docs/c-bugs.md:375–390](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L375-L390) | item-ui | Curse-removal item letters. C menu path; direct-command port applicability unproven | CBUG-0075, CBUG-0076, CBUG-0077 |
| 24 | [borg-rs docs/c-bugs.md:391–424](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L391-L424) | tracking | Wrong monster indices, sticky state and pursuit checks. multiple candidates; compare with B99 deletion/history fixes | CBUG-0078, CBUG-0079, CBUG-0080, CBUG-0081, CBUG-0082, CBUG-0083, CBUG-0084, CBUG-0085, CBUG-0086 |
| 25 | [borg-rs docs/c-bugs.md:425–440](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L425-L440) | item-ui | Enchant prompt inventory context. C menu-selection lead; no direct-command bug inferred | CBUG-0087, CBUG-0088 |
| 26 | [borg-rs docs/c-bugs.md:441–454](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L441-L454) | recovery | Recovery note, duplicate cure and unchecked rod slot. split harmless note/duplicate from reachable missing-rod access | CBUG-0089, CBUG-0090, CBUG-0091 |
| 27 | [borg-rs docs/c-bugs.md:455–469](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L455-L469) | timers | No-rest int16 overflow from level 33. C narrow-integer effect is absent from the JS number assignment | CBUG-0092, CBUG-0093 |
| 28 | [borg-rs docs/c-bugs.md:470–490](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L470-L490) | buffs | Regeneration simulation side effect and wrong Venom cost. TS guards regen simulation already; Venom cost still references Smite Evil | CBUG-0094, CBUG-0095, CBUG-0096, CBUG-0097, CBUG-0092 |
| 29 | [borg-rs docs/c-bugs.md:491–512](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L491-L512) | glyphs | Terrain, counters and array bounds in glyph flow. legal message/state sequence needed before claiming reachable memory failure | CBUG-0098, CBUG-0099, CBUG-0100, CBUG-0101, CBUG-0102 |
| 30 | [borg-rs docs/c-bugs.md:513–529](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L513-L529) | optional-mode | Munchkin attack/simulation flags leak. optional-mode lead; not ordinary-mode proof | CBUG-0103, CBUG-0104, CBUG-0105 |
| 31 | [borg-rs docs/c-bugs.md:530–550](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L530-L550) | exploration | Farthest stairs, trap interest and forgotten danger marks. stair cause overlaps group19; split remaining symptoms | CBUG-0055, CBUG-0106, CBUG-0107, CBUG-0108 |
| 32 | [borg-rs docs/c-bugs.md:551–577](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L551-L577) | flow | Shop/door predicates, bounds and dead cleanup. legal border/door scenarios needed; dead no-op is not a crash proof | CBUG-0109, CBUG-0110, CBUG-0111, CBUG-0112, CBUG-0113, CBUG-0114 |
| 33 | [borg-rs docs/c-bugs.md:578–606](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L578-L606) | selling | Trial charges, wrong ego and transaction history. history counter shared with34; other symptoms need separate verification | CBUG-0013, CBUG-0014, CBUG-0115, CBUG-0116, CBUG-0117, CBUG-0118 |
| 34 | [borg-rs docs/c-bugs.md:607–641](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L607-L641) | shopping | Purchase filters, home trial state and history. ten symptoms classified below; no new native C scenario claimed | CBUG-0005, CBUG-0006, CBUG-0007, CBUG-0008, CBUG-0009, CBUG-0010, CBUG-0011, CBUG-0012, CBUG-0013, CBUG-0014 |
| 35 | [borg-rs docs/c-bugs.md:642–666](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L642-L666) | escape | Emergency mana, queued stairs, timer and destination checks. four symptoms classified below; returned-command port has a distinct stair issue | CBUG-0015, CBUG-0016, CBUG-0017, CBUG-0018 |
| 36 | [borg-rs docs/c-bugs.md:667–681](https://github.com/diegoami/borg-rs/blob/590783e1f3bd26a4dc99cc60ca6b43131876f04b/docs/c-bugs.md#L667-L681) | shopping | Urgent shop goal/stale ware and redundant town guard. C and current port share the forced-goal flow; source checked, transaction scenario pending | CBUG-0019, CBUG-0020 |

## Maintenance

Board/source review: `node tools/upstream-watch.mjs` and `node tools/c-upstream-watch.mjs`. Review signals never close bugs or apply patches automatically.

Canonical data: [c-bugs.json](c-bugs.json). Regenerate with `node tools/c-bugs.mjs --write`; verify with `node tools/c-bugs.mjs --check`. The tool is offline and never posts or applies a fix.

On a borg-rs/source update, compare pinned content (including edits within existing groups), split independent causes, deduplicate shared callers, recheck C/Neo/Mandos separately and update checked dates. Revisit after a local proposal changes, a fix merges, a consumer adopts/reverts it, or an upstream reference changes. A new file or PR is not proof of application.

Keep local PR ownership/base/head and before/after/control receipts visible. Native C evidence is required before calling a C-game consequence reproduced. If impact is missing, keep the proposal explicitly unvalidated. Local-only C policy is in [RULES.md](../RULES.md), [process](process.md) and [UPSTREAM.md](UPSTREAM.md). No background poller or automatic submission is created.
