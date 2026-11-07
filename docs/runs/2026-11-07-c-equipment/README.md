# Registered equipment correction evidence, 2026-11-07

Mandos consumers185/186, canonical C239/238; dispatch workspace26.
Unchanged runtime baseline e1ce216e022e2dbf8994319fd0ecb90a4bb7a878;
Core/SDK/content are unpatched published1.23.0-beta.3. This first commit
contains tests and evidence only, no runtime or plugin change.

## Frozen C239 before contract

The same fixture that must pass after correction currently produces six
expected failures and four passing controls. Three C238 tests are explicitly
filtered out by the named C239 selection; they are not disabled in default
suite discovery. Exit1 is retained in before/slays.exit. Copyable command:

```sh
flock /tmp/angband-validation.lock pnpm exec vitest run \
  src/trait/c-equipment-corrections.test.ts -t C239
```

The fixture creates a real registered Broad Sword and permitted registered
Slay Animal / ordinary and greater Slay Dragon / greater Slay Undead and Demon
egos using objectPrep, possItems membership and egoApplyMagic. It actually
wields objects through wieldObject, which performs normal knowledge-on-wield.
Only explicit playerLearnAllRunes teaches the slays. buildKnownWorld.equipment
and the production itemView adapter supply the decision inputs. Registry kind,
subtype, dice, artifact and slay identities are asserted before decisions.
No hand-built subtype, fabricated slay flag or hidden live object reaches Borg
notice or damage code. Monster race records are registered content, passed
through the normal declared resolver; the adjacent creature/public player frame
is a constructed legal decision proxy, not a naturally attained character or
an actual game-combat run. The higher-HP cave bear avoids the ordinary damage
estimator's twice-HP clipping; the first mouse experiment was not used to
claim a preserved slay affects the estimate.

Expected failures: the later ordinary torch erases the known animal slay;
the animal melee estimate gains nothing from knowing the slay; all three known
greater slays are erased and never classify as kills; ordinary and greater
known dragon slays yield no distinct melee estimate. Passing controls retain
concealed knowledge, unchanged non-animal kobold estimate, the slay without
later equipment, and the plain sword/torch's absent slays and kills.
No survival, frequency, best strategy or damage actually inflicted is claimed.

## Separate light integration blocker

The initial combined run also exposed a distinct port wiring issue: notice
initializes BI_LIGHT from the game-derived public player.light and then adds
all equipment light again. A frame with the harness's normal default light1
therefore gives Phial9, Torch3 and Necromancer Phial8, rather than native C's
8/2/7. No zeroed player.light workaround is used to manufacture native values.
The literal native-total assertions are retained as failed diagnostic attempts;
source238's runtime correction is paused while the parent routes the distinct
port candidate. Consumer186 remains not carried. This is not evidence that
the current controlled frame is an actual current engine player snapshot.

## Preserved setup attempts

before/setup-types.log records the initial wrong state import and Set.includes
fixture type mistakes, corrected before the frozen run. setup-kind-lookup.log
and setup-race-lookup.log record actual content lookup failures, corrected by
using registered kind display syntax and case-insensitive registered names.
combined-initial.log is the exploratory12-case run with the distinct light
wiring issue and mouse damage cap; it is not the final C239 before count.
No gameplay assertion, seed, timeout or production runtime was weakened.

Reviewed native pins: C239 proposal304 at
9ab78ae605ca4463268a669121d69b216285c2f1, evidence305 at
25b0118631f108edc926856c8f4b3c35d3611bf9; C238 proposal349 at
66b183340a567811051a5745c8d3a53792963860, evidence350 at
f1e899b66b383b19ab2d69b4d7ffbb2148ba5444. Native and TS runtime
proofs are independent. No engine/port/native source, lab, owner profile,
save, deployment or Rust repository is accessed or changed by these fixtures.

## C239-only translation

The ten selected C239 cases now pass. The same three C238 cases remain
explicitly outside this intermediate selected command; no default-gate result
is claimed. Relevant trait/combat/backup and six existing carry suites pass
167/10 files; the actual C spell suite is run separately (17 cases). The
initial focused command also named an absent old necro test path, which Vitest
ignored; the separate actual c-spell-carry.test.ts result is authoritative.
Types pass. These are targeted results, not the final full required gate.

The independent runtime unit uses Math.max for numeric ItemView multipliers,
not C's bitwise OR, so a3 and5 cannot become a fictitious7. The existing combat
ladder tests ordinary WS flags for x2/x3 and separate WK flags for x5; known
greater UNDEAD/DEMON/DRAGON multipliers now set those flags. Later no-slay items
cannot erase either. The old trait test's title mentioning last-writer-wins is
updated to describe the corrected contract; its original assertions remain.
Core/packages and all seven prior C source/patch units are unchanged. The
rebuilt plugin and final required gate wait for the separately routed light
port finding before the final combined delivery is frozen.

## Port41 / Mandos196 before proof on the actual matching public frame

