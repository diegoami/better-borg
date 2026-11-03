# Process

`CLAUDE.md` holds the rules; this file says how work runs. Same system as
neowarrior-borg (which is malpaco's, which is Geoclick2027's).

## 1. Setup

    pnpm install --frozen-lockfile
    pnpm verify                 # typecheck, suite, plugin.js currency

Play harness: sibling checkout of `neo-angband` at `../neo-angband`, or
`NEO_ANGBAND_REPO`. Optional: `gh`.

## 2. The pack doctrine (was: the two-fork routing)

Two repositories now, one rule each (the M2 unification, #15, closed the
three-repository era on 2026-11-03):

| Repo | Takes |
| --- | --- |
| `neostryder/neo-angband-mod-borg` (upstream) | defect fixes, offered as PRs from here |
| `diegoami/mandos` (this repo; renamed from `better-borg` 2026-11-03, #19) | everything: the class-agnostic core AND the per-class strategy packs under `src/class/` |

**History**: `diegoami/neowarrior-borg` was the single class fork, wound
down at M2 open exactly as the owner decided (2026-11-02): its
class-agnostic instruments (restart loop, session driver, journal/graveyard,
records) moved here, its warrior-specific code became strategy pack #1
(`src/class/warrior/`, the `borg.class` default), and its committed run
records moved with it (docs/runs/ - see that README's Provenance). The
repository is archived; its history is the immutable record and remains
readable, but nothing writes there and no new class forks it.

**Found a generic improvement while working in a pack?** Move it out of
`src/class/` into the core and offer it upstream if it is a defect fix (a
pack may not grow core machinery of its own). **Dupe-check first** (owner
rule, 2026-11-02): before working any issue, check upstream's consolidated
tracker (OPEN AND CLOSED, `repo:mod-borg` / `repo:neo-angband`) for the same
ground - ours may be a duplicate, or theirs may already carry the fix (the
watchlist, `docs/UPSTREAM.md`, is the index). **Landed something in the core
that a pack needs?** Packs live in the same tree now - they import it; the
cross-repo cherry-pick protocol (`70145c5` here ↔ neowarrior's `301abd7`,
same import boundary) is retired with the fork. **Fixed a port defect
here?** Open the upstream PR from this repo's branch; if upstream changes
the approach, adopt theirs here.

**A new class starts as a pack plus a setting, never a fork**: a module
under `src/class/<name>/` implementing the StrategyPack interface
(`src/class/pack.ts` - the plan, the presenter, the uniform race pair, the
title-row label), an entry in the registry's ordered `PACKS` array (which
widens the `borg.class` range and lands its manifest row in the same
change), and its own tests. Per-class lineages are isolated by install
slots; per-class valuation weights, when they exist, are pack data. After
the unification (B15) the unified mod RENAMED to **Mandos** - the keeper
of the dead who sends them back (#19, landed 2026-11-03: id `mandos`,
folder `mandos`, repo `diegoami/mandos`; the run-record schema id
`better-borg/runs@1` deliberately keeps its old name - a format identifier
committed into existing records, rule 7).

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

## 8. Watched runs (lab builds)

A lab build plays the mod UNATTENDED from the owner's own screen: birth via
the title row, rebirth on every death, the graveyard accumulating in the data
base. Two shapes, both **owner-verified 2026-11-03**. The engine they bundle
is the lab branch's (noteSpot-fixed); the mod folder's NAME must equal the
manifest id (`mandos`) - clone into a folder called exactly that.

**Desktop (WSL, WSLg provides the display):**

    mkdir -p <data>/mods
    git clone -b main https://github.com/diegoami/mandos.git <data>/mods/mandos
    cd /path/to/neo-angband        # the neowarrior-lab checkout
    NEO_ANGBAND_LAB_BUILD=1 pnpm --filter @rpgm-tools/neo-angband-web bundle
    (cd packages/desktop && NEO_ANGBAND_LAB_BUILD=1 pnpm build)
    cd packages/desktop && NEO_ANGBAND_DATA=<data> pnpm exec electron . --lab-trust=mandos

`NEO_ANGBAND_DATA` names the data base (the dev shape of data-dir.ts's four:
keeps saves/mods out of `node_modules` and out of the user profile - make it
a stable folder you own; ours is `~/projects/angband/mandos-lab-data`). Mods
come from `<data>/mods/`, no folder picker. **Updating the mod** is a plain
`git pull` inside `<data>/mods/mandos` (the committed plugin.js is current on
every merge - `pnpm check` is the merge gate), then restart the app; install
storage (graveyard, lineage counter) survives the update. In-app ONCE: mods menu → enable
Mandos → title row "New Mandos warrior character" → answer the game's confirm.
Everything (saves, graveyard, settings) then lives under `<data>` - portable;
delete it to reset. The lab branch's first-party entry + the switch carry the
trust.

**Web:**

    git clone -b main https://github.com/diegoami/mandos.git mandos
    cd /path/to/neo-angband/packages/web && NEO_ANGBAND_LAB_BUILD=1 pnpm dev

Open the served URL with `?labtrust=mandos` appended, then the same in-app
once-through (allow third-party, pick the `mandos` folder, enable).

Without a lab build the first death ends the run by design (fail-closed);
headless play is unaffected (#18: diegoami/mandos issue 18).


