# Mandos development and adoption process

Start at ../AGENTS.md, ../RULES.md, ../PLAN.md and checkpoint36. This process
owns Mandos work, not the source-defect queues in the two repair forks.

## Workspaces and issue ownership

[Session map](SESSION.md). Neo engine/C session: ../neo-angband-tracker, native
C worktree inside it. Port session: ../neo-angband-borg-mod-tracker. Mandos:
../better-borg. The original lab/pristine checkouts remain unchanged references.
Transferred histories/redirects are in migrations/repository-split.json.

Open a source defect in its owning fork with provenance, pins and reproduction;
link Mandos-specific adoption/consumer work separately. Source repairs/proposals
are implemented by that session from the correct pristine upstream base.
Native C submissions remain paused; no repo performs them automatically.

## Mandos gate

Use Node22+, source ~/.nvm/nvm.sh locally, and pnpm from package.json.
pnpm install --frozen-lockfile installs the matching published content/engine
and applies the named patch. Run-record tools use tools/engine-pin.mjs; md5sum of
node_modules/@rpgm-tools/neo-angband-core/dist/game/trap.js identify the runtime;
current carried trap fingerprint is34c27241f96aceff581bcb186a9d898f.

Run relevant focused tests first, replay.test.ts alone when its boundary is
affected, then CI=1 pnpm verify logged under artifacts/. Use
flock /tmp/angband-validation.lock to avoid another local heavy gate across
sessions. A worktree must have dependencies; install or use an owned symlink.
Relevant skips/reds require diagnosis, not assertion/seed edits to pass.
Full gate checks session bootstrap, types/tests and committed plugin currency.

Behavior changes retain before/after fixed-seed stage records and legal
scenario controls; source-only evidence is not a practical outcome claim.
Committed docs/runs/evidence is append-only. Bulky scratch data stays ignored.

## Adoption and merge

Inspect canonical correction and exact API/dependency pins. Adopt with local
Mandos changes and FORK marks; rebuild plugin.js, verify applicable published
package/harness/plugin and separately authorized lab consumers. Source merge
is not deployment. Keep patch-active on required backports even after closure.
Do not remove a hunk just because another consumer adopted a fix.

The main session merges after the documented gate and required CI. No amend,
force-push or moved tags; preserve topic heads and unique evidence. Update the
owner integration issue and checkpoint36 at merge/stop. No background agent
without owner direction; independent model review remains owner-launched,
with a ready-to-paste read-only prompt in migrations/review.md.

## Records and lab safety

The lab remains on its intentional branch/build and uses ../mandos-lab-data.
Do not repurpose it for either repair session. tools/lab.mjs, tools/runs.mjs,
postmortem tools and docs/runs/README.md document current instruments; original
setup/lab procedure is archived at history/repository-split/process-before.md.
That archive is historical context, not a competing queue/scope policy.
