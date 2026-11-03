@AGENTS.md

# Working rules

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
4. **Class-agnostic core, class-specific packs.** A change that only helps
   one class or build goes into that class's strategy pack under
   `src/class/` (process section 2) - never into the core, and never into a
   fork. When in doubt, ask: would the stock Borg, playing any class, want
   this? If yes, it is core.
5. **The mod plays by the rules.** The mod ships no engine code and makes no
   privileged reads beyond upstream's declarations. (Our fixes TO the
   engine, offered upstream, are carried in the harness and the lab build
   until a release carries them - process section 6.) No wall clock or
   network in the controller. Determinism is a guarantee. Learning and
   optimization happen OFFLINE in tools/ and ship as frozen parameters or
   versioned read-only data (see the roadmap).
6. **`pnpm verify` is the gate.** Play-harness runs need the sibling game
   checkout (`../neo-angband` or `NEO_ANGBAND_REPO`) and skip out loud
   without it.
7. **A play-harness failure that reproduces on pristine upstream at the same
   pin is a defect this fork exists to fix** - reproduce it, record it in
   `docs/runs/`, fix it marked (rule 3), and offer it upstream.
8. **Run records are committed and append-only** (`docs/runs/`): a
   committed record is never edited - fields are added, never changed or
   removed, and a format id committed into records stays byte-identical.
   Bulky by-products go to `artifacts/` (ignored).
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
13. **A question is not a request to edit files.** Answer it; propose any
    fix and wait (the rule the owner's other projects carry).
14. **No AI-attribution trailer, ever** (owner, 2026-11-04; upstream's own
    policy). No commit message or PR body carries a "Co-Authored-By:
    Claude" line or a "Generated with Claude Code" footer - here, in our
    forks, or upstream. AI use is disclosed in one place,
    `AI_USAGE_POLICY.md`. The `commit-msg` hook (process section 1's
    `core.hooksPath`) refuses such a message.
