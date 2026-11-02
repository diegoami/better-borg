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
