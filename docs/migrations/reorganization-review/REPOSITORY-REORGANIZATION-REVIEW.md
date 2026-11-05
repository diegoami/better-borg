# Independent review: repository reorganization

Reviewer: Claude Opus 5.5 (independent model session, owner-launched), 2026-11-05.
Inputs: umbrella AGENTS.md, SESSIONS.md, REPOSITORY-REORGANIZATION.md (coordinator
dossier, treated as claims to verify) and REVIEW-REQUEST.md.

## 1. Verdict

**CHANGES REQUESTED.**

The ownership model, issue migration, source↔consumer lifecycle and proposal-base
hygiene are sound, and I verified them independently. Merging the PRs did not approve
them for me.

Two things block approval:

- **Publishing containment is incomplete.** The engine tracker's default branch
  carries four Neo release/publish/Pages workflows. They were never registered, so
  they were never disabled. Pushing one upstream `v*` tag to the fork would publish a
  GitHub Release (R1).
- **The bootstrap and validation records have gaps.** The Mandos entry document
  routes new sessions by old repository names, and those names collide with the
  protected lab and pristine checkouts (R2). The dossier says the engine live-game job
  passed, but post-merge CI on the reviewed master head is red (R3). The session
  checkpoints depend on untracked umbrella files (R4).

All of these are small, actionable corrections. None needs a redesign.

## 2. Scope and exact commits

All four heads match REVIEW-REQUEST.md. All four working trees were clean and equal
to their remote tracking branches after a fetch at about 21:20 CET.

| Tree | Branch | Head inspected | Covered |
| --- | --- | --- | --- |
| better-borg (diegoami/mandos) | main | `a783c2535cf4eee7bc61f2e1cfda329543ed0ee3` | yes |
| neo-angband-tracker | master | `81d2fc873472014e3ba870b4e115bf4bfa0cf484` | yes |
| neo-angband-tracker/.worktrees/angband-c | workbench/c-borg | `23aaf89aea93592227ff807f647fb3e68ad81998` | yes (native C mode; same `.git`, same session) |
| neo-angband-borg-mod-tracker | master | `33552ab8504f5431d02f63a3b340757a47739661` | yes |

Upstream references at the time of review: angband/angband master = `e473720e` (the C
pin), neostryder/neo-angband master = `0cc75b4a`, neostryder/neo-angband-mod-borg
master = `74a017d2`. All three equal the `session.json` baselines.

The coordinator receipt (`better-borg/docs/migrations/review-receipt.json`) lists
pre-merge task heads. Their trees are identical to the merged engine, port and native
C trees. For Mandos, the merged tree differs from the receipt head only by the three
added review/automation docs under `docs/migrations/`.

Also inspected, without changing anything: borg-rs-reference (`c375a824`, sparse
`docs`, push `DISABLED`), the neo-angband lab checkout (`neowarrior-lab` at
`9d6ae21ec`), neo-angband-upstream (detached at `0cc75b4a`), the original
neo-angband-mod-borg (`74a017d2`), and the modification times in mandos-lab-data.

## 3. Findings

### Required changes

**R1 — High (blocking): latent publishing workflows on engine tracker master were never contained.**

- **Evidence.** `neo-angband-tracker/.github/workflows/` contains `release.yml`,
  `publish-npm.yml`, `pages.yml` and `mod-canary.yml`.
  `gh api repos/diegoami/neo-angband-tracker/actions/workflows/release.yml` (and the
  same call for the other three files) returns **404**: GitHub has never registered
  them, so they cannot be in a disabled state.
- **What `release.yml` does.** Its trigger (line 31 onward) is `push: tags: v*`,
  excluding `v*-edge.*`. It has `contents: write` and publishes a GitHub Release with
  GITHUB_TOKEN. No secret is needed for that step.
- **The other files.** `publish-npm.yml` triggers on the same tags with
  `id-token: write`. `pages.yml` triggers on `release: published` and has
  `pages: write`.
- **The receipt disabled a different workflow.** The receipt
  (`better-borg/docs/migrations/tracker-automation.json`) and dossier §10 (lines
  440–446) say "edge/create-release" was disabled. The `create-github-release`
  workflow that was disabled is the **C** `release.yaml` from workbench/c-borg, not
  Neo's `release.yml`.