The producer's immutable8-case fixture6e2c71bc1f0eb91f186e6449c75d444c67d1c794
is copied byte-identically as src/trait/light-base.test.ts (SHA256
ed9838fe7ff61af2ddabd597a68f800f9a4c182c795b3c6f76c2dc8c7409df46).
On the current C239-only Mandos branch it gives4 expected failures/4 passing
controls: actual matching public player/items produce Warrior Torch4/Phial12
and Necromancer Torch4/Phial10, against faithful C2/8 and2/7. Empty and spent
controls pass. port41/before.log retains the public snapshots and failures.
These replace the three earlier mixed-frame light cases as the authoritative
light integration fixture. The earlier source/test/output remain at frozen
beforea9b71e7; the changed fixture boundary is explicit, not an assertion waiver.

The source fixture uses a real registered game and declared simulateLoadout →
knownLoadoutSimulation → production API2 simulationView. Matching player.light
and public derived stats.light are asserted first; real Phial LIGHT[4] and
Torch fuel5000 are asserted before notice. The engine's description callback,
not an invented fuel field, supplies the public equipment timeout. No BI_LIGHT
or player.light value is forced in these actual-frame tests. Producer runtime
2ee4f82f7f845674e6c12575afbcc7837ae713db is parent-reviewed; required producer
CI/main/consumer acceptance remains separately held, not inferred from focus.

## Port41-only import / Mandos196

The reviewed source2ee4f82f7f845674e6c12575afbcc7837ae713db contributes only the
zero-base light notice change and approved no-light policy-fixture correction.
The source plugin/whole trait module are not copied. C239 remains intact;
C238's double modifier is deliberately retained at this intermediate step.
The exact producer8-case actual-public-frame fixture remains byte-identical.
Combined actual-frame8 + C23910 + no-light policy41 now pass59/3 files/zero
skips, types pass; logs are port41/after.log and types.log. No final full gate
or producer actual-main/adoption state is inferred from these focused results.

The separate policy fixtures previously injected a positive synthetic
PlayerView.light without any matching equipment. They now explicitly provide
that model-level radius after notice/before perceive for the beam/recovery
unit tests, keeping every original radius and assertion. No fabricated gear is
added to pretend those are actual loadout tests. The eight registered actual
loadout cases never override the player.light or BI_LIGHT values. Source
initial112/120 failure and the approved fixture correction remain on port41.

## Independent C238 before contract after the faithful-port import

The actual matching-frame test changes only its two Phial expected totals from
C8/7 to corrected4/3; Torch, spent, empty and Necromancer minimum controls stay
unchanged. The test header/name now marks this deliberate Mandos divergence.
Before any C238 runtime edit it gives **2 expected failures/6 passing controls**
with exit1: real Warrior Phial8 versus4, Necromancer Phial7 versus3. The public
engine values remain4/3, unaffected by this controller correction. Raw public
player/equipment snapshots and failures are in c238/before.log. This separates
the original-C double modifier from the already imported port zero-base fix.

## C238-only translation after proof

The independent source238 unit removes the second modifier addition and marks
why; it keeps flag/fuel and Necromancer adjustment order. All8 actual-frame
cases now pass, plus10 unchanged C239 and41 no-light policy cases (59/3 files,
zero skips), types pass. Actual same-loadout public values and Borg traits now
agree at Warrior Phial4/Torch2 and Necromancer Phial3/Torch2; empty/spent
Necromancer still has the existing Borg minimum1 even when engine light0.
That retained policy minimum is not silently changed. No extra engine patch,
light policy retune, occult knowledge or increased survival is claimed.

## Broader regression failure and approved fixture repair

The broader15-file focus correctly failed21 cases while227 passed; the chained
build did not run. The complete failure is retained in broader-initial-failure.log.
Eighteen defence unit cases in fight.test.ts and three original C0086 unseen
name controls relied on a positive synthetic player.light with no matching
lamp. The parent/source worker owns the defence fixture correction; no production
spell guard or old expected command is weakened to obtain green.

The C0086 fixture now reuses its **same actual born Human Warrior's registered
birth torch** from buildKnownWorld.equipment[5], using the real describeObject
callback and production itemView. It asserts registered Wooden Torch kind,
LIGHT_2, positive actual fuel and derived BI_LIGHT2. It adds no RNG draw, object,
seed, trait override, threshold or HP/energy/command change. All original six
C0086 tests pass, including the three detection/quaff/spent assertions. This is
one explicitly parent-approved fixture input repair, so the six original C
fixture files are **not** all byte-identical: only perceive-unseen-name.test.ts
changes. All seven prior patch units and their five production files are
byte-identical to baseline; the other five C fixtures are unchanged. Exact
preservation and three independent reverse-removal checks are in preservation.json.

The port import's local comment now explains that the faithful port retains
C238 while Mandos186 corrects it below. Its stored removal patch reflects only
that prose adaptation; source import e6d51b5 and producer history remain intact.
No runtime scope is expanded by this clarification.
