# Backup155: local-only preflight and fixture receipt

[Mandos155](https://github.com/diegoami/mandos/issues/155), owner code batch
[workspace12](https://github.com/diegoami/angband-workspace/issues/12). Base:
`9db5a5c37207ec582c047a965884e67175a7dd04`. No real profile, Drive remote,
credential configuration, backup/restore drill or lab operation is used here.

## Fail-before reproduction

The exact original backup script is read from base9db5a5c3 in Git. The fixture
changes only transport: remote() maps to a disposable local directory and the
rclone invocation receives `--config /dev/null`. No original guard logic is
changed. See [before.json](before.json) and the executable legacy control in
[backup.test.mjs](../../../tools/backup.test.mjs).

Observed on real rclone1.75.2:

- Existing empty selected source: old script exits0, leaves current with0files,
  and moves both previous synthetic files into archive.
- Synthetic profile containing SingletonLock: old script exits0 and uploads
  its hot-labelled synthetic content.

These are operational failure proxies, not claims about an actual private
profile or lost user save. The original archive behavior is preserved.

## Pass-after fixture coverage

`CI=1 pnpm exec vitest run tools/backup.test.mjs`:
**13 passed /1file /zero skips /58.53s**; [raw focused log](fixtures.log).
The later minimal child-process environment isolation is also exercised by the
required full gate; that gate's actual result is recorded on155/its PR/checkpoint.
No existing game assertion, seed or timeout is changed.

Ten pure safety controls inject synthetic process/inventory metadata. Three
real-rclone cases reproduce the exact old failures, verify new positive archive/
restore/filter behavior, and prove new refusal leaves local-remote bytes intact.
They cover:

- All selected local sets and every remote reduction plan before any sync.
- Missing directories, excluded-only/zero-byte selections and nonempty anchors.
- Configured live process and live local SingletonLock owner, including override
  refusal; unrelated Electron/native-C processes and stale DevTools/LevelDB files.
- Uncertain stale markers/process metadata, explicit logged cold confirmation,
  unchanged lock markers and no kill/cleanup operations.
- Bounded path-count/fraction/byte reductions and an explicit finite exception;
  source metadata changing during preflight and unreadable inventories.
- Published filters for browser storage, restore points and curated evidence;
  cache/network/trust/mod-clone exclusions; a real dry run without data mutation.
- Replacement/deletion archives including pushes at the same timestamp, safe
  empty staging, refused overlay, actual byte check and corrupted-stage rejection.

Real subprocess fixtures use only temporary local paths and the platform null
config; a restricted child environment excludes inherited rclone credentials/
options. Pure controls never inspect host processes or real profiles. Missing
rclone fails the test, rather than skipping it; full CI installs the declared
system dependency and prints its version before normal verification.

## Normal gate and remaining recovery boundary

Changed tools/config/tests/workflow are full-gate inputs. One logged normal
published-package `CI=1 pnpm verify` is queued under the shared flock behind the
existing port and engine turns; the PR's hosted full gate must also execute.
Actual outcomes and exact heads are appended to155 and checkpoint36 before any
approved merge. This focused receipt does not claim those pending gates green.

The game/plugin/package/patch bytes are unchanged. Preflight is not an atomic
snapshot or a distributed writer lock; the operator must keep the lab closed
and selections quiescent throughout transfer, then verify bytes and saved
history in staging. A listing/dry run alone is not verified recovery. Urgent
[OAuth52](https://github.com/diegoami/mandos/issues/52) remains a separate owner
prerequisite before a real cold-backup/staged-restore drill.
