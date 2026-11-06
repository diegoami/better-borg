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
current published beta.3 trap fingerprint is ce8b43e933803487d70973d5a9e0905c.
The active package backports are PR432/input-flush and PR433/accepted-birth
provenance; neither changes trap.js. Historical beta.2 records retain their
original34c27241f96aceff581bcb186a9d898f fingerprint and four-unit patch.

Run relevant focused tests first, replay.test.ts alone when its boundary is
affected, then CI=1 pnpm verify logged under artifacts/. Use
flock /tmp/angband-validation.lock to avoid another local heavy gate across
sessions. A worktree must have dependencies; install or use an owned symlink.
Relevant skips/reds require diagnosis, not assertion/seed edits to pass.
Full gate checks session bootstrap, types/tests and committed plugin currency.
[CI routing](CI.md) documents the conservative prose-only metadata/docs/privacy
gate, PR/main/manual triggers and workflow-maintenance validation. Unknown,
workflow and runtime paths retain full verification.

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

## Native C proposal intake

Canonical C source bugs, native evidence and reusable proposals remain in
[neo-angband-tracker](https://github.com/diegoami/neo-angband-tracker/issues).
Mandos owns the corresponding TypeScript applicability decision and translation.
The separate better-borg-c product consumes C directly; its adoption is neither
proof of Mandos applicability nor a replacement for our own tests.

On session startup and a producer-ready handoff, inspect the ready named C
proposals and their existing Mandos dispositions on integration queue111 before
choosing work. A validated clean local proposal is eligible **before upstream
acceptance**, including a retained closed-unmerged/c-proposal branch. A source
issue can remain open while Mandos carries the verified correction. Do not use
an official merge or package release as an extra gate to start a useful carry.
Keep broad upstream reconciliation weekly/manual; this adds no daemon, Rust
polling or duplicate live C-defect catalogue.

For each ready correction:
1. Record the canonical source issue, reviewed source/proposal and evidence
   commits, native observed consequence and limits. Confirm producer/task
   ownership; do not reimplement its source repair in this repository.
2. Trace the exact defect into the current pinned TS call path. Distinguish
   **applicable**, **already correct**, **absent/not applicable at this pin**
   and **deferred behind a named missing subsystem**. For absent or unused
   symbols, give a scoped exhaustive search and decisive caller context, not
   just a matching name or a proposed patch. Record the inspected TS revision.
3. Link the disposition from queue111 and the source issue. Applicable work gets
   a distinct linked Mandos adoption issue before its isolated implementation
   PR. An absent path gets a reasoned audit receipt, not an invented correction
   or carried/fixed label. Deferred work names its existing dependency issue
   and an explicit re-evaluation trigger; do not create duplicate omissions.
4. Translate an applicable correction under declared Neo APIs, with provenance
   and marked baseline departure. Prove legal TS fail-before/pass-after and
   controls, rebuild the plugin and run the normal required consumer gates.
   Keep original native versus translated evidence separate. Maintain actual
   consumer patch/removal records where applicable; historical C patch copies
   under patches/upstream-c are not an active Mandos implementation ledger.
5. Verified local application is carried/OPEN until upstream resolves it and
   the correction is adopted and normally verified here; then fixed/CLOSED.
   Existing equivalent carries can already satisfy adoption: do not reimport
   or repeat an unchanged full suite just to close the original scope.
   Keep patch-active independent of closure and remove each hunk only after
   its own package/build replacement is proved. Source state remains producer-
   owned; new actual recurrences get new linked reports.

Re-evaluate an absent/deferred disposition when its named counterpart arrives
or the inspected TS path materially changes. Merely importing unrelated source
history or a narrower HOME valuation leaf does not implement a tactical swap
selector. The [dated intake audit](tasks/C-fix-intake-2026-11-06.md) records the
first four dispositions and copyable evidence, not a second live status board.

## Records and lab safety

The lab remains on its intentional branch/build and uses ../mandos-lab-data.
Do not repurpose it for either repair session. tools/lab.mjs, tools/runs.mjs,
postmortem tools and docs/runs/README.md document current instruments; original
setup/lab procedure is archived at history/repository-split/process-before.md.
That archive is historical context, not a competing queue/scope policy.

## Fresh clone hooks

Clone the source trackers using their canonical names alongside better-borg.
Set git config core.hooksPath .githooks in Mandos. The wrappers prefer the
new neo-angband-tracker hook source (or explicit NEO_ANGBAND_REPO), with the
old lab path only as compatibility fallback. No live lab checkout is needed
to commit Mandos work on a fresh three-session setup.

## Backup and workspace recovery

[Current private-backup procedure](backup.md) covers lab state, restore points,
selected unique evidence and verification. The supplementary owner workspace
records four Git submodules (including the independent native C consumer),
directory inventory and exact recovery pins.
This supplements the accepted session plan; it changes no source ownership or
consumer lifecycle. OAuth migration remains tracked by Mandos #52.