- **Consequence.** One routine mirror of upstream tags, such as a future
  `git push origin --tags` or `v1.23.0`, would publish an unrequested public product
  release. This is the same class of incident as the edge prerelease, which came from
  syncing master. The claim that publication is contained is not true as written.
- **Requested correction.** Contain these workflows in a way that survives
  registration. Options:
  1. Add a repository-level guard, such as `if: github.repository == 'neostryder/neo-angband'`,
     on the publishing jobs. This is the most robust option, but it is a FORK-marked
     edit to an upstream file.
  2. A tag ruleset that blocks `v*` tag creation on the fork.
  3. An Actions setting or ruleset that restricts which workflows may run.

  Then record the actual mechanism in tracker-automation.json and dossier §10.

- **Also record in the same pass:**
  - **The Pages redeployment.** A `pages-build-deployment` run deployed gh-pages
    `fa84e1f` to `github-pages` at 2026-11-05T17:59Z. The content was unchanged, but
    §10 says "No new Pages deployment was performed".
  - **The `v1.23.0-edge.209` tag.** It exists only on the fork, at `836b8da2`, and its
    origin is unexplained.
  - **Mandos's own release workflows.** `github-release.yml` and `nexus-publish.yml`
    are active (`v*` tags, Nexus also on manual dispatch). This is probably intended
    for the product repo, but §10 omits it.

**R2 — Medium-High (blocking for bootstrap safety): the Mandos entry document routes by names that now belong to protected checkouts.**

- **Evidence.** `better-borg/AGENTS.md:18-19` says: "Port defects and their fix
  branches live in our **neo-angband-mod-borg** fork session. C Borg, Angband game and
  Neo engine defects live in our **neo-angband** fork's combined session."
- **The collision.** Under the umbrella, `neo-angband/` is the running lab checkout
  and `neo-angband-mod-borg/` is the pristine upstream reference. The dossier §4 and
  the umbrella AGENTS.md both say neither may be used as a workbench.
- **Consequence.** AGENTS.md is the first file a fresh Mandos session reads, and
  CLAUDE.md imports it. An agent that follows it literally can open or modify the lab
  or the pristine reference. `docs/process.md:8-9` and `docs/SESSION.md` use the
  correct names, so the entry point contradicts the process document.
- **Requested correction.** Replace the two names with `diegoami/neo-angband-borg-mod-tracker`
  (`../neo-angband-borg-mod-tracker`) and `diegoami/neo-angband-tracker`
  (`../neo-angband-tracker`). Optionally reword "our neo-angband fork" in all four
  copies of `docs/SESSION.md` (line 15).

**R3 — Medium (blocking for evidence honesty): the post-merge CI failure on the reviewed engine master head is not disclosed.**

- **Evidence.** CI run 42096005784 on master `81d2fc87` (2026-11-05T19:39Z) has
  conclusion **failure**. The "Play the game" job logged:
  `play-smoke FAILED: pressing 'C' (character-sheet) changed nothing on screen`.
- **Likely cause.** The PR head `68155760` has an identical tree and passed (run
  42092779990), so this is most likely a flaky Electron smoke test.
- **What the dossier says.** §9 (line 391) says "live-game job passed", and the
  checkpoints describe the default branch as ready.
- **Consequence.** The default branch's current CI status is red. Under RULES 8 a
  baseline failure needs attribution and tracking, not omission.
- **Requested correction.** Re-run, or attribute the failure on an issue. If it is
  flaky, link an issue that tracks it as an inherited upstream smoke flake. Amend §9
  and the tracker checkpoint to cite both runs.

**R4 — Medium: checkpoints and the review issue depend on files that are in no repository.**

- **Evidence.** tracker#25, mod-tracker#26, mandos#36 (latest comments) and tracker#2
  send the next session to the umbrella files REPOSITORY-REORGANIZATION.md and
  REVIEW-REQUEST.md. The umbrella is explicitly not a git repository.
- **Consequence.** The claim that sessions can bootstrap from default branches and
  remotes alone does not hold on another host or after a fresh clone. The dossier
  content, including the transfer and consumer appendices, would be lost with this
  directory. The checkpoint text also has many missing spaces ("Defaultmaster81d2…",
  "152C finding issues"), which hurts readability and search.
