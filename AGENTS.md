# Agents

For any agent or tool working in this repository (OpenCode, Codex, Claude
Code, others):

- **What this is**: the class-agnostic Borg fork - defect fixes and strength
  improvements for every borg, staged for upstream, with per-class STRATEGY
  PACKS under `src/class/` selected by the `borg.class` setting (pack #1 is
  the warrior; a new class starts as a pack plus a setting, never a fork -
  the no-N-forks doctrine, docs/process.md section 2).
- **Rules**: [`CLAUDE.md`](CLAUDE.md), numbered and cited as "rule n".
- **Process**: [`docs/process.md`](docs/process.md): the loop, records,
  milestones, and the pack doctrine (what lives in the core vs in a strategy
  pack under `src/class/`, and the upstream cherry-pick protocol).
- **Tasks**: [`docs/tasks/README.md`](docs/tasks/README.md); the issue's
  `status:*` label is the status.
- **Plan**: [`docs/plans/getting-stronger.md`](docs/plans/getting-stronger.md)
  - the strength roadmap (ceiling fixes, formula engine, parameter evolution,
  knowledge). **Backlog**: GitHub issues labelled `backlog`, ranked in
  [`docs/BACKLOG.md`](docs/BACKLOG.md).
- **Run records**: [`docs/runs/README.md`](docs/runs/README.md) - depth is the
  number; a change without a record is an unmeasured change.

Upstream is `neostryder/neo-angband-mod-borg`; the import commit `70145c5` is
the boundary, and it is the SAME boundary commit neowarrior-borg imported at,
so cherry-picks between the forks are trivial.
