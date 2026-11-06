# Private backup and recovery

The transport is `node tools/backup.mjs where`, `push [SET...] --dry-run`,
`push [SET...]`, and `pull SET`. backup.json owns paths, include filters and
profile preflight anchors. Credentials remain host-local in rclone; do not
print or commit tokens/client secrets. The shared-client OAuth migration in
[issue52](https://github.com/diegoami/mandos/issues/52) remains an urgent separate
owner action before the real recovery drill. These guards do not migrate it.

The supplementary [workspace recovery guide](https://github.com/diegoami/angband-workspace/blob/main/docs/RECOVERY.md)
records Git/component/lab pins. Git cloning restores code, not private data.
The pre-split procedure and earlier boolean-only fixture receipts are historical.

## Selections and push preflight

- mandos-lab-data includes user saves/settings, browser IndexedDB, Local Storage,
  WebStorage, Session Storage, blob storage, Preferences/Local State, logs and
  restore points. Browser caches, network/trust state and the mod Git clone are
  excluded. Nonempty **included files** under both user/ and chromium/IndexedDB/
  are required anchors; an empty directory or an empty LOCK file is insufficient.
- mandos-evidence includes selected validation/reorganization receipts, retained
  old-worktree evidence and lab-build.json beneath artifacts/. General scratch,
  dependencies and caches remain excluded. At least one nonempty included file
  is required, not merely an existing artifacts/ directory.

Before the first sync, **every requested set** must pass local selection and
cold-profile validation, remote-current inventory and reduction checks. A later
bad set cannot allow an earlier set to upload. Source file paths/sizes/mtime and
cold state are checked again after inventories and before any sync. Inventory
errors refuse the operation; only rclone's directory-not-found exit3 represents
a not-yet-created current directory. Unknown options are errors.

Close the lab normally and wait for it to exit before push. The lab's configured
process scope is its data directory and desktop launcher directory from
backup.json. The process probe reads executable name, PID and cwd metadata only,
never command-line arguments, environment or credentials. A browser/Electron
process in that scope or a live locally resolved SingletonLock owner refuses
backup even with an override. Known unrelated Electron/native-C processes do
not block it. Stale DevToolsActivePort and persistent LevelDB LOCK files alone
are not evidence of a live profile.

SingletonLock/Cookie/Socket markers, failed process inspection or an unreadable
browser-process cwd leave cold state **uncertain** and refuse by default. After
independently confirming the configured lab is closed, an operator can explicitly
use `--confirm-cold-profile` for a stale/unresolvable condition. This prints an
exception receipt and never bypasses a known live owner. It never removes a
lock or kills a process. On platforms without readable process cwd metadata,
this explicit manual confirmation may be needed; it is an attestation, not a
new automated proof. Do not use it simply because a refusal is inconvenient.

Compared with the entire existing current inventory, a normal push refuses
more than10 missing paths, more than20% missing paths (rounded down; very small
backups therefore permit no deletion by default), or a reduction below50% of
previous total bytes. These are conservative safeguards, not save/history
semantic validation. If an intentional cleanup/filter reduction was reviewed,
`push SET --allow-large-reduction` explicitly records that exception. It does
not bypass empty selections, anchors or cold checks. The sync still has a finite
`--max-delete` ceiling equal to the observed current file count; ordinary runs
use the smaller count/ratio ceiling. Review the named set instead of applying an
exception to all sets unnecessarily.

After preflight, each sync uses `--check-first`, the finite deletion ceiling and
an archive destination with a UTC stamp plus unique ID. Replaced/deleted current
files move into archive; repeated pushes in one second cannot overwrite the
same archive destination. Retention deletion is never automatic. Existing
excluded remote files are not silently deleted by a changed include filter.

Preflight is not an atomic filesystem/remote snapshot or a distributed writer
lock. Keep the lab closed and local/remote selections quiescent through the
transfer, and keep a single backup writer. A later transport failure can leave
some sets transferred and others pending; inspect current/archive and verify
before retrying. The runtime deletion bound limits changes after inventory but
does not replace the single-writer rule.

## Verification and staged restoration

Record engine/mod commits and build identity. Review `push --dry-run` after
preflight, then perform the separately authorized real push. A remote listing,
dry run or sync success alone is **not** a verified backup.

After upload, run `rclone check` using the SAME backup.json filters, with
`--download` for byte comparison. Restore each current set into an EMPTY staging
directory, check that download against current, and inspect expected saves,
history/settings and build identity before selecting it for live use. `pull`
refuses a nonempty target and an empty/missing-anchor current inventory. The
existing explicit `--force` is an exceptional overlay, printed as such, and
still cannot bypass the cold-profile guard. It is not the normal restore path.
Archives remain available for choosing an older version; ordinary pull reads
current. Deliberate corruption must fail the verification rather than become a
successful recovery receipt.

Restore the exact recorded lab engine/installed-mod pair before upgrading.
tools/lab.mjs start purposely fast-forwards the installed mod; it is not an
exact-version recovery check. Keep the original profile intact until staging
is verified. A source/workspace merge never means deployment or recovery.

Record backup/restore time, versions, selected sets, byte-check result and any
missing files privately, with a non-sensitive summary on the Mandos checkpoint.
The real cold-backup/staged-restore/save-history drill remains unperformed by
this maintenance task and also depends on52's owner OAuth migration.

## Executable local-only fixtures (issue155)

Install rclone locally, then run:

```sh
CI=1 pnpm exec vitest run tools/backup.test.mjs
```

The full CI route explicitly installs rclone before normal verification. A
missing rclone is a failing fixture dependency, never a skipped green test.
Pure guard tests inject synthetic process/inventory evidence. Integration tests
use real rclone with `--config /dev/null` (the platform null device), temporary
local sources/destinations only, and no named remote or real profile. They retain
an exact9db5a5c3 baseline reproduction with only transport remapped locally,
then exercise safe selection, all-set refusal before writes, cold/uncertain and
unrelated process cases, bounded reductions/explicit exceptions, filter coverage,
restore points/evidence, archive preservation, empty-staging restoration and
byte-check corruption rejection. No fixture reads an OAuth config or contacts
private Drive. The focused fixture result is not a real backup verification.
