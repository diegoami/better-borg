Historical snapshot; current session rules are at repository root.

# Working rules

These rules apply to every agent. [AGENTS.md](https://github.com/diegoami/mandos/blob/43e1a8eb19e4715102cfc4008e8e29a9dad7b38b/AGENTS.md) is the shared entry
point; [docs/process.md](https://github.com/diegoami/mandos/blob/43e1a8eb19e4715102cfc4008e8e29a9dad7b38b/docs/process.md) and
[docs/UPSTREAM.md](https://github.com/diegoami/mandos/blob/43e1a8eb19e4715102cfc4008e8e29a9dad7b38b/docs/UPSTREAM.md) define the detailed workflow.

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
   record says which kind it is. Always qualify "inherited": inherited from
   the imported TypeScript port, or inherited from the C Borg. A faithful
   port of a C bug is not a Neo Angband port defect. Neo Angband must follow
   C; a correction to C behavior must land in upstream Angband before a Neo
   parity fix is proposed. Mandos may carry its own marked CHOICE earlier.
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
6. **`pnpm verify` is the gate.** Play-harness runs need the content pack
   (`NEO_ANGBAND_REPO`, the `@rpgm-tools/neo-angband-content`
   devDependency, or a sibling `../neo-angband` - #46). Without it they skip
   out loud locally and fail in CI.
7. **A play-harness failure that reproduces on pristine upstream at the same
   pin is a defect this fork exists to fix** - reproduce it, record it in
   `docs/runs/`, fix it marked (rule 3), and offer it upstream.
8. **Run records are committed and append-only** (`docs/runs/`): a
   committed record is never edited - fields are added, never changed or
   removed, and a format id committed into records stays byte-identical.
   Bulky by-products go to `artifacts/` (ignored).
9. **Task files own their scope.** Build what the task asks; report defects
   outside it; each Done-when is one command a CI or reviewer can run.
10. **Upstream credit stays**, and tags never move. Keep our PR-vehicle
    forks' default branches aligned with upstream by fast-forward only.
    Preserve proposal heads; report divergence rather than force-pushing.
11. **A bug always wins over a new feature** (owner, 2026-11-03). Stability
    and defects - upstream ones above all - preempt any feature in flight:
    park the feature, open an issue for the defect at once, fix it (or ask
    the owner) before the feature resumes.
12. **Keep C proposals local; route Neo posts by provenance.** The owner
    authorized direct Neo Angband issues/PRs for confirmed port defects
    (2026-11-05), after attribution, reproduction and duplicate checks.
    C work maintains our known-bug catalogue, evidence and proposed fixes
    in diegoami repositories. **No angband/angband submissions now**: no
    issues, PRs or comments there, and no automatic submission or routine
    approval prompt. A later explicit owner instruction must change this
    pause. A local C proposal is not upstream acceptance or an applied fix.
    Our own tracker is written freely. Process §6 defines the workflow.
13. **A question is not a request to edit files.** Answer it; propose any
    fix and wait (the rule the owner's other projects carry).
14. **No AI-attribution trailer, ever** (owner, 2026-11-04; upstream's own
    policy). No commit message or PR body carries a "Co-Authored-By:
    Claude" line or a "Generated with Claude Code" footer - here, in our
    forks, or upstream. AI use is disclosed in one place,
    `AI_USAGE_POLICY.md`. The `commit-msg` hook (`.githooks/`, process
    section 1) refuses such a message.
15. **Current scope: bug hunting and fixing only** (owner, 2026-11-04;
    until the owner changes scope). Hunt, reproduce, attribute and fix
    defects. Restoring omitted C Borg behavior is DEFECT work. New
    strategies, parameter learning, fatal-state snapshots and new
    unattended stage-resume functionality remain parked. Finishing an
    audit does not automatically authorize roadmap features; expanding
    beyond defect work requires the owner's explicit scope change.

16. **Priority order** (owner, 2026-11-05). First reconcile current bug
    status and monitor both upstream boards. Then classify/triage leads
    and keep internal issues and the C-community catalogue current.
    Implementation follows: Neo/port fixes first, with issue then PR then
    verified local carry. With no actionable port bugs, finish the local
    C proposal/triage pass; carry validated C corrections in a second pass
    once that C backlog is processed. No new feature work is authorized.
17. **Issues own current status.** The catalogue has source/evidence and
    fix links, with no duplicated current carry column or live status in
    details. Internal issue labels/bodies are authoritative. A proposal,
    a stored patch and an applied fix are different states.
18. **Adopt, rebuild, verify, then close.** When an upstream correction
    lands, pull/adopt it with our changes, rebuild and verify the result.
    Then mark the tracker fixed and close it. A published package release
    is not required for closure. carried means an applied local correction
    awaiting upstream delivery/adoption; partial fixes remain open.
    patch-active independently marks required backports, even on closed
    fixed trackers; remove only superseded hunks after consumer adoption.
19. **C catalogue scope and ownership.** Include concrete C symptoms from
    all lead sources, with discovery and independent validation attributed
    separately. Port omissions belong on upstream/Neo issues, not in the
    C list or under upstream-c merely because a C routine exists.
    C fix proposals stay in our repositories, labelled c-proposal and
    postponed when parked; closed/unmerged records retain usable branches,
    commits and patch links. Others may reuse or submit them themselves.
    Rule 12's pause on our angband/angband submissions remains in force.

20. **Issue homes and session split** (owner, 2026-11-05). Target upstream
    port-defect trackers to our neo-angband-mod-borg fork; target C Borg,
    Angband game and Neo engine trackers to our neo-angband fork. Mandos
    keeps its own defects/integration work and remains the Neo Borg port's
    development workspace. The monolithic JSON/catalogue is temporary.
    Complete [the fork-tracking evaluation](https://github.com/diegoami/neo-angband/issues/2)
    before community outreach, including a separate C/game/engine fix-and-PR
    session and migration preserving issue history, stable IDs and links.
    Existing issue homes remain authoritative until migrated; this rule
    does not silently relocate trackers or authorize C submissions.
