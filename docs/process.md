# Process

`CLAUDE.md` holds the rules; this file says how work runs. Same system as
neowarrior-borg (which is malpaco's, which is Geoclick2027's).

## 1. Setup

### A new computer, from nothing

Everything below comes from GitHub; nothing is copied from another machine.
Needs: git with SSH access to GitHub, `gh` authenticated (`gh auth login`)
with read access to `diegoami/mandos`, nvm. Toolchain: Node 22+ (CI uses
22; the lab machine runs 24), pnpm as pinned by `packageManager` in
`package.json` (`corepack enable` picks it up).

    mkdir -p ~/projects/angband && cd ~/projects/angband
    # this repository (the folder name is historical; scripts assume siblings)
    git clone git@github.com:diegoami/mandos.git better-borg
    # the engine: upstream's repo, our fork as the push remote, the lab branch
    git clone git@github.com:neostryder/neo-angband.git neo-angband
    git -C neo-angband remote add fork git@github.com:diegoami/neo-angband.git
    git -C neo-angband fetch fork
    git -C neo-angband checkout -b neowarrior-lab --track fork/neowarrior-lab
    # upstream's borg mod, pristine at our import pin (read-only reference)
    git clone git@github.com:neostryder/neo-angband-mod-borg.git neo-angband-mod-borg
    git -C neo-angband-mod-borg remote add fork git@github.com:diegoami/neo-angband-mod-borg.git
    git -C neo-angband-mod-borg checkout 1fa2f8d
    # optional reference: upstream's squire mod (Phase 3 ideas)
    git clone https://github.com/neostryder/neo-angband-mod-squire.git neo-angband-mod-squire

    cd better-borg
    pnpm install --frozen-lockfile
    git config core.hooksPath .githooks   # privacy scan + no-AI-trailer (rule 14)
    pnpm verify                 # typecheck, suite, plugin.js currency

