# Current verification entry point and explicit record correction

The immutable first README table transcribed the storm-giant race index as442.
That number is incorrect: **the actual bound race is486**, as both raw shot
JSON files show. The fixture looks up the actual registered name/identity and
never uses442. This is a summary transcription error, not a fixture/data/outcome
change. The original README, raw records and their original SHA256SUMS remain
unchanged; this append-only correction supersedes that one table label.

Use [the measured records and setup/limits](README.md) with this correction.
No source bug claim, runtime fix, threshold, RNG call or damage was changed.

## Exact before/after reproduction

Start in a Mandos clone; all new sibling worktree paths must be absent. Each
chain stops on setup failure instead of entering an existing checkout. Install
native package prerequisites from the normal project README. These use the
frozen published beta.2 profile, not a local engine checkout. Initial measured
runs linked the existing owned frozen dependencies into fresh before worktrees;
fresh reviewers install the same lock as below.

Enlightenment before, expect exactly1 intended-choice failure/5 passes:

```sh
git fetch --no-tags origin task/c-carry-enlightenment-and-shot &&
git worktree add --detach ../mandos-enlight-review-before e8be90ec7e67f1467ee8c81e13b51deb82ef96bf &&
git show b5f4e79f7193e05a2bceeea4587f7c28f85e417a:src/item/enlightenment-carry.test.ts > ../mandos-enlight-review-before/src/item/enlightenment-carry.test.ts &&
cd ../mandos-enlight-review-before &&
pnpm install --frozen-lockfile &&
mkdir -p artifacts &&
flock /tmp/angband-validation.lock env CI=1 NO_COLOR=1 ENLIGHTENMENT_OUTPUT=artifacts/before.json pnpm exec vitest run src/item/enlightenment-carry.test.ts
```

Then apply only the TS utility correction and repeat the SAME file, expect6/6:

```sh
git show b5f4e79f7193e05a2bceeea4587f7c28f85e417a:patches/c-translations/CBUG-0065-enlightenment.patch > artifacts/enlight.patch &&
git apply artifacts/enlight.patch &&
flock /tmp/angband-validation.lock env CI=1 NO_COLOR=1 ENLIGHTENMENT_OUTPUT=artifacts/after.json pnpm exec vitest run src/item/enlightenment-carry.test.ts
```

Inspect the real public known stairs flag changing false→true, quantity2→1
and100 action energy. Five entire control records remain identical. The unknown
flavor must stay opaque (flavor key/negative subtype), not gain hidden identity.
This is map information at a cost of one potion, not measured travel/combat or
survival improvement or proof every level is worth mapping.

For origin before, return to the original clone first. Expect exactly1 intended
path failure/7 passes; the real clear-shot Boulder still hits for17HP:

```sh
git fetch --no-tags origin task/c-carry-enlightenment-and-shot &&
git worktree add --detach ../mandos-shot-review-before b5f4e79f7193e05a2bceeea4587f7c28f85e417a &&
git show e8c125b1038e20df3ea3218b5c838e93adef71e6:src/danger/shot-origin-carry.test.ts > ../mandos-shot-review-before/src/danger/shot-origin-carry.test.ts &&
cd ../mandos-shot-review-before &&
pnpm install --frozen-lockfile &&
mkdir -p artifacts &&
flock /tmp/angband-validation.lock env CI=1 NO_COLOR=1 SHOT_ORIGIN_OUTPUT=artifacts/before.json pnpm exec vitest run src/danger/shot-origin-carry.test.ts
```

Apply only the origin guard and repeat the SAME file, expect8/8:

```sh
git show e8c125b1038e20df3ea3218b5c838e93adef71e6:patches/c-translations/shot-path-279-caster-origin.patch > artifacts/origin.patch &&
git apply artifacts/origin.patch &&
flock /tmp/angband-validation.lock env CI=1 NO_COLOR=1 SHOT_ORIGIN_OUTPUT=artifacts/after.json pnpm exec vitest run src/danger/shot-origin-carry.test.ts
```

Clear shot: native pathtrue/Borgfalse/0danger becomes Borgtrue/48danger and
flee/leave intent. The existing chooser still emits NULL, so the scheduled real
Boulder costs17HP in BOTH variants; do not call this a rescue. Native real mold
still blocks player damage. Seven whole control records remain identical.
The unknown-cell row is an explicitly altered remembered-map contract negative,
not a newly observed native snapshot. No monster AI selection/frequency/failure,
full world loop, whole fight or net survival gain is tested.

The mixed-storm/mold row demonstrates the separate per-spell reset already
present in TS: spell315/total1260 and the same real scroll before/after, despite
a blocked boulder. Source64/proposal277 gets an already-correct disposition,
not an invented Mandos patch or carried correction.
