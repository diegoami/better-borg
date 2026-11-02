# Process

`CLAUDE.md` holds the rules; this file says how work runs. Same system as
neowarrior-borg (which is malpaco's, which is Geoclick2027's).

## 1. Setup

    pnpm install --frozen-lockfile
    pnpm verify                 # typecheck, suite, plugin.js currency

Play harness: sibling checkout of `neo-angband` at `../neo-angband`, or
`NEO_ANGBAND_REPO`. Optional: `gh`.

## 2. The two-fork routing

Three repositories, one rule each:

| Repo | Takes |
| --- | --- |
| `neostryder/neo-angband-mod-borg` (upstream) | defect fixes, offered as PRs from here |
| `diegoami/better-borg` (this repo) | everything class-agnostic: defects, improvements, the strength roadmap |
| `diegoami/neowarrior-borg` | warrior-only behaviour: birth, race defaults, warrior valuation |

**Found a generic improvement while working downstream?** File it here (issue
or PR) - do not fix it in a class fork. **Dupe-check first** (owner rule,
2026-11-02): before working any issue, check upstream's consolidated tracker
(OPEN AND CLOSED, `repo:mod-borg` / `repo:neo-angband`) for the same ground -
ours may be a duplicate, or theirs may already carry the fix (the watchlist,
`docs/UPSTREAM.md`, is the index). **Landed something here that a
downstream fork needs?** The downstream session cherry-picks it (same import
boundary, `70145c5` ↔ neowarrior's `301abd7`); its merge message names this
repo's SHA. **Fixed a port defect here?** Open the upstream PR from this
repo's branch; if upstream changes the approach, adopt theirs here and the
downstream forks cherry-pick the corrected version.

**Class forks do not multiply** (owner decision, 2026-11-02): there will be
no mage-borg, ranger-borg, or any further per-class repository. The endgame
is ONE class-agnostic core - this repo - with per-class strategy packs
(birth plan, race shortlist, valuation weights) selected by settings, and
per-class lineages isolated by install slots (T06 slot persistence already
provides that). `neowarrior-borg` is the single special case and is wound
down at a milestone boundary, not "when the warrior is done" (deepest-depth
is asymptotic; the lineage runs forever): at M2 open, its class-agnostic
instruments (restart loop, session driver, journal/graveyard, records)
move here - ending the play-session/session.ts duplication - its
warrior-specific code becomes strategy pack #1, and the repository archives
with its records preserved. A new class starts as a pack plus a setting,
never a fork.

## 3. Task files and the loop

`docs/tasks/B<nn>.md` (B for better-borg). One branch per task,
`task/B<nn>-<slug>`, squash-merged by the main session after its own
Done-when verification. Implementer contract as neowarrior's: build only what
the task asks, fail-before/pass-after for every new test, report out-of-scope
defects, update wronged documents, no status written into documents.

## 4. Reviews

One review per milestone: the big review of everything since the previous
tag, owner-launched with a prompt from `docs/review-prompt.md` (copied from
neowarrior-borg's when this repo needs it; adapt the issue numbers). The
reviewer posts findings and its verdict to GitHub itself and never edits the
repository. A task merges on main-session verification; per-task reviews only
on owner request or a flagged high risk.

## 5. Run records

Same format as neowarrior-borg's (`docs/runs/README.md`): per session, a
harness-written `runs.json` and a curated table, committed. Baselines are
append-only.

## 6. Upstream PRs

A defect fix merges here first (rule 3), then is offered upstream. The PR
body: the reproduced defect with its run record, the C reference, the fix,
and the test that fails without it. If upstream prefers a different fix, this
repo adopts theirs and the diverging local commit is reverted in favour of
the cherry-pick.

**The vehicle (settled 2026-11-02): never PR from a diverged main.** Our
`main` carries the rebrand and scaffold; a PR head from it would show all of
that. Instead:

1. Forks exist for exactly this: `diegoami/neo-angband-mod-borg` and
   `diegoami/neo-angband` (plain forks of upstream, no working tree of their
   own).
2. Cut the PR branch from UPSTREAM's master
   (`git fetch upstream && git checkout -b upstream-pr/<slug> upstream/master`),
   cherry-pick ONLY the fix commits from this repo's history, push to the
   fork, open the PR from `diegoami:<branch>`.
3. One PR per defect; the PR body is the issue body plus the diff. Suggest
   labels in the issue body (we cannot label on their tracker) and cross-link
   both ways.

The local game checkout's `neowarrior-lab` branch (environment patches) is a
different thing entirely: never pushed, deleted when a fixed release lands.

## 7. Keeping current with upstream

Cadence: a sync pass at every milestone close, plus ad hoc whenever an
upstream release lands. The pass, dated in `docs/UPSTREAM.md`:

1. `git fetch upstream` in each pristine checkout; compare our pins (the mod
   import boundary, and the engine floor in `package.json`) against
   `upstream/master`. Zero ahead = nothing to adopt (2026-11-02: both
   upstreams zero ahead of our pins).
2. Triage what's new against the watchlist (`docs/UPSTREAM.md`): movement on
   issues we queued (#14), seams we depend on (#418/#385/#414), anything
   touching our filed reports (#428). Read the CHANGELOG diff, not just the
   log.
3. Adopt by cherry-pick or merge, the merge message naming the upstream SHA;
   `pnpm verify` plus a run-record re-baseline decides whether existing
   records carry over. An ENGINE change bumps the published floor - records
   must say what they ran on.
4. The GitHub forks (`diegoami/neo-angband`, `diegoami/neo-angband-mod-borg`)
   are PR vehicles only: `gh repo sync` them on demand when cutting a §6 PR.
   No working trees; never ahead of upstream except a PR branch.
5. The local game checkout: `master` follows upstream, ff-only. The local
   `neowarrior-lab` branch rebases onto it and shrinks as upstream ships our
   fixes - the noteSpot line dies the day a release carries #428, and the
   branch is deleted once empty.


