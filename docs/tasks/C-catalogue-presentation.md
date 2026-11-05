# C catalogue presentation and ownership evaluation

Owner request,2026-11-05; evaluation tracker:
https://github.com/diegoami/neo-angband-tracker/issues/2 (high priority,ready).
Documentation/workflow maintenance only; no game behavior or issue migration.

- Lead C-BUGS with the concrete map-dump compare link and easy direct-PR method.
- Keep own-fork copy, wrapper-patch, permissions and result-discovery details
  on linked c-fix-handoff.md instead of embedding the whole guide.
- Put compare-forks links in actual C-source proposal cells. Report/patch-only
  Mandos88 has no direct C branch, so it links the extraction guide instead.
- Remove the overview pinned-reference column; preserve per-finding pinned
  code/discovery evidence and all143 findings/141 source reports.
- Treat the monolithic JSON input as temporary. Evaluate scalable fork issues,
  index generation, migration/history/IDs/labels/monitoring and a separate
  C Borg/C game/Neo engine fix/proposal session before community outreach.
- Target upstream port trackers to our mod fork, C/game/Neo engine trackers
  to our engine fork, Mandos-specific issues/integration here. Neo Borg
  development remains in Mandos. Current issue homes stay authoritative
  until a linked migration; no mass transfer or C submission is performed.
- Keep fork defaults aligned by fast-forward only, preserving topic heads.

Borg fork master was fast-forwarded1fa2f8d→74a017d; GitHub compare reports
identical/0ahead/0behind. All four PR heads63–66 verified unchanged. Both
forks now have issues enabled (owner enabled the engine fork). The C example
branch540f621 remains one commit ahead of C e473720, changing borg-log.c only.

Verification: node tools/c-bugs.mjs --check, catalogue shape/link inspection,
focused source/watch regressions, CI=1 pnpm verify and final remote CI.
Compare-page opening never submits a PR. The GitHub public-page fetch was
unavailable to the browser tool; branch/base/diff were checked by API. The
existing commit-copy receipt remains valid; no copy workflow rerun required.