- **Requested correction.** Commit the dossier, this review, and any follow-up
  response into one owner repository, for example `better-borg/docs/migrations/` next
  to review.md, or attach them to tracker#2. Update the checkpoint links to that
  durable location. Optionally post a checkpoint with corrected spacing.

**R5 — Low-Medium: one fixed/closed consumer lacks the upstream-correction evidence its rule requires.**

- **Evidence.** mandos#127 is labelled `fixed` and CLOSED, with source
  diegoami/neo-angband-borg-mod-tracker#3.
- **The upstream thread is still open.** The cited thread neostryder/neo-angband#415
  is OPEN. The claimed upstream correction is code already present at import pin
  `1fa2f8d` (a `knownFeat` wrapper), not a merged correction.
- **The source body contradicts itself.** Its 2026-11-05 "Carry audit" line says
  `carried`, while its "Current status" says fixed.
- **How the other 14 compare.** Each has a closed source plus a merged upstream PR or
  an accepted upstream commit. #147 relies on accepted commit `0cc75b4af` with no
  thread, which is acceptable.
- **Consequence.** The rule "fixed/closed only after upstream correction AND verified
  adoption" is applied with an undocumented exception.
- **Requested correction.** On mod-tracker#3 and mandos#127, state explicitly that
  upstream code at the pin already contains the correction, and cite the file and
  line at `74a017d`. Remove the stale "carried" audit line from the source body, or
  mark it as historical. If the correction is not demonstrably upstream, reopen #127
  as carried.

### Optional suggestions (non-blocking)

