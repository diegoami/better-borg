# Upstream watchlist

The ecosystem's issues live in the consolidated tracker
(`neostryder/neo-angband`), dispositioned with `repo:*` labels — the same
vocabulary our trackers use. This file is what we watch and why. Re-check at
every milestone close; date each pass. When WE file upstream (the #428
pattern): we cannot apply labels on their tracker (maintainer-only, verified
2026-11-02) - suggest them in the issue body as a footer, in their vocabulary
(`bug`/`effort:*`/`priority:*`/`repo:*`/`source:community`/`area:*`). Relevant upstream fixes are
cherry-picked with the floor-bump rule (process §7, step 3); upstream issues we can
advance become B-tasks here, diagnosed and branched in OUR fork, then offered
upstream (#428 is the pattern).

Historical sync note, 2026-11-03 at the M1 close: both upstreams —
`neostryder/neo-angband` and `neostryder/neo-angband-mod-borg` — zero
commits ahead of the pins checked in that pass; nothing to adopt then.
The prior 2026-11-02 pass recorded the same result. These are dated
observations, not live status. Use `node tools/upstream-watch.mjs`,
`node tools/upstream-sync.mjs` and the tracking issues for current state
(process.md §7).

## Our threads: one tracking issue each

### Target issue homes and pre-outreach evaluation

The owner selected our mod fork for upstream port-defect trackers and our
engine fork for C Borg, Angband game and Neo engine trackers. Mandos keeps
its own defects/integration and the Neo Borg development workspace.
[Evaluation #2](https://github.com/diegoami/neo-angband/issues/2) is ready
before community outreach: replace the temporary monolithic catalogue
input with a scalable model, define the dedicated C/game/engine session,
and preserve history/IDs/links in migration. Existing trackers remain
current until moved; watch tools must follow their new homes as part of
that migration. Keep proposal-fork default branches current by fast-forward
only, preserving all topic heads.

### Carry status and attribution

Current issue state takes priority over new triage or implementation. Inspect
both boards at session start/end, before choosing a task, after upstream
movement and after a merge/consumer change. Read-only commands:
node tools/upstream-watch.mjs and node tools/c-upstream-watch.mjs.
They report review signals and never infer a fix or change issue state.

Every issue labelled `upstream` or `upstream-c` must have exactly one of:

| Label | Meaning |
| --- | --- |
| fixed | Correction adopted with our changes, rebuilt and verified; upstream-derived bugs include the upstream correction. Close the bug. |
| carried | Local correction applied in main/required consumers, awaiting upstream delivery/adoption. |
| partially-carried | Some correction/components are present; unresolved scope remains open. |
| not-carried | No applied correction in the required consumers. A proposal or stored file alone does not count. |

patch-active is an independent maintenance label for required package/build
backports. A fixed bug can be closed while patch-active remains. The board
audit includes closed patch-active trackers so source adoption never hides
remaining patch maintenance. Archived fixed inline corrections need not
stay in the open bug queue.

Closure follows verified source adoption, not waiting for a published
release. Preserve affected and correction pins, consumer/build receipts and
the issue links. Keep partial/unreproduced cases open; upstream closure by
itself is not proof that our actual original case is solved.

Use labels and the issue body for status, never title suffixes or guesses
from an upstream issue being open/closed. A running desktop can still use
an older build; record source/build coverage separately from deployment.
Use fixed on adopted and verified upstream fixes, retaining the original
carry history and any independent patch-active follow-up.

Always state the origin and exact C reference revision. **Inherited from
the imported TypeScript port** and **inherited from C** are different:

- Correct C behavior missing or changed in the port is a Neo port defect.
- Wrong C behavior faithfully reproduced by Neo is a C defect. Correct C
  upstream first, then propose Neo parity with that recorded C revision.
  Mandos may carry an earlier marked CHOICE; that is not permission to
  change Neo's behavior before C changes.

`upstream-c` identifies C-origin investigations in our local catalogue and
proposed fixes, not a submission queue or merely a C-reference test.
Candidate attribution may be unproven; say so explicitly.
Both labels can track related work, but they do not prove a C defect or
authorize either submission. Split independent C and port defects when
their evidence/routes differ.

### Required tracking record

Each tracker records **Threads** (exact repository/number, or `none yet`),
**Origin/reference**, **Target/sequence**, **Carried** (main/source commits,
affected components and consumers, patch path/PR-marked hunks or inline
source paths), **Scenario/evidence**, and **On release** (adoption, removal
and revalidation conditions). A patch file's existence alone is not proof
that a consumer applies it.
For Borg fixes, identify the source merge and rebuilt plugin. For engine
fixes, identify the authoritative PR source, applied package hunks and each
required lab/build consumer. A C patch affects the C build; it does not
automatically fix the TypeScript engine or Borg.

For every upstream-C proposal, retain a reproducible natural or synthetic
scenario with legal/reachable state, normal rules, source/content pins,
RNG/controller/perception initialization, before/after commands and actual
outcomes, and negative controls. Compare C, the unfixed implementation and
the correction as applicable. C and Neo saves need equivalent states, not
a shared binary save. Prove a meaningful consequence in plain language;
do not infer death prevention from changed flags or scores alone.

C work is **local-only** under the owner's 2026-11-05 direction: maintain
[our catalogue](C-BUGS.md), evidence and fix-proposal PRs in diegoami
repositories. No issues, PRs or comments go to angband/angband now. We are
not taking on upstream C maintenance and do not routinely ask to submit.
A future explicit owner instruction must change that pause. Current source
and duplicate checks still matter for attribution and avoiding duplicate work.

C-source proposals use our fork's `c-borg-reference` base (the C snapshot),
with one fix on each `pr/c-borg-*` branch. Keep them separate from the fork's
Neo engine branch. A draft proposal can remain unmerged with missing
validation clearly stated; a validated C-game outcome requires native C
scenario/control evidence. No branch or stored patch alone is `carried`.

The owner separately authorized confirmed Neo port-defect reports/PRs
directly after attribution, reproduction and duplicate checks. Our local C
proposal does not satisfy Neo's requirement to follow corrected upstream C.
Mandos may carry an earlier explicitly marked divergence as defect work.
C patches remain in `patches/upstream-c/`; the combined pnpm engine patch
keeps one hunk group/PR marker per fix. Do not send a Mandos CHOICE to Neo
as a port fix.

### Review cadence

Run `node tools/upstream-watch.mjs` at bug-work session start/end, after
merge/revert or consumer changes, after upstream movement/release, and
before a status report/checkpoint. Update the affected tracker and replace
its carry label in the same pass; resolve missing/conflicting labels.
This is a workflow cadence, not an unattended scheduled job.

The read-only report shows upstream state beside Mandos carry status,
includes internal candidates and flags metadata/API failures with a nonzero
exit. It observes PR heads as well as issue activity. Movement can be ours,
a maintainer's or a bot's: inspect it before attributing it. Upstream merge
or closure never automatically applies a fix, changes our labels or removes
a patch. On delivery, verify the adopted implementation, update the floor
if needed, remove only matching patch hunks and rerun the scenario/gates.

Per-thread state does not live in this file. Every thread we hold upstream
(an issue or PR we filed, or a seam we depend on) has a TRACKING ISSUE on our
tracker, labelled `upstream`, whose body opens with a `**Threads**:` line
naming the upstream refs (`owner/repo#number`, or `none yet`), then **What**, **Kind**
(engine gap / port defect / seam request / watch), **Carried** (where our fix
lives meanwhile: the core, the harness patch, the lab branch - or why
nothing), and **On release** (what we do when a release carries it). It
closes when the actual upstream correction is adopted, rebuilt and verified;
patch-active separately retains any still-required backport follow-up. List them:

    gh issue list --repo diegoami/mandos --label upstream

`node tools/upstream-watch.mjs` reads its thread list from those issues, so
filing a tracking issue IS adding the thread to the watch. Process §6 says
what we do while we wait.

**Historical upstream convention**: some Neo issues stay open for release
tracking. Our own current rule closes a bug after verified source adoption;
release/backport maintenance uses patch-active independently. Read the actual
implementation and receipts rather than copying upstream issue state.
**Historical build note**: the earlier fresh core worktree produced 53
missing-declaration errors because core referenced mod-sdk/dist before it
was built. Build the project references from the engine repo root before
attributing such failures; use the current build output for current claims.

## Touched by us, worth closing the loop

- **neo-angband#415** (`repo:mod-borg`, parity, effort:S) — "the Borg reads
  live terrain where it should read the remembered map". **Verified fixed at
  our pin (2026-11-02, B14/#14)**: all five named call sites read through the
  `knownFeat` wrapper (`src/core-api.ts:393-404` via `borgView().cell`,
  `:440`), active on core 1.23.0-beta.1. Site-level regression pins in
  `src/remembered-terrain.test.ts` (fail red if any site reverts to live
  reads); per-site evidence commented upstream. Upstream keeps the issue open
  until a stable release carries the fields, and for the rest of its audit
  (monsters/simulateLoadout/stores). **Filed as our #14.**

## Verified in our import (reference)

- **neo-angband#377** — unknown-flavour handling after core 1.22. Our import
  carries the fix (`src/item/item.test.ts:477` cites the number); the issue
  is our label-vocabulary reference example.

## Ignored by policy

The `repo:future-mod` family (endgame/dungeon/hall-of-legends phases) and
`repo:mod-qol` items: content and QoL, not the borg's line. Revisit only if
the owner changes the authorized scope; a milestone alone does not
authorize new feature work under rule 15.
