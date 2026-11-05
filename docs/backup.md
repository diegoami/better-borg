# Private backup and recovery

This is the current procedure; the pre-split process snapshot is historical.
The supplementary [workspace recovery guide](https://github.com/diegoami/angband-workspace/blob/main/docs/RECOVERY.md)
records Git submodules, directory roles and exact lab recovery pins. That
owner workspace may require GitHub authentication. The three component sessions
retain their own rules and issue boards.

Existing transport: `node tools/backup.mjs where`, `push [SET...] --dry-run`,
`push [SET...]`, `pull SET`. backup.json owns the set paths/include filters.
The private Drive remote is mandosdrive. Authorize it locally with rclone;
never commit tokens or client secrets. Mandos #52 tracks the shared-client
retirement: current remote access is not a completed migration.

Sets:
- mandos-lab-data: user saves/settings, browser storage, logs and restore
  points. Browser caches and the Git mod clone are excluded.
- mandos-evidence: selected reorganization/gate logs, retained old-worktree
  receipts and lab-build.json, under artifacts/. General scratch, dependency
  caches and builds are not included. Promote other irreplaceable evidence
  into this explicit selection or a committed record before retiring it.

Close the lab normally and wait for Electron to exit before backing up its
profile. Record engine/mod commits and build identity. Review `push --dry-run`,
then run the real push. Each push mirrors current files and archives replaced
or deleted remote copies under its timestamp; no retention deletion is
automatic. Missing local sets fail rather than overwrite a backup as empty.

After upload, run rclone check with the SAME filters as backup.json, using
--download when needed for byte comparison. Restore each set to an EMPTY
staging directory, verify it against the remote, then check the expected
saves/history/settings before selecting it for live use. `pull` refuses an
existing non-empty target unless --force; do not use --force as the normal
restore procedure. Avoid overlaying live profiles.

Git cloning restores code, not private data. Restore the exact recorded lab
engine and installed-mod pair before upgrading. tools/lab.mjs start purposely
fast-forwards the installed mod, so it is not an exact-version recovery check.
A source/workspace merge never means deployment. Keep the old profile intact
until the staged restoration has been verified.

Record backup/restore time, source versions, selected sets, verification result
and any missing files privately, with a non-sensitive summary on the Mandos
checkpoint. A remote listing or dry run alone is not a verified backup. This
maintenance change neither uploads private data nor claims a restore drill.
