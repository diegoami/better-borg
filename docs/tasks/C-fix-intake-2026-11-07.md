# Native proposal applicability snapshot — 2026-11-07

Parent dispatch: [workspace26](https://github.com/diegoami/angband-workspace/issues/26).
Inspected Mandos baseline **e1ce216e022e2dbf8994319fd0ecb90a4bb7a878**,
on unpatched published Core/SDK/content1.23.0-beta.3. This dated source-reading
snapshot supplements the preserved [earlier intake](C-fix-intake-2026-11-06.md).
It is not a live carry/status table or a claim that every static match has a
runtime reproduction. Canonical consumer issues own implementation status.

The native checkpoint207's27 proposals were checked for a TS counterpart.
Two selected equipment corrections get independent consumer proof/removal units;
remaining25:2 existing translations,8 concrete static matches needing TS proof,
14 absent/safe/different paths and1 requiring further assessment. Read-only
review supplied the remaining25 disposition; this implementation changes only
assigned consumers185/186 and any separately reviewed prerequisite adoption.

## Selected equipment corrections

- [C239](https://github.com/diegoami/neo-angband-tracker/issues/239) /
  [Mandos185](https://github.com/diegoami/mandos/issues/185): equipment notice
  overwrites eight known weapon-slay fields with each later item. The proposed
  translation preserves strongest numeric multipliers and derives greater-kill
  flags, not bitwise OR of numeric3 and5. Public known-item proof is required.
- [C238](https://github.com/diegoami/neo-angband-tracker/issues/238) /
  [Mandos186](https://github.com/diegoami/mandos/issues/186): the same equipment
  helper adds each LIGHT modifier twice. The fixture additionally found an
  independent player.light double-counting port path, owned by
  [port41](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/41) /
  [Mandos196](https://github.com/diegoami/mandos/issues/196). That port prerequisite
  is verified separately; no zeroed player frame is used to hide it.

## Remaining static matches: investigate, then prove

These are actual source-level TS matches, **not** fresh TS runtime evidence,
new strategy proposals or permission to silently bundle all fixes together.
Links lead to canonical source reports and separate Mandos investigations.
Pinned TS files: [attack.ts](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/fight/attack.ts#L872),
[escape.ts](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/fight/escape.ts#L130),
[glow flow](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/flow/flow-misc.ts#L467),
[panel bounds](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/world/panel.ts#L132),
[stair rebuilding](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/flow/flow-stairs.ts#L37),
[HOME blows stub](https://github.com/diegoami/mandos/blob/e1ce216e022e2dbf8994319fd0ecb90a4bb7a878/src/store/home.ts#L174).

| Source / consumer investigation | Counterpart at the inspected Mandos baseline |
| --- | --- |
| [C258](https://github.com/diegoami/neo-angband-tracker/issues/258) / [189](https://github.com/diegoami/mandos/issues/189) | attack.ts:1388–1398 scans only the first tracked monster in the emergency reserve-bolt check. |
| [C259](https://github.com/diegoami/neo-angband-tracker/issues/259) / [190](https://github.com/diegoami/mandos/issues/190) | attack.ts:1425–1427 retains two teleport-reserve penalties in dispel scoring. |
| [C260](https://github.com/diegoami/neo-angband-tracker/issues/260) / [187](https://github.com/diegoami/mandos/issues/187) | attack.ts:2068/2088 chooses the lower acid-bolt and undead-only activation IDs in the stronger/area-all cases. |
| [C261](https://github.com/diegoami/neo-angband-tracker/issues/261) / [188](https://github.com/diegoami/mandos/issues/188) | attack.ts:1749 scores Frighten as OLD_CONF. |
| [C326](https://github.com/diegoami/neo-angband-tracker/issues/326) / [191](https://github.com/diegoami/mandos/issues/191) | attack.ts:872/875 retains rad10 beam handling, and1004 returns the initial negative score when no target survives. |
| [C262](https://github.com/diegoami/neo-angband-tracker/issues/262) / [192](https://github.com/diegoami/mandos/issues/192) | attack.ts:2097–2099 scores staff-holiness at radius0; its area-of-sight correction depends on investigating the preceding dispel path. |
| [C312](https://github.com/diegoami/neo-angband-tracker/issues/312) / [193](https://github.com/diegoami/mandos/issues/193) | escape.ts:137–141 can count a non-safe neighbour and its trap twice. A monster on a known trap is the realistic trigger; the trapped-wall board is constructed. |
| [C322](https://github.com/diegoami/neo-angband-tracker/issues/322) / [194](https://github.com/diegoami/mandos/issues/194) | attack.ts:1142 admits distance0 stale melee targets with its >1 guard. Native key-stream aborts must not be assumed to transfer to structured TS commands. |

Source311 / [Mandos195](https://github.com/diegoami/mandos/issues/195) requires
further assessment. flow-misc.ts:470 appends glow coordinates into tempX/tempY
Uint8Arrays of9000 slots, while a198×66 map has13068 grids. C heap corruption
cannot transfer to TS, but tempN growing beyond retained coordinates may have
a distinct observable consequence. No TS failure or fix is claimed here.

## Existing translations and absent/different mechanisms

C248 and257 already have independent Mandos175/176 translations and preserved
removal units. Their current application/upstream lifecycle is owned by those
issues, not this dated sentence. All seven existing C units are preserved.

The following14 source mechanisms do not supply a matching correction in the
inspected current TS path. They are not fabricated carries or fixed closures.
Revisit when the named path changes or an actual TS recurrence appears.

| Source | Reason at the inspected baseline |
| --- | --- |
| C118 | No failed-rune-message count decrement; TS tracking additions are bounded. Rune observation is separately tracked in C295/Mandos177. |
| C67 | Teleport Other exclusions use a dynamic list and for-of iteration, without C's one-past-count stale slot. |
| C254 | Nullable chosen ammunition gates structured fire-command construction; no C inventory[-1] description/key path. |
| C253 | Arc valuation already computes the angle of each scanned ry/rx grid. |
| C244 | The optional munchkin routine containing the stale grid pointer is not wired. |
| C290 | No queued terminal-panel-offset reaction path; detection marks have explicit bounds and derive from current position. |
| C240 | NEED_BRAND_WEAPON producer/branding action are documented omissions, so there is no duplicate increment to remove. |
| C287 | JS strings have no wcstombs destination-buffer termination path. |
| C325 | No manually freed/reloaded C calculation backing-pointer allocation. |
| C324 | No manually freed C operator-block backing-pointer allocation. |
| C323 | No manually freed C token backing-pointer allocation. |
| C313 | HOME calcBlows returns the documented stub1; the worn-weapon path reads game-derived p.blows. The C stack-weight multiplication is absent. A different omission is not a carry of this arithmetic fix. |
| C314 | Lunal entry is absent and fleeingLunal stays false; the split-state bail cannot be reached through the current producer. |
| C232 | Stair tracks are wiped/rebuilt from remembered grid coordinates, without the C continue-on-match append loop. |

Original-C proposal/evidence and discovery attribution remain in the source
tracker. Incoming Rune295 native evidence is read on our source board only;
no Rust repository or external evidence feed was polled. Source295/296 still
have separate original-scope validation/proposal ownership; this snapshot does
not claim their correction, native verification by this worker or adoption.

## Bounds

No engine/native-C/faithful-port source was edited by this intake. No official
Angband post, lab/deployment/data/save/profile access, optional advanced replay,
strategy/cohort experiment, Rust task or upstream upgrade was performed.
Static correspondence is a reason to investigate a named bug, not proof that a
C-only crash, exact rating, memory representation or outcome transfers to Neo.
