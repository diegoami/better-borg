# Agents

For any agent or tool working in this repository (OpenCode, Codex, Claude
Code, others):

- **What this is**: the class-agnostic Borg fork - defect fixes and strength
  improvements for every borg, staged for upstream. Class- or build-specific
  behaviour belongs downstream (neowarrior-borg), not here.
- **Rules**: [`CLAUDE.md`](CLAUDE.md), numbered and cited as "rule n".
- **Process**: [`docs/process.md`](docs/process.md): the loop, records,
  milestones, and the two-fork routing (what lives here vs neowarrior-borg,
  and the cherry-pick protocol both directions).
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