Restore the lab data base (saves, graveyard) if this machine is to run the
desktop build: install rclone, authorise a Drive remote for the owner's
account (`rclone config`; name it in `backup.json`'s `rcloneAccount`), then
`node tools/backup.mjs pull mandos-lab-data`.

Check it worked: the engine fingerprint below; `pnpm verify` runs
`src/play.test.ts` rather than skipping it (a skip means no content pack:
`pnpm install` did not land `@rpgm-tools/neo-angband-content` - #46); `node tools/upstream-watch.mjs` lists every thread; `node
tools/checkpoint.mjs` prints the snapshot. Then read the checkpoint issue.
The desktop lab build is section 8.

### What lives outside this repository, and where it is safe

| Thing | Where | Safe because |
| --- | --- | --- |
| Our engine fixes | one PR branch each in `diegoami/neo-angband` (`pr/square-note-spot`, `pr/disturb-input-flush`, `pr/expose-master-seed`) | pushed; they are the PR heads and the single source of each fix |
| The lab branch (our engine fixes + the lab-trust commits, for the desktop build) | `diegoami/neo-angband:neowarrior-lab` | pushed 2026-11-03 |
| Our borg fixes offered upstream | in this repo's `src/`; PR branches in `diegoami/neo-angband-mod-borg` (`pr/track-step`) | pushed |
| Run records, dossiers, task files | `docs/runs/`, `docs/tasks/` | committed (rule 8) |
| Queue, status, decisions in flight | issues: labels, the checkpoint issue, `upstream` tracking issues | on GitHub |
| `artifacts/` (probe runs, bulky by-products) | this checkout, ignored | scratch by definition (rule 8): anything worth keeping becomes a record |
| `.upstream-watch.json` | this checkout, ignored | a cache: the first run on a new machine re-baselines it |
| The lab data base (saves, graveyard and lineage in the browser profile's IndexedDB/Local Storage, settings, logs) | `~/projects/angband/mandos-lab-data` | backed up to the owner's private Drive folder: `node tools/backup.mjs push` (after a lab session; `backup.json` says what travels - never the caches or the mod clone, which is a git checkout). Each push keeps what it replaces under `archive/<stamp>` |
| `core.hooksPath` | each clone's git config | set by the setup line above. It points at this repo's `.githooks/`, executable wrappers that run the engine checkout's own hooks with `sh` (upstream stores them non-executable, so pointing at them directly runs nothing on Linux) |
| Claude Code's memory for this project | the user's Claude profile | a convenience only: every rule and decision it holds is also in CLAUDE.md or these docs |

### Day to day

Play harness content pack (#46), first match wins: `NEO_ANGBAND_REPO`, the
published `@rpgm-tools/neo-angband-content` devDependency (pinned to the
engine's version - what CI plays), then a sibling `../neo-angband` checkout.
Run records name the one used (`content`). In CI a missing pack fails the
suite rather than skipping it. Required: `gh` with read access to `diegoami/mandos` -
the queue and the checkpoint live on its issues, so without it there is no
queue (the local folder is still named
`better-borg`; the repo is `diegoami/mandos` - pass `--repo diegoami/mandos`).

Working notes (each one cost a session time):

- `source ~/.nvm/nvm.sh` before any node/pnpm command.
- Work loop: `pnpm vitest run --exclude 'src/play.test.ts'`; the full gate is
  `pnpm verify`. Heavy vitest files run individually (the play suite is
  load-sensitive).
- Runner: `node tools/runs.mjs --label <name> --seeds 20,23,34,49 --cap 10000
  --stage 2,1 [--out artifacts]`. Probes go to `--out artifacts` (ignored),
  never `docs/runs/`. Send the output to a log file, not a short `tail` - the
  error line gets cut. A 60000-cap no-stage life is ~7 minutes per seed.
- Seed 23 without a stage falls into the door-close loop (upstream #428) -
  known, not a new finding.
- A scratch git worktree needs `node_modules`: symlink it (the content pack
  comes with it); removing the worktree then needs `--force` (the symlink is
  untracked).
- Read-only checkouts: `../neo-angband` (engine, on our local lab branch),
  `../neo-angband-mod-borg` (pristine `1fa2f8d`); the C reference is
  `../neo-angband/reference/src/borg/`.
- Engine fingerprint, at the start and end of every task: `md5sum
  node_modules/@rpgm-tools/neo-angband-core/dist/game/trap.js` =
  `34c27241f96aceff581bcb186a9d898f` - the published engine PLUS our
  carried patch (`patches/`, #40). The published package alone was
  `c89b1b08474b1692b352f8d0b64823f4` (the value in task files before B40).
  A third value means the patch did not apply, or the package changed.
  The file is byte-identical in 1.23.0-beta.1 and beta.2, so the md5 does
  not tell the two apart. The engine pin a run record names (version plus
  carried patches, `tools/engine-pin.mjs`) does. Since #54 the harness
  runs the published 1.23.0-beta.2 plus the patch, and the lab runs our
  fork's 1.23.0-beta.2-mandos.N.

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
committed into existing records, rule 8).

## 3. Task files and the loop

**The issue is the task** until work starts: its body and the dispatch
brief on it are what an implementer reads, so a queued issue has no task
file and none is expected. The task file `docs/tasks/B<nn>.md` (B for
better-borg) is written ON the task branch and lands with the squash merge:
the Done-whens as built, the semantic choices, and the verification record.
One branch per task,
`task/B<nn>-<slug>`, squash-merged by the main session after its own
Done-when verification. Implementer contract as neowarrior's: build only what
the task asks, fail-before/pass-after for every new test, report out-of-scope
defects, update wronged documents, no status written into documents (the
issue's label and status comment carry it).

**The queue and where work stands live on GitHub**, the way the owner's
other projects run them. The queue is labels: `status:ready` for what can
start, `priority:{high,med,low}` for the order, `triage:needed` for a bug
not yet assessed, `backlog` for later. Where work stands is the latest
comment on the ONE open issue labelled `checkpoint`: the current order of
the queue, what is in flight (branch, head, pushed or not), what is blocked
and why, and the next action. Post one before stopping, after a merge, when
a long run starts or ends, and when a blocker is found:
`node tools/checkpoint.mjs` prints the snapshot (branches with ahead/behind,
stashes, the engine fingerprint, open PRs, the labelled queue), and
`--post "<next action>" [--notes FILE]` posts it, refusing a body that names
a home directory (the comment is public). A checkpoint records
state, not decisions - decisions go into these documents and CLAUDE.md.

**A bug always wins over a new feature** (rule 11). A defect found mid-task
gets its own issue at once and is fixed before the feature resumes (or the
owner is asked).

**Dispatch and models.** Nothing is dispatched without the owner's "go". The
owner picks the models; for a review, the main session hands the owner a
ready-to-paste prompt rather than launching one. Before work starts, a
durable brief goes on the issue; implementers push their branch and never
merge.

**Working safely** (three implementers died mid-task on 2026-11-03 - 2x WSL
crash, 1x usage limit - and committed state saved the work every time):

- Commit early and often; on a mid-flight death, secure a WIP commit FIRST.
- One background agent or heavy run at a time (WSL crashed twice under
  memory pressure).
- Determinism (rule 5) and immutable records (rule 8, additive fields only).
- No tolerated red: the seed-1 door-close (upstream #428) is green since B40
  carried #429 (`29efa52`). Any red is a defect (rule 11).
- Merge gates, main session only: fast loop, full verify, a hand-run
  mutation, `pnpm check`, the engine fingerprint -> squash-merge, close the
  issue with the verification record, delete the branch.
- A release names its engines (owner, 2026-11-04). The CHANGELOG
  section's **Works on** line and the README's table say which stock
  upstream release and which commit of our fork it works on. The fork
  commit is the one `tools/lab.mjs` printed at the release's lab check. A
  release that needs an unreleased PR of ours says "our fork only".

## 4. Reviews

One review per milestone: the big review of everything since the previous
tag, owner-launched with a prompt from `docs/review-prompt.md` (a common head
plus one body per kind: a task branch, the repository's structure, an
upstream draft). The owner picks the model; the main session fills the
slots and hands the prompt over. The
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

**What qualifies, for the borg** (owner, 2026-11-03): upstream's mod is a
PORT of the 4.2.6 C borg, so only a PORT DEFECT goes there - the port does
something the C does not (`track_step`, mod-borg#21/#22, is the model). A
weak strategy the C itself plays is an IMPROVEMENT: out of scope upstream,
kept here as a `FORK:`-marked choice (rule 3). Attribute against the C
first; the attribution decides whether anything is posted at all. Engine
gaps go to the engine tracker the same way (#428). The mod-borg stance is
survey-only: a PR there needs an acknowledged defect and zero debate.

**Posting** (rule 12): draft, show the owner, post on approval. Shape it like
the posts already up - engine issue #428 and its PR #429 are the reference,
then #430/#431/#432/#433 and mod-borg #21/#22. An issue: a summary citing the
C as `file:line`, the port's code cited, the consequence, the measured repro
(seed, decisions, our run-record directory), the minimal fix matched to the
C. A PR: the vehicle above, `Fixes #n`; the gap, why it matters, the change,
the evidence (tests, "tsc: zero new"); labels only suggested. Before writing
either, read the code region and verify against the pristine trees - two
assumptions bit us on 2026-11-03, one corrected publicly on the issue.

**After posting: track it, carry it, keep working** (owner, 2026-11-03).
We do not stop and wait for upstream, and we do not wait to learn whether
they accept.

1. **Track.** Every upstream post gets a tracking issue here the same day,
   labelled `upstream`, in the shape `docs/UPSTREAM.md` describes
   (Threads / What / Kind / Carried / On release). The upstream watch reads
   its thread list from these issues.
2. **Carry.** Every PR we post is one we decided makes sense, so we work on
   the assumption that EACH is accepted - bug fixes and seam requests alike
   (owner, 2026-11-04: "We assume all our prs are accepted, we decide before
   the post only the ones that make sense"). Meanwhile we carry it:
   - a borg port defect: in the core, faithful to the C (B32's
     `track_step` is the model);
   - an engine change (a gap or a seam): a hunk in the patch of the
     published engine package that `pnpm install` applies, so the headless
     harness, CI and every run record play on it, plus the same commit on
     the lab branch for the desktop build. A run record names the engine as
     the published pin plus the carried patch list.
   The mod may depend on a carried seam. If upstream declines one, the mod
   then works only on our fork, within reason, and the tracking issue
   records that. The mod still ships no engine code (rule 5). Where cheap,
   it feature-detects a seam, so it degrades rather than breaks on a stock
   engine.
3. **Monitor and decide case by case.** The upstream watch shows movement.
   When they review, address the feedback in the same pass; if they prefer
   a different fix, adopt theirs and drop ours. When a release carries it,
   do the tracking issue's **On release** (drop the carried patch or lab
   commit, raise the floor - section 7, step 3 - re-baseline) and close it.
   If they decline, the tracking issue records the decision and the carried
   fix becomes a marked choice of ours.

**Where the carried engine fixes live** (owner, 2026-11-03): each fix's
single source is its PR branch in our engine fork (`diegoami/neo-angband`,
`pr/<slug>`, cut from upstream master - the vehicle above). Two consumers
are built from those branches, never edited by hand:
- **this repository's `patches/`**: ONE patch file per patched package
  (pnpm allows one per package version), holding one hunk group per fix.
  Each hunk carries a `Mandos carries neostryder/neo-angband PR #n (fixes
  #m ...)` comment, which `tools/engine-pin.mjs` reads to name the carried
  list in every run record. It is wired through `patchedDependencies` in
  `pnpm-workspace.yaml`, so `pnpm install` applies it everywhere: the
  headless harness, CI and every run record (since #40). When a release
  carries one fix, remove only that fix's hunks (then regenerate the patch
  against the new version);
- **the lab branch** `neowarrior-lab` in the engine checkout, pushed to the
  fork: the same commits, plus the lab-trust commits the desktop build
  needs (#418 is the upstream answer to those).
Each tracking issue's **Carried** line names the patch (and its PR's hunks) and the lab commit.

## 7. Keeping current with upstream

Cadence: a sync pass at every milestone close, plus ad hoc whenever an
upstream release lands. The pass, dated in `docs/UPSTREAM.md`:

0. **The upstream watch** (`node tools/upstream-watch.mjs`, owner routine
   2026-11-03): the state of every thread we hold upstream, with what MOVED
   since the last look. Movement on our threads means the maintainer is
   processing us - engage in the same pass (address feedback, answer
   questions) and upstream work continues beside the fork; silence means
   carry in the fork per the doctrine. Run it before any upstream work, not
   just at sync passes; `--reset` re-baselines.

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
5. The local game checkout: `master` follows upstream, ff-only. The
   `neowarrior-lab` branch (pushed to `fork`) rebases onto it and shrinks as
   upstream ships our fixes - the noteSpot line dies the day a release
   carries #428, and the branch is deleted once empty. After a rebase,
   `git push --force-with-lease fork neowarrior-lab` (owner-run).

## 8. Watched runs (lab builds)

A lab build plays the mod UNATTENDED from the owner's own screen: birth via
the title row, rebirth on every death, the graveyard accumulating in the data
base. Two shapes, both **owner-verified 2026-11-03**. The engine they bundle
is the lab branch's (noteSpot-fixed); the mod folder's NAME must equal the
manifest id (`mandos`) - clone into a folder called exactly that.

**Start it with `node tools/lab.mjs start`** (`status` to look first). The lab's
two halves drift on their own: no merge updates the mod clone in
`<data>/mods/mandos` or rebuilds the engine's lab branch. Found 2026-11-04:
the clone was three merges behind main, and the build was missing the lab
branch's input-flush commit. The tool fast-forwards the clone to
`origin/main` and rebuilds the engine when the lab branch head differs from
the last build (`artifacts/lab-build.json`). It refuses a dirty or wrong-branch
engine, launches, and prints the mod and engine commits it is running. A
lab check for a release names those two commits, and it passes only when
`node tools/lab.mjs check` exits 0 after the watched lives. That command
reads the newest lab log: births, deaths, retirements kept, and every
consent the mod ran without. Found 2026-11-04: the 0.1.0 lab check was
accepted while the profile had never granted the truth domain or
`session:control`, so no attained character was kept (#53). Grant them
once per lab profile: Mods -> Mandos -> Change permissions. The manual
shape below is what the tool runs.

**Desktop (WSL, WSLg provides the display):**

    mkdir -p <data>/mods
    git clone -b main https://github.com/diegoami/mandos.git <data>/mods/mandos
    cd /path/to/neo-angband        # the neowarrior-lab checkout
    for p in core mod-sdk content; do pnpm --filter @rpgm-tools/neo-angband-$p build; done
    NEO_ANGBAND_LAB_BUILD=1 pnpm --filter @rpgm-tools/neo-angband-web bundle
    (cd packages/desktop && NEO_ANGBAND_LAB_BUILD=1 pnpm build)
    cd packages/desktop && NEO_ANGBAND_DATA=<data> pnpm exec electron . --lab-trust=mandos

`NEO_ANGBAND_DATA` names the data base (the dev shape of data-dir.ts's four:
keeps saves/mods out of `node_modules` and out of the user profile - make it
a stable folder you own; ours is `~/projects/angband/mandos-lab-data`). Mods
come from `<data>/mods/`, no folder picker. **Updating the mod** is a plain
`git pull` inside `<data>/mods/mandos` (the committed plugin.js is current on
every merge - `pnpm check`, part of `pnpm verify`, keeps it so), then
restart the app; install storage (graveyard, lineage counter) survives the
update. In-app ONCE: mods menu → enable Mandos → title row "New Mandos warrior character" → answer the game's confirm.
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


