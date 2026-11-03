# State - read this first

The session-start snapshot: what the owner decided, what is in flight, what
comes next, and the traps that cost earlier sessions time. A handover
REWRITES this file (and commits it); it replaces pasted handover prompts.
Per-task status still lives on the issue's `status:*` label and its latest
status comment - this file points, the issue decides. Last rewritten
2026-11-03.

## The standing order

**The audit (#34) is the priority** (owner pivot, 2026-11-03, supersedes
every earlier ordering): find issues in the original borg across ALL
classes, strategies and configuration options, and derive each one's
provenance - C design (faithful) / inherited port defect (at the import
boundary `70145c5`, neostryder's) / our defect / engine gap. Everything else
comes later. Nothing may force warrior play.

**Stability and bug fixing always come first, upstream above all** (owner
rule, 2026-11-03): a crash, a harness failure or a defect in the borg or the
engine preempts any feature work in flight - park the feature, chase the bug.
Features (e.g. #28 inventory review) are nice-to-have and re-queue behind
every open defect.

**A defect found mid-task** gets its own issue on our tracker at once, and
is fixed before the task resumes (or the owner is asked) - the feature is
nowhere near as important (owner, 2026-11-03).

**GitHub writes** (owner, 2026-11-03): our tracker (diegoami/mandos) -
the main session writes freely (issues, comments). Upstream - we are not
maintainers, but we may post issues and PRs, **preferably with the owner's
approval first**: draft the body, show it, post on approval. Shape them like
the ones already posted (the references): engine issue
neostryder/neo-angband#428 and its PR #429, also #430/#431/#432/#433 and
mod-borg #21/#22. Issue: Summary with the C cited `file:line`, the port's
code cited, Consequence, the measured repro (seed, decisions, our run-record
directory), the minimal fix "exactly upstream". PR: per process.md section 6
(fork branch off upstream master, `Fixes #n`; gap / why it matters / the
change / evidence incl. tests and "tsc: zero new"), labels only SUGGESTED
(maintainer's call).

**Dispatch nothing without the owner's "go".** Model choice on this project:
the owner picks; for reviews, hand the owner a ready-to-paste prompt, don't
dispatch one.

## The queue

1. **#17** - the generic pack with a NEUTRAL default ("nothing forces
   warrior"; candidate: a per-birth class draw mirroring `raceRandom`). Its
   first test: the two-pack settings/birth ordering. The audit's chassis.
2. **#16** - race pinning for all 11 races (roster:
   `packages/content/pack/p_race.json` in neo-angband; any race, any class).
3. **#34** audit passes, step 1 = **#31** (the class x seed reach-rate grid
   at stage 1).
4. **#30** home curation, **#33** the deferred human rail.

**Parked: #28** (inventory reviewer) - the owner pushed it back behind the
audit (2026-11-03). Do not resume it unprompted. See "In flight" for where it
stands.

## Decisions of 2026-11-03, in order (later ones win)

1. **Rename** (#19, done): id `mandos`, repo `diegoami/mandos`, the local
   folder keeps the stale name `better-borg`. Kept on purpose:
   `RUNS_SCHEMA_ID = "better-borg/runs@1"` (rule 7). Accepted: install
   storage from the old id is orphaned.
2. **Desktop lab build** (#18, done, owner-verified): process.md section 8;
   data at `~/projects/angband/mandos-lab-data`; updating the mod = `git pull`
   in the mod folder + restart.
3. **Purpose redirect**: the borg helps with the grind - reach a chosen stage
   reliably (reach-rate is THE number, rule 1), retire successes into kept
   saves, ladder stages from stage N-1's per-seed saves (#26), learn from
   deaths through AI post-mortems with no human in the loop (#33 holds the
   deferred human rail). Replay ladder offsets: 5/10/15/20 turns.
4. **B25** (#25, merged): the stage rail - `borg.stageClvl`/`stageDepth`,
   default c2d1 (the ~c20 destination measured 0%), retire protocol with
   fail-safes, 15-character library names. Baseline 50% (2/4).
5. **B29** (#29, merged): the death-replay trainer - `tools/replay.mjs`,
   dossier ladders (`mandos/postmortem@1`, home included), exactness
   test-proven; human hand-over settings default off; the AI routine is
   `docs/postmortem.md`.
6. **B32** (#32, merged): caution vs attack - both halves faithful (fork
   improvements, `FORK:`-marked) plus one inherited defect fixed (the
   `track_step` recorder was never ported; the bounce guard was inert). 50% ->
   75% (`docs/runs/2026-11-03-b32-stage-c2d1/`). Open follow-on: confused
   beside a 1-hp monster (noted in #32's close; needs its own issue when
   picked up).
7. **B27** (#27, phase 1 only, merged; phases 2-3 deferred to #33): the
   uncertainty signal - chooser ties (5% relative, identity-gated) and
   known-world gaps, into the graveyard archive and the `unsure` fields.
   Valuation scores surface nowhere engine-side.
8. **Class doctrine**: "warrior first" -> "wide first" (neutral default) ->
   superseded by the audit pivot (decision 9).
9. **The audit pivot** (#34): the standing order above. #31 is its step 1.
10. **Who is who** (AGENTS.md): we are diegoami; neostryder is another
    developer; "the port" is theirs; a defect present at `70145c5` is
    inherited - verify against the pristine trees before attributing, and
    read the code region before writing any upstream claim (two assumptions
    bit us on 2026-11-03; one was corrected publicly on the issue).
11. **#28 parked** behind the audit (see the queue).

## In flight

**#28, parked.** Branch `task/B28-inventory-review`. On origin: 3 commits
(`9a4bb83` ledger core, `ba4e68f` tick/plugin/archive wiring, `8b91885` WIP).
A later session rebased it onto main and added 2 commits LOCALLY ONLY
(`548cb5c`, `7320bcd`) - pushing them needs a force-push, which the owner
runs (`git push --force-with-lease origin task/B28-inventory-review`).
What those commits do:
- **Fixed**: the observed life copied the ledger at install, so every run
  reported zero moments; it now reads through getters. With the fix, a c2d1
  rerun of the B32 cohort matched the B32 record exactly (census, turns, gold;
  75%) - the ledger is observation-only.
- **Added**: the reviewer's `app.js` + `style.css` (resume by loading a
  feedback.json), the exporter reads `PACK_SIZE`/`PRESSURE_FREE_SLOTS` from
  source, the ledger fields and the feedback format in `docs/runs/README.md`;
  `tools/probe.mjs` deleted.
- **Open**: no sample dataset - at c2d1 the pack holds ~3 slots, so the
  21-of-23 pressure band never fires; the reviewer is untested in a browser
  (Playwright's Chromium is installed); full verify and a mutation not run.
- **Open question**: seed 34 at `--cap 60000` (no stage) failed the census
  guard (31361 commands over 60000 decisions). Not yet known whether pristine
  main does the same - the comparison run was stopped.
- **Possible finding** (audit-shaped): seed 34 at c2d1 drops its Rounded
  Pebbles one per decision (22 drops) - check the C before calling it
  anything.

## Upstream

Run `node tools/upstream-watch.mjs` FIRST - from main's copy (a task branch
may carry a stale watchlist). Open as of 2026-11-03:
- engine PRs **#429** (noteSpot; mergeable; do NOT nudge), **#432**
  (input-flush), **#433** (RunReport.seed - unblocks watched-lineage replay);
- engine issues **#430** (load-resume proposal; gates #26's unattended half;
  attended = load + Ctrl-Z), **#434** (our track_step finding, moved there
  from mod-borg#21 by their redirector BOT - procedure, not engagement; its
  body error is corrected in a comment);
- mod-borg PR **#22** (the borgTrackStep recorder).

Conventions: mod-borg items consolidate on the engine tracker
(`repo:mod-borg`); open-until-release (an open issue may already be fixed).
Mod-borg stance (owner-set): survey-only; the PR bar is an acknowledged
defect with zero debate. Upstream PRs go from fork branches; never push
neowarrior-lab. Patience over nudging.

## Rules that bit

- **Commit early and often.** Three implementers died mid-task (2x WSL
  crash, 1x usage limit); committed state saved the work every time. On a
  mid-flight death, secure a WIP commit FIRST.
- **One background agent or heavy run at a time** (WSL crashed twice under
  memory pressure); run heavy vitest files individually; the play suite is
  load-sensitive.
- **Engine fingerprint** at start and end: `md5sum
  node_modules/@rpgm-tools/neo-angband-core/dist/game/trap.js` =
  `c89b1b08474b1692b352f8d0b64823f4`.
- **Sole tolerated red**: the seed-1 door-close (771/1500, upstream #428).
- Records immutable (rule 7, additive fields only); determinism (rule 5).
- **Merge gates** (main session only): fast loop, full verify, a hand-run
  mutation, `pnpm check`, fingerprint -> squash-merge, close the issue with
  the verification record, delete the branch.
- **Dispatch pattern**: a durable brief on the issue before any work starts;
  implementers push only, never merge.
- Upstream `tsc`: build from the repo root (the "53 errors" was a worktree
  artifact).

## Environment traps

- `source ~/.nvm/nvm.sh` before any node/pnpm command.
- The work loop: `pnpm vitest run --exclude 'src/play.test.ts'`; full gate
  `pnpm verify`.
- Runners: `node tools/runs.mjs --label <name> --seeds 20,23,34,49 --cap
  10000 --stage 2,1 [--out artifacts]` (stage runs are minutes; a 60000-cap
  no-stage life is ~7 minutes per seed). Probes go to `--out artifacts`
  (ignored), never `docs/runs/`. Pipe the output to a log file, not
  `tail` - a short tail loses the error line.
- A scratch git worktree finds no content pack: set
  `NEO_ANGBAND_REPO=/home/diego/projects/angband/neo-angband` and symlink
  `node_modules`. Removing it later needs `--force` (the symlink is
  untracked).
- Seed 23 without a stage falls into the door-close loop (thousands of
  `close` commands) - a known upstream gap, not a new finding.
- Read-only checkouts: `../neo-angband` (engine; on our local lab branch),
  `../neo-angband-mod-borg` (pristine `1fa2f8d`). The C reference:
  `../neo-angband/reference/src/borg/`.
- Standing offer never run: `gh repo archive diegoami/neowarrior-borg`
  (owner's call).
