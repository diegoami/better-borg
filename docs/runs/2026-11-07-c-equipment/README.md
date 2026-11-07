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
