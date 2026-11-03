# 2026-11-03 - b15-verify: the unified instrument reproduces B02's record

B15's own verification session (issue #15, the M2 unification): the first
record written after neowarrior-borg's session driver merged into
`src/play-session.ts` - ONE session module, two drivers over one loop body.
This sweep ran the STOCK driver (the B02 path) through `tools/sweep.mjs` on
B02's own cohort, and every field it produced matches the committed
`2026-11-02-b02-verify` record - including the defect.

| seed | b02-verify (2026-11-02) | this sweep |
| --- | --- | --- |
| 1 | 1500 decisions, turns 8691, maxDepth 1, clvl 1, places 421, alive, **close 771** | identical (field-for-field, census and depths included) |
| 7 | 1228 decisions, turns 15773, maxDepth 1, clvl 2, places 611, dead, walk 1081 | identical except `decisions`: 1229 (see below) |
| 42 | 1500 decisions, turns 17914, maxDepth 2, clvl 3, places 945, alive, walk 1322 | identical |

Seed 1's full census matches command-for-command (the door-close engine gap
B01 recorded is still what the instrument sees: 771 of 1500 decisions closing
a door the engine already closed, turn counter frozen at 8691).

**The one deliberate difference** is seed 7's `decisions`: the unification
adopted the archived fork's #36 counting rule (a decision counts when it
completes, so the killing decision of a dying run is counted), which B02's
committed record predates. B02's seed 7 recorded 1228 decisions against a
census of 1229 issued commands; the unified driver counts 1229 = 1229 and
now throws on any census/count disagreement (`docs/runs/README.md`'s
Provenance section documents the rule). No census, turn, depth or build
number moved.

- **What played**: the stock Borg (`build.borg: "stock"`), no parameter
  overrides; the pack driver shares this loop body but was not exercised
  here (`src/play.test.ts`'s ported pack suites are its proof).
- **Engine**: published `@rpgm-tools/neo-angband-core` 1.23.0-beta.1
  (package.json pin), bundled from `node_modules` by the runner; fingerprint
  `c89b1b08474b1692b352f8d0b64823f4` for `dist/game/trap.js` before and
  after the session - the engine stayed pristine.
- **Content**: sibling checkout `neo-angband@ceb4842` (the local lab
  branch's tree supplies the content pack only).
- **Mod commit**: `task/B15-unify` working tree (dirty) - the honest
  description: the sweep ran on the unified tree before committing it, as
  B02's own verification did.

## What the numbers mean for the next task

The unification moved no measurement: B01/B02/B14's records remain directly
comparable with anything the unified instrument writes from here on, with
the single documented counting correction on dying runs. M2's strength work
(B03 onward) measures on this instrument.