**O1 — Provenance labels.** `source:borg-rs` is on the 9 group-41 findings
(#160–168) only. The other 143 findings that borg-rs reported carry the provenance in
their bodies but have no label. Backfilling the label would make the intake filter in
`docs/BORG-RS-INTAKE.md` complete.

**O2 — Native CONTRIBUTING.** `.worktrees/angband-c/CONTRIBUTING.md` replaced the
upstream file (164 lines of git workflow plus the C coding rules: K&R, C89, `my_`
string functions). Unlike the README, it has no snapshot in
`docs/upstream-reference/`. Fix branches start from angband/master, so they still have
the original. The workbench reader does not, which is in tension with RULES 7
("preserve original technical docs"). Add a snapshot or a pinned link.

**O3 — Broken anchor.** `neo-angband-tracker/docs/c-fix-handoff.md:3` links
`C-BUGS.md#open-a-new-pr-directly-from-the-existing-c-branch`. The actual heading is
"Easy method: open a PR from an existing C proposal branch".

**O4 — Stale test filename.** `.worktrees/angband-c/.github/workflows/fork-session-docs.yml`
still names the old `tools/c-bugs-source.test.mjs`. It is skipped silently by the
`hashFiles` guard. Master uses `.node-test.mjs`.

**O5 — Duplicated watch scripts.** `tools/c-upstream-watch.mjs` and
`tools/upstream-watch.mjs` are byte-identical copies in all four trees, including the
port tracker, which does not own C. Drift between them is a future risk. Consider one
canonical copy plus thin callers, or a check that keeps them identical.

**O6 — Ambiguous C base wording.** PLAN.md says "angband/master at the recorded C
pin", while README says "current angband/master". The two are equal today. State
which one wins when upstream C advances, for example: "branch from the recorded pin;
re-pin deliberately".

**O7 — No local push guard.** No clone has a pre-push hook or a disabled `pushurl`
for the `angband` and `upstream` remotes. GitHub reports `push:false` on all three
official repos, so the risk is low. A `pushurl=DISABLED`, as already done for
borg-rs-reference, would be cheap insurance.

**O8 — Cosmetic leftovers.**
- Old repository names remain in some issue bodies (e.g. tracker#13, "Threads:
  diegoami/neo-angband#1"); they redirect.
- tracker#9's title still says "during Mandos".
- tracker#15 calls an engine issue a "Neo port defect".
- Old anchor links into Mandos `docs/C-BUGS.md` now land on the pointer page.

**O9 — Port issue 25 attribution.** The 10/10 pass on the patched lab engine points to
the engine side. Keep the next attribution step explicit, so the issue moves to the
engine tracker if a hunk is identified, rather than staying on the port tracker by
default.

## 4. Verification performed

Everything below was read-only. Scratch output is in my session scratchpad; I wrote
nothing in any repository.

- **Git state.** Ran `git status`, `rev-parse` and `fetch` on all four trees and
  `ls-remote` on the three upstreams and both forks.
  - The tree-equality check (merged commit vs. reviewed task head) is described in §2.
  - The native C tree is the C pin plus 1 commit that changes 13 docs/tool files and
    no `src/`.
  - Engine master vs. `0cc75b4a`: no changes under `packages/` or `mods/`. The only
    non-doc changes are templates, the session workflow, `.gitignore`, `session.json`
    and test/lint collection config.
  - Mandos `43e1a8e..a783c25`: no change under `src/`, `plugin.*` or the patch code.
    `package.json` changed only its `verify` script (the c-bugs gate moved to
    check-session).
- **Bootstrap self-checks.** `node tools/check-session.mjs` passed in all four trees.
  `node tools/c-bugs.mjs --check` reported 152 records with valid coverage.
  `node --test` on the c-bugs-source and borg-rs-watch suites: 8/8 passed (Node
  24.21).
- **Native C build and tests.** Ran an out-of-tree build in scratch under
  `flock /tmp/angband-validation.lock`, using the README's commands
  (`-DSUPPORT_BORG=ON -DSUPPORT_TEST_FRONTEND=ON`, then the `alltests` target).
  Configure and build succeeded, **965/965 unit and 5/5 frontend tests passed**, and
  the worktree stayed clean. This shows only that the native build works at the pin.
  It validates no C candidate's consequence.
- **Live watches** (isolated caches):
  - `upstream-watch`: 176 trackers, 72 references, 0 audit problems, exit 0.
  - `c-upstream-watch`: official C equals the pin. The dossier's caveat that the
    discovery window covers only 100 of 230 PRs is confirmed.
  - `borg-rs-watch`: file-and-issues mode, 41 groups, blob `0f82fe3c`, issue feed 0.
- **GitHub API, issues and links:**
  - Neither source tracker defines or applies any consumer label (carried, fixed,
    partially-carried, not-carried, patch-active).
  - All 26 consumers mandos#125–150 have bidirectional links. Counts are 5 carried
    (all open), 5 partially-carried (open), 1 not-carried (open) and 15 fixed (all
    closed, all with closed sources). patch-active is on #126, #128, #129 and #147.
  - No own-only Mandos issue carries an upstream or consumer label.
  - All 47 old mandos issue API URLs resolve to the Appendix A destinations; the
    states match, and web URLs redirect with 302.
  - 152 open `upstream-c`+`finding` issues with 152 distinct CBUG IDs. Evidence labels
    are 132 reported-lead, 18 source-checked, 1 flags-only and 1 reproduced (#13).
- **Proposals.**
  - Neo #429/432/433/442 and mod #63–66 are open and mergeable at the expected heads,
    with head repositories under the renamed forks.
  - None of the 9 proposal heads contains a bootstrap commit; the Neo heads branch
    from upstream `836b8da2`.
  - Tracker PR#1 is closed, unmerged, at `540f621`, with base `c-borg-reference@e473720`,
    1 file changed, and labels `c-proposal` and `postponed`.
- **Automation.** Checked workflow states in all three repos, Actions permissions,
  Pages config, releases and tags, and run history since 2026-11-04.
  - The edge release is a draft with its tag, target and 4 assets intact, which
    matches the receipt.
  - The mod tracker has its release, Nexus and redirect workflows disabled.
  - The R1 discrepancies are listed above.
- **Safety.**
  - The lab checkout is unchanged at `9d6ae21ec`, and the pristine references are at
    their pins.
  - The newest mandos-lab-data file is from 11:22 CET, before the reorganization's
    first remote action (about 18:25 CET). No lab or save changes were observed.
  - borg-rs-reference has push disabled.

**Not verified:**
- Mandos's full gate (1143 tests), the port baseline (862 pass / 4 known failures) and
  the patched-control 10/10 were not re-run. I checked their documentation, not their
  execution.
- Full engine CI was not re-run locally; I relied on the GitHub runs cited in R3.
- I did not read the comment history on every transferred issue, only titles, states,
  labels and links, plus spot checks.
- The 14 other fixed consumers' "verified downstream adoption" receipts were not
  re-proven.

## 5. Consistency assessment

The operational model is coherent:

- **Engine tracker.** The README explicitly owns original C, especially the Borg, and
  the Neo engine. It names the mod and Mandos as separate.
- **Native C tree.** It is in the same fork and shares `.git`, at the correct C base
  (`e473720`, equal to angband/master). Its commands work. No proposal is based on Neo
  master.
- **Port tracker.** It is fidelity-only: RULES 4 and PLAN 3 forbid C-correction
  translation there.
- **Mandos.** It owns C→TS translation under declared APIs, with an explicit
  not-applicable outcome (RULES 13, PLAN 4).
- **borg-rs.** It is an independent lead source and Rust consumer with no Neo duty,
  and intake never auto-promotes (`docs/BORG-RS-INTAKE.md`, `borg-rs-watch`).
- **Source vs. consumer state.** Source and consumer labels are cleanly separated. The
  lifecycle rules are stated the same way in all three RULES files and enforced by
  `upstream-watch`.
- **C landing page.** It points to the issue list rather than keeping its own live
  status list.
- **Future product.** better-borg-c is correctly kept as a discussed future convention
  (dossier §2.5). Nothing in the repositories implements it.

The gaps are operational, not conceptual: automation containment (R1), one stale
entry document (R2), and the honesty and durability of the records (R3, R4, R5).

## 6. Acceptance criteria for the required changes

- **R1:**
  - Each of the four workflows is either guarded, with the job condition visible in
    YAML on master and FORK-marked, or prevented by a ruleset or Actions restriction
    shown through the API.
  - A dry argument or test shows that a `v*` tag push to the fork cannot create a
    Release, npm publish or Pages deployment.
  - tracker-automation.json and dossier §10 list the mechanism, the 17:59Z Pages
    redeployment, the edge.209 tag origin (or "unknown, retained"), and Mandos's
    intentional product release workflows.
- **R2:** `better-borg/AGENTS.md` names only the canonical tracker repositories and
  directories. A grep for the bare names `neo-angband-mod-borg` and `neo-angband ` in
  the session entry docs returns only deliberate references to the protected
  checkouts.
- **R3:** A green CI run on the current engine master, or an issue that attributes and
  tracks the play-smoke failure, linked from the tracker checkpoint. Dossier §9 cites
  the actual post-merge run and outcome.
- **R4:** The dossier and review live at a durable URL in an owner repository or issue.
  All three checkpoints and tracker#2 link there instead of to umbrella paths.
- **R5:** mandos#127 and mod-tracker#3 carry an explicit justification with a pinned
  upstream file and line, and no contradictory carried line. Otherwise #127 is
  reopened as carried.

## 7. Residual risks and open questions

- **Inherited failures vs. failures from the rework.**
  - The 4 published port play/rest failures (port#25 / mandos#150) and the 36 skips
    when content is absent are inherited and honestly reported.
  - The bundle-level patched-engine control proves no single hunk.
  - The play-smoke red in R3 is most likely inherited flakiness, but it is
    unattributed.
- **Historical references.** Bare numbers in transferred comments refer to their
  original repository, so readers must use context. The dossier says so; this remains
  a permanent cost of transfer.
- **Intake limits.**
  - `c-upstream-watch` sees only 100 of 230 Borg PRs, so it is not a duplicate search.
  - `upstream-watch` uses `gh issue list --limit 1000`, and the engine board already
    holds about 170 issues.
  - The borg-rs issue feed is empty, so the dual-feed path is tested but not yet
    exercised live.
- **The C posting pause vs. consumer closure.** Mandos consumers of C corrections can
  only become fixed after an upstream C correction. While our own posting is paused,
  that depends on third parties, so such issues may stay carried and open indefinitely.
  This is by design, but the owner should accept it explicitly.
- **Future upstream merges.** They will keep importing new inherited workflows, as R1
  shows. Every sync needs a workflow and trigger audit before it is pushed.
- **better-borg-c** (discussed, not implemented). If it is created, make its
  "imported from C history" origin explicit, so that GitHub fork-network rules and
  the one-fork constraint do not push it into the tracker fork. Give it its own
  consumer-state labels. It must never put consumer tags on neo-angband-tracker
  source issues.
