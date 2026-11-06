# Mandos ready-C intake audit — 2026-11-06

Internal task: [Mandos161](https://github.com/diegoami/mandos/issues/161).
Source correction readiness stays on the tracker; live consumer adoption stays
on Mandos issues. This is a dated applicability/closure receipt, not a new C
catalogue or a claim that all C reports were investigated.

Inspected Mandos runtime: **5964722d5d48d3c6ce8c24c99dc5154974cb82a7**.
No runtime, dependency, patch, plugin or fixture changed in this audit.

## Reviewed proposals and applicability

| Canonical C report / exact reviewed proposal | Mandos disposition at the inspected pin | Reason and next trigger |
| --- | --- | --- |
| [source13 / CBUG-0001 map-cancel](https://github.com/diegoami/neo-angband-tracker/issues/13), [proposal1 at540f621960e674d9fde227a175eeb1d27cc02132](https://github.com/diegoami/neo-angband-tracker/pull/1) | Absent / not applicable | No C map filename prompt, nullable file handle or map-file writer in the TS controller path. Revisit if an equivalent Borg map-file command is introduced. Historical stored C patch is not a TS carry. |
| [source14 / CBUG-0002 knockout reset](https://github.com/diegoami/neo-angband-tracker/issues/14), [proposal210 at6f463d01d753089ab695537495ab27f3bc928dfa](https://github.com/diegoami/neo-angband-tracker/pull/210) | Absent / not applicable | The erroneous persistent global-versus-struct gate is absent. Perception consumes the public message stream directly. Revisit if such a persistent reaction-suppression stage is introduced or an actual TS message-loss case is observed. |
| [source82 / CBUG-0066 safer emergency swap](https://github.com/diegoami/neo-angband-tracker/issues/82), [proposal226 atebcd255ba9064fc44a35d693f42f9df3dc00bd88](https://github.com/diegoami/neo-angband-tracker/pull/226) | Deferred: current tactical backup selector is absent | Existing omission [Mandos125](https://github.com/diegoami/mandos/issues/125) / [port source2](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/2). Revisit when weapon/armour candidates are actually compared by a tactical emergency selector. The current authorised weapon-valuation/HOME-retrieval leaf alone does **not** supply that selector. |
| [source110 / CBUG-0094 regeneration during scoring](https://github.com/diegoami/neo-angband-tracker/issues/110), [proposal264 at31a042d00581ed914d30f17cca1ed0e70e99d21f](https://github.com/diegoami/neo-angband-tracker/pull/264) | Already correct | The TS maintenance helper returns score1 while simulating before constructing the regeneration command. Its selector clears pending state and executes only the chosen helper. Revisit if that path changes or a real duplicate-cast scenario appears. |

These are not carried corrections or upstream-fixed consumer deliveries. No
runtime adoption issue/patch is invented for a missing counterpart. Source82's
revisit trigger is also linked from the existing omission issue, rather than
creating another backup-subsystem defect. An independent native C consumer can
apply these C changes directly; its success does not establish a TS counterpart.

## Verification: copyable pinned searches

Run these from any Mandos clone containing the inspected commit. `git grep`
exit1 below means no matches, not a failed build. The commands inspect immutable
objects and do not require a local C checkout, game, save or workstation path.

```sh
git grep -n -E 'borg_write_map|map.?dump|write.?map|get_string|file_(open|put|putf|close)' 5964722d5d48d3c6ce8c24c99dc5154974cb82a7 -- src
git grep -n -E 'borg_dont_react|dont_react|dontReact|knocked out|Knocked Out' 5964722d5d48d3c6ce8c24c99dc5154974cb82a7 -- src
git grep -n -E 'borg_backup_swap|borgBackupSwap|backupSwap|weapon_swap|armour_swap|weaponSwap|armourSwap' 5964722d5d48d3c6ce8c24c99dc5154974cb82a7 -- src
```

Actual results: the first two searches produce **no matches** (exit1). The
backup search has14 matching source lines: two optional evaluator declarations,
one production evaluator read, two assertions that the hooks are absent, and
nine comments explaining the missing subsystem or original C references.
There is no selected backup weapon/armour producer or emergency comparison in
those results. A symbol search alone does not prove all behavior: inspect the
actual caller/consumer context next.

```sh
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/controller.ts | sed -n '138,146p;208,226p;252,266p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/perceive.ts | sed -n '76,115p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/perceive-messages.ts | sed -n '342,382p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/think-session.ts | sed -n '509,524p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/trait/power.ts | sed -n '1,19p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/store/buy.ts | sed -n '540,558p'
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/think-ladder.ts | sed -n '810,824p;896,908p'
```

The controller receives the public view/actions and calls perception before
thinking. `perceive` calls `borgReactMessages(world, view.messages(), ...)`
once; the reaction function iterates the supplied messages, prunes a stale
monster for a death message and returns a deletion count. It has no persistent
knockout latch to reset. This is structurally different from source14's C
screen-input/parser/global-gate defect. Existing src/perceive.test.ts:237–284
covers death-message pruning and a still-visible-monster control; those tests
are supporting coverage, not a claim of a new post-knockout runtime experiment.

The controller does not execute a C filename prompt/file-pointer writer, so
source13's guard has no TS target. The absent symbol set plus the controller's
public command boundary supports that narrow applicability conclusion; it is
not a claim that every file operation in offline tooling was audited.

`buildStoreDeps` explicitly leaves weaponSwapEval/armourSwapEval absent because
swap-value producers are missing. `borgPower` states their contribution is zero;
HOME's buy helper only reads the optional evaluator and returns if absent.
The equipment branch calls normal wear/ring routines, not C's emergency
backup comparison. Ring reordering and ordinary best-loadout scoring do not
make source82's weapon-versus-armour danger selector present. Its C availability
guards and safer-choice regression scenarios must be considered when that
selector is eventually ported, instead of copying the C comparison defect.

## Verification: regeneration was already guarded

The same ready-proposal scan found source110/PR264. It has an existing TS
counterpart, but that counterpart already has the proposed simulation guard:

```sh
git grep -n -w auxRegen 5964722d5d48d3c6ce8c24c99dc5154974cb82a7 -- src/fight/perm.ts
git show 5964722d5d48d3c6ce8c24c99dc5154974cb82a7:src/fight/perm.ts | sed -n '189,204p;286,306p;313,337p'
```

The scoped exhaustive helper search finds its private definition at189 and
maintenance dispatch at302 only. A broader src/ search also finds a separate
private defence helper/dispatch in fight/defend.ts; those do not call the
maintenance helper. The decisive current TS lines are:

```ts
  if (fs.simulate) return 1;
  fs.pending = borgSpell(ctx, Spell.RAPID_REGENERATION);
```

The first is line197, before any regeneration command is constructed. The
selector sets simulate=true at315 for its scoring loop, then false at332,
clears pending at333 and invokes the winning helper at334. Thus source110's
missing guard is already present in this TS path; no new carry or benefit is
claimed. This audit inspects the actual caller and side-effect site, not just
a matching guard token. It does not claim a new in-game Druid experiment.

## Native evidence reviewed; limits retained

- Source13's [native diagnostic](https://github.com/diegoami/mandos/tree/5964722d5d48d3c6ce8c24c99dc5154974cb82a7/docs/audit/c-reports/B94)
  invokes the actual C map writer in a normally born game: cancelling gives
  SIGSEGV/status139 before the guard, safe return after; writable acceptance
  still writes23,865bytes. Top-level dispatch/failed-open and lost-save harm
  were not demonstrated. This audit does not rerun or generalise that scenario.
- Source14's [immutable reproduction](https://github.com/diegoami/neo-angband-tracker/blob/91002f1ea81e44fecce6d2493fa37589dd05b2fc/docs/audit/c-reports/CBUG-0002/REPRODUCE.md)
  shows a real post-recovery C kill notification ignored before/reset after,
  with unchanged controls. No worse autonomous choice or death was proved.
- Source82's [immutable expanded evidence](https://github.com/diegoami/neo-angband-tracker/blob/1b67370d0dc56d9b7ef34e5356e63d21a7095545/docs/audit/c-reports/CBUG-0066/expanded/README.md)
  demonstrates five harmful native cases, nine corrected passes and four
  unchanged controls. The two-threat case costs113HP before/59HP after. The
  scenario isolates the emergency selector; it does not establish full-run
  frequency or death prevention. No equivalent tactical TS path exists yet.

- Source110's [native replay and evidence](https://github.com/diegoami/neo-angband-tracker/blob/2aa35a90c88a3ac72d8eda34fae9948e0adb13c6/docs/audit/c-reports/CBUG-0094/REVIEW.md)
  shows one extra20-mana regeneration cast while scoring: regeneration twice
  or regeneration before haste. Nine corrected cases and seven unchanged
  controls are documented. Native commands execute without world turns between
  casts; extra enemy attacks, frequency or survival improvement are not proved.
  The proposed guard already exists in Mandos's maintenance helper.

A validated clean proposal may be carried locally before official acceptance.
Closed-unmerged/c-proposal status does not make it ineligible. This audit's
absence/dependency findings, not upstream review state, prevent an invented
Mandos translation for these four proposals.

## Existing deliveries reconciled, not newly applied

Mandos126,146,148,149 and150 are now fixed/CLOSED: upstream explicitly accepted
the original corrections and Mandos already applies/verifies their equivalents.
Each issue preserves its prior body and links actual acceptance/source/local
receipts.126 keeps patch-active because the published beta.2 backport remains
required; the package and intentionally older live lab were not upgraded.
Source4 and port source22/23/24/25/32 state changes belong to their source owners.

The source/runtime proof remains the existing current main full gate
[42150248366](https://github.com/diegoami/mandos/actions/runs/42150248366):
68files/1162tests/zero skips and committed plugin current. The earlier noteSpot
[consumer receipt](../runs/2026-11-06-notespot-consumer/README.md) includes focused
49+14, standalone replay5, a single-call omission3expected failures/3passes and
byte-identical rebuilt plugin. That dated receipt's then-open upstream wording
is history; current issues carry the updated acceptance/closure evidence.

No new runtime correction or game gate was made by this audit. Only process
prose/applicability evidence and issue-state reconciliation changed. Normal
session/CI-routing/document checks apply to this documentation PR; no assertion,
seed, cap, timeout, baseline, package, patch, plugin or owner data was changed.
