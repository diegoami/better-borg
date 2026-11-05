# Mandos noteSpot carry reconciliation

Owner tasks: [Mandos126](https://github.com/diegoami/mandos/issues/126) and
[Mandos150](https://github.com/diegoami/mandos/issues/150). This task starts from
Mandos `36f84731993f8f70421705a6206e9bdf68158a7d`. It verifies an existing carry,
not a newly applied runtime correction or lab deployment.

## Exact runtime and source equivalence

The normal consumer remains published core/SDK/content `1.23.0-beta.2`, selected
by the unchanged package.json, frozen lockfile and pnpm-workspace.yaml. No local
engine artifact replaces those dependencies. The independent producer recipe is
[engine4's handoff](https://github.com/diegoami/neo-angband-tracker/issues/4#issuecomment-6671740340):
commit `19ff25eac8997e8feb6b5e62eefa7ffe4d134631`, core tree
`b70fb735a44e75aa4fb8dc2a6fdf8930c574f9ce`. Versions remain beta.2; no package was
published. Source PR200 merged; upstream429 remains open.

Inspection of that source's `packages/core/src/game/trap.ts` and Mandos's
`dist/game/trap.js` patch shows the same live operation: `installChunkFeatHook`
calls `squareSetFeatTrapSideEffect(state, grid)`, then `noteSpot(state, grid)`.
The guarded noteSpot implementation determines visibility; no unconditional
memory write is introduced. Package trap MD5 remains
`34c27241f96aceff581bcb186a9d898f`. Combined patch SHA256 remains
`32af5c48c56b71889dfa70551c053a17430ad174da59634f96b1170fb1ea8513`.
The independent input-flush, accepted-birth replay and class-book-count carry
units remain applied. Their source/default-branch state cannot remove this
published-package backport.

## Consumer coverage and port applicability

Mandos already implements installed-content discovery in `src/play-session.ts`:
explicit `NEO_ANGBAND_REPO`, then the pinned installed content package, then the
lab sibling fallback. All checks here unset the explicit override; this isolated
worktree has no sibling lab, so successful discovery uses the installed package.
`src/play.test.ts` asserts content discovery and playable engine readiness in CI.
`src/rest-and-store-verification.test.ts` uses the same packRoot. Mandos's API2
play adapter consumes public `buildKnownWorld`; its parity tests check unseen
grids, complete world/store initialization and controller RNG. The port's API1
loader fix is not copied into this different harness.

`src/engine-carry.test.ts` gains five bounded package-runtime checks using public
engine exports: immediate OPEN/GRANITE memory for a seen grid, memory on the
player's own unseen grid, and no disclosure of unseen known/unknown remote
changes. No updateView/noteSpots pass follows the terrain change. This follows
the producer's seen/player/unseen controls while booting the actual installed
package and content. Existing legal generated-game play/rest assertions, seeds,
caps and timeouts remain unchanged.

The omission control runs a separate disposable copy of the installed core,
removing only `noteSpot(state, grid)` from the hook. All other carry hunks remain.
Shared dependencies are never edited. Raw logs are retained in this directory.

## Validation

| Check | Result |
| --- | --- |
| play/API2 controller | 49 passed, 2 files, zero skips, 409.16s (initial overlap noted below) |
| carry/rest/store/API2 parity | 14 passed, 3 files, zero skips, 46.81s |
| omission control (only noteSpot call removed) | 3 expected failures / 3 passed, 3.01s |
| standalone replay | 5 passed, zero skips, 22.38s |
| plugin rebuild | succeeds; identical SHA256 `0004b8e310a1ec1f256ad075eafb36c7bcd6210b69215267df80d678dd7f4f91` |

The omission control's failures are exactly the two seen-grid changes and the
player's own square; the independent spell-count carry and both unseen-grid
controls pass. Its trap MD5 is `92b64b6c4d818c69b5e2b821df0046cf`.

The [port worker independently verifies](https://github.com/diegoami/neo-angband-borg-mod-tracker/issues/25#issuecomment-6671818637) its exact source19ff25ea core/SDK/content
artifact tuple passes the required port full gate: 44 files / 866 tests / zero
skips / 213.98s. All ten play/rest and all 26 previously skipped spell cases run.
This receipt does not switch the Mandos public-package runtime to those artifacts
or infer upstream delivery from the port draft.

Focused commands (all with `NEO_ANGBAND_REPO` unset and `CI=1`):

```sh
pnpm exec vitest run src/play.test.ts src/api2/controller.test.ts
flock /tmp/angband-validation.lock pnpm exec vitest run src/engine-carry.test.ts src/rest-and-store-verification.test.ts src/play-parity.test.ts
# A separate private core copy removes just the noteSpot call; same test bytes:
flock /tmp/angband-validation.lock node /path/to/vitest.mjs run src/engine-carry.test.ts
flock /tmp/angband-validation.lock pnpm exec vitest run src/postmortem/replay.test.ts
# Rebuild and full gate share the lock, sequentially:
pnpm build
CI=1 pnpm verify
```

Full `CI=1 pnpm verify` exits 0: **67 files / 1148 tests passed / zero skips / 431.57s**; typecheck, session bootstrap and committed plugin currency pass. Manifest-grant check and `git diff --check` also pass. Focused commands, standalone replay and the full gate
are recorded below when complete. The first play/API2 focused run began before
the port worker acquired the shared lock and overlapped part of its run; later
live checks queued under `flock /tmp/angband-validation.lock`. Preserve any timing
failure as a failed receipt, rather than altering tests.

## Consumer state

Mandos126 stays carried/OPEN and patch-active: the correction was already
applied, and upstream429 is still open. Mandos150 remains partially-carried/OPEN
while upstream port67 remains a draft and its supported/default dependency
scope remains distinct from the verified exact-source artifact profile. The
producer's full 866-case result is now verified; no published dependency update
or upstream merge is inferred. Source-fork merge or draft port67 does not close either
consumer. Lab engine `9d6ae21ec` and installed mod `48405e9` remain intentionally
old; no owner data, browser profile, save or live lab bundle is changed.
