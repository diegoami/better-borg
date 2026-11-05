# Mandos

Mandos is our class-agnostic Borg derivative: its own behavior, strategy-pack
structure, run records, postmortem/replay tools and desktop-lab integration.
This repository/session develops Mandos and adopts verified fixes from the
owning upstream-repair forks. It is not their defect queue or source workbench.

Start an agent at [AGENTS](AGENTS.md), [RULES](RULES.md), [PLAN](PLAN.md) and
[checkpoint36](https://github.com/diegoami/mandos/issues/36). The
[three-session map](docs/SESSION.md) names independent workspaces:

- diegoami/neo-angband-tracker: original C Borg, Angband game and Neo engine fixes;
  one fork, separately based C/Neo worktrees, native catalogue/evidence/patches.
- diegoami/neo-angband-borg-mod-tracker: TypeScript Borg port defects and proposals.
- diegoami/mandos: Mandos-specific issues, development and adoption/integration.

[Player/control documentation](docs/README.md), [development/adoption process](docs/process.md),
[fix integration](docs/UPSTREAM.md), [run records](docs/runs/README.md),
[patch ledger](patches/README.md), [transferred-issue map](docs/migrations/repository-split.json).
The [C bug catalogue](https://github.com/diegoami/neo-angband-tracker/blob/master/docs/C-BUGS.md)
is maintained in the combined engine/C session. Old catalogue pages here link to the canonical location.

Use Node22+ and the pnpm version in package.json. Run pnpm install
--frozen-lockfile, then CI=1 pnpm verify. The published core/content/SDK pins
and named backports are the tested runtime; run-record tools use tools/engine-pin.mjs to name it. Rebuild plugin.js for runtime source changes. The running owner lab is
separate; source merge alone does not refresh it or touch owner data.

Current work remains bugs, integration and owner-requested maintenance.
Backlogged gameplay features stay parked. Source defects are attributed and
fixed in their owning fork, then integrated here with actual consumer receipts.
No official C submissions. Upstream credits, GPL/Angband licence and
AI_USAGE_POLICY remain intact. Historical pre-split docs are preserved under
[docs/history/repository-split](docs/history/repository-split).

The [repository reorganization review records](docs/migrations/reorganization-review/README.md)
include the independent verdict, coordinator response and durable source/consumer workflow evidence.
