# Working rules

Cited as "rule n" everywhere in this repository. Every agent reads these
(AGENTS.md points here; a local CLAUDE.md imports this file).

1. **The number is reach-rate at the chosen stage** (#25; redirected
   2026-11-03) - the fraction of a fixed seed cohort that attains the target
   stage, over the headless harness. Every behaviour change exists to move it
   (or a proxy the run record names)
   and is measured by the harness before it merges.
2. **Fork marks.** Upstream code changes only in a commit that says what and
   why, and in the source beside the C function it came from with a `FORK:`
   comment. Unmarked divergence is the defect this rule prevents.
3. **Defect or choice, named.** A change that restores what the 4.2.6 borg
   actually did is a DEFECT fix: it is staged here AND offered upstream as a
   pull request from this repo. A change that improves on 4.2.6 is a CHOICE:
   it lives here, marked, and never pretends to be a defect. Every task and
   record says which kind it is.
4. **Class-agnostic only.** If a change only helps one class or build, it
   goes downstream (neowarrior-borg), not here. When in doubt, ask: would the
   stock Borg, playing any class, want this?
5. **The mod plays by the rules.** No engine changes, no privileged reads
   beyond upstream's declarations, no wall clock or network in the
   controller. Determinism is a guarantee. Learning and optimization happen
   OFFLINE in tools/ and ship as frozen parameters or versioned read-only
   data (see the roadmap).
6. **`pnpm verify` is the gate.** Play-harness runs need the sibling game
   checkout (`../neo-angband` or `NEO_ANGBAND_REPO`) and skip out loud
   without it.
7. **A play-harness failure that reproduces on pristine upstream at the same
   pin is a defect this fork exists to fix** - reproduce it, record it in
   `docs/runs/`, fix it marked (rule 3), and offer it upstream.
8. **Run records are committed** (`docs/runs/`); bulky by-products go to
   `artifacts/` (ignored).
9. **Task files own their scope.** Build what the task asks; report defects
   outside it; each Done-when is one command a CI or reviewer can run.
10. **Upstream credit stays**, and tags never move.
11. **A bug always wins over a new feature** (owner, 2026-11-03). Stability
    and defects - upstream ones above all - preempt any feature in flight:
    park the feature, open an issue for the defect at once, fix it (or ask
    the owner) before the feature resumes.
12. **Upstream posts wait for the owner.** We are not maintainers there; we
    may post issues and PRs, preferably with the owner's approval first
    (draft, show, post). Our own tracker is written freely. Process §6 says
    what qualifies and how it is shaped.
