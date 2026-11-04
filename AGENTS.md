# Agents

For any agent or tool working in this repository (OpenCode, Codex, Claude
Code, others):

**Start at the open issue labelled `checkpoint`**: its latest comment says
where work stands and what comes next (process.md section 3). The queue is
the issues' labels: `status:ready` and `priority:*`.

- **What this is**: Mandos (formerly better-borg) — the class-agnostic Borg
  fork: defect fixes and strength
  improvements for every borg, staged for upstream, with per-class STRATEGY
  PACKS under `src/class/` (pack #1 is the warrior; every other class plays
  through the generic pack; a new class starts as a pack, never a fork - the
  no-N-forks doctrine, docs/process.md section 2). Which class and race each
  birth plays is the player's: one toggle per class and per race (#16).
- **Rules**: [`CLAUDE.md`](CLAUDE.md), numbered and cited as "rule n".
- **Current scope**: rule 15 authorizes bug hunting and fixing only. The
  roadmap's strategies, learning, snapshots and new unattended stage-resume
  functionality remain parked until the owner changes scope.
- **Process**: [`docs/process.md`](docs/process.md): the loop, records,
  milestones, and the pack doctrine. Before upstream work: run
  `node tools/upstream-watch.mjs` - movement on our threads means engage;
  silence means carry in the fork (what lives in the core vs in a strategy
  pack under `src/class/`, and the upstream cherry-pick protocol).
- **Tasks**: [`docs/tasks/README.md`](docs/tasks/README.md); the issue's
  `status:*` label is the status.
- **Plan**: [`docs/plans/getting-stronger.md`](docs/plans/getting-stronger.md)
  - the strength roadmap (ceiling fixes, formula engine, parameter evolution,
  knowledge). **Backlog**: GitHub issues labelled `backlog`, ranked by their
  `priority:*` labels.
- **Run records**: [`docs/runs/README.md`](docs/runs/README.md) - reach-rate
  at the chosen stage is the number (#25); a change without a record is an
  unmeasured change.

**Who is who** (owner rule, 2026-11-03): WE are **diegoami**. **neostryder**
is ANOTHER DEVELOPER (upstream) - never "us", never conflated with our
forks. Four repos, two each: `neostryder/neo-angband` (upstream ENGINE) and
`neostryder/neo-angband-mod-borg` (upstream MOD - the 4.2.6 borg PORT our
fork imported; "the port" means THEIRS unless qualified) versus
`diegoami/neo-angband` and `diegoami/neo-angband-mod-borg` (OUR forks -
PR vehicles only, never working trees). A defect found in our tree that
also exists at the import boundary `70145c5` is INHERITED FROM THEIR port,
not ours; verify against the pristine checkouts before attributing (the
B32 `track_step` finding is the case study: first reported as "ours",
actually theirs - mod-borg#21).

Upstream is `neostryder/neo-angband-mod-borg`; the import commit `70145c5` is
the boundary, and it is the SAME boundary commit neowarrior-borg imported at,
so cherry-picks between the forks are trivial.
