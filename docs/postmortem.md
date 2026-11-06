# The AI post-mortem

This is the offline workflow for turning a recorded failure into a
reproduced defect: invoke the replay tool, verify its result, inspect the
dossier and write a diagnosis. The tools support that work; they do not
automatically launch an analysis session for every death. Human play of the
last turns is optional.

The authorized scope is bug hunting and fixing ([RULES.md, rule 3](../RULES.md)).
A diagnosis can identify a policy idea, but new strategies, parameter
learning and fatal-state snapshot features remain parked. The longer-term
trainer design in the roadmap does not authorize those features.

The owner has now requested a durable report for every death and aggregation
into actionable issues. [Issue #166](https://github.com/diegoami/mandos/issues/166)
and [the audited implementation plan](tasks/death-corpus-plan.md) cover the
intake/index/diagnosis-queue layer. The first [offline corpus tool](deaths/README.md)
now ingests exported public records and attributed analysis revisions; automatic
live capture/export and analysis execution remain follow-ups. The manual replay
and diagnosis tools below are already implemented. Repository
reports do not imply a full fatal-state save or an automatic analysis service.

## The loop

1. **A run ends in death or a recorded stall** in a harness session
   (`tools/runs.mjs`); the record lands
   under `docs/runs/<session>/` (append-only, rule 8).
2. **Invoke the dossier generator** beside the record, using the matching
   Borg code, engine/content pin, birth plan and configuration:

       node tools/replay.mjs --record docs/runs/<session>

   The tool replays recorded deaths and stalls and writes
   `<session>/postmortem/`:
   a `README.md` ladder table and one `seed-<n>/offset-<k>.md` dossier per
   ended run x ladder rung (v2:5/12/25/40/60/82/105 Neo game turns;
   `--profile legacy-v1` retains5/10/15/20 and `--offsets` selects a named custom list).
   [Profile units/boundaries and earlier anchors](deaths/WINDOWS.md) are explicit
   in new dossiers and windows.json; old evidence is not rewritten. A rung whose target turn falls inside a
   single decision has NO live boundary and is listed as `none` - the
   killing decision of a fast death can spend more turns than the smallest
   rung. The replay's death line is verified against the record (cause,
   turn, decisions, the whole census) and the verdict is printed in every
   dossier; a DIVERGED replay says so at the top rather than dressing its
   dossiers as the recorded run. A recorded stall uses the stopped life
   as its endpoint. Existing dossier directories are not overwritten; use a
   fresh record or a scratch copy for a new investigation, preserving the
   committed evidence.
3. **A session writes a diagnosis** (this document's routine, below) into
   `seed-<n>/diagnosis.md` beside the dossiers it read.
4. **Diagnoses become tracked findings**: file a reproduced defect with its
   evidence and provenance. A suggested valuation or strategy change stays
   a backlog idea while rule3 prioritizes defects. Nothing applies a
   diagnosis to live play (rule 5).

## What a dossier is

One deterministic page of text per dead run x rung (format
`mandos/postmortem@1`), all of it natively readable and diffable:

- **The rung**: the recorded death (turn, cause, level, depth, decisions),
  the target turn T-N, the release boundary actually captured (the first
  decision boundary at or after the target), the replay verification, and
  the two settings that arm the human replay path.
- **The character at the boundary**: level, hit points, spell points, gold,
  depth, grid, turn.
- **The screen**: the remembered map (a fixed 33x17 window around the
  character - the character's own knowledge, unknown grids blank) with the
  visible monsters and the character stamped over it, and a legend naming
  each visible monster with its hit points.
- **The message log tail** (the last 20 lines, oldest first, repeats
  counted) - including the engine's own squashed repeats (`x72 ...`), which
  is often where the story is.
- **The pack, the worn equipment, and the home**: the inventory verdicts'
  raw material (#28's rail), named by the game's own describe call, gated
  by the character's real knowledge.
- **The recent decisions** (the last 30, oldest first: where the character
  stood, whether anything was visible, what the Borg issued) and **the
  command census** to the boundary.
- **Provenance**: seed, life, the record, the engine and content pins, and
  the upstream seam note.

For the same Borg code, initial state, configuration, engine and content,
the replay observations are deterministic. The exactness test protects its
named committed fixture; the per-run verification checks endpoint/census agreement, not complete
ordered trajectory or RNG identity. A deliberate code change can move an old
death, so identical seed values alone do not establish equivalence.

## The routine (what a diagnosing session does)

Read targeted discussion/action comments at session start and stop under
[the manual read contract](deaths/DISCUSSIONS.md); ACK is not resolution.
Read the dossier, then walk the decision code beside it. In order:

1. **Read the rung and the census first.** What was the character doing at
   the boundary - the census's dominant code and the trail's pattern
   (an oscillation shows as alternating grids, a stall as one grid, a
   lock-grind as `open` with a giant message count).
2. **Read the screen and the message tail.** What the character KNEW at the
   boundary: which monsters were visible, the remembered map, and what the
   game had been telling it. The message log is the engine's own narration
   of the death spiral.
3. **Read the pack, equipment and home.** Inventory verdicts live here
   (#28's rail): a cure that was never drunk, a weapon never swapped to,
   junk stashed at home while kit was missing.
4. **Walk the code that made each recent decision.** The dossier's `cmd`
   column is what the controller ISSUED; for each distinct command in the
   tail, find the decision path in `src/` that chose it (start from
   `src/think-ladder.ts`) and ask: given THIS screen, THIS pack, THESE
   hit points, was that the code's intended behavior? Name the function
   and the line.
5. **Write the diagnosis** (shape below) into `seed-<n>/diagnosis.md`.
   Every claim cites its evidence (dossier section or source line); every
   "should have differed" names WHICH code or weight would have to change.
   Speculation is allowed and LABELLED - a hypothesis to test, never a
   finding.
6. **File what the diagnosis establishes**: classify its provenance under
   rule 3 and link the dossier as evidence. Confirmed defects proceed
   through their own reproduced, measured tasks. A preference for different
   tactics is a CHOICE proposal, not authorization to implement a strategy
   or parameter feature under the current scope.

### The diagnosis artifact's shape

    # Diagnosis - seed <n>, <cause> at turn <T>
    (one line: what happened, in one sentence)

    ## What happened            - the death spiral, from the dossier
    ## What the code did        - the decisions, each named to its source
    ## What should have differed - per rung where it applies, with the
                                  code/weight that would change it
    ## Inventory verdicts        - the pack/equipment/home against the death
    ## Follow-on                 - the filed task(s), or "none yet" + why

## The human path (optional, beside this loop)

The existing handoff uses `borg.replayReleaseTurn` and
`borg.replayDeathTurn` from the dossier. The lab launch route is
`?seed=<S>&new`, with the recorded class and race pinned, followed by **New
Mandos character**. At the configured boundary Mandos releases the keyboard
and shows the death banner (`src/loop/replay.ts`); subsequent human commands
are logged, and Ctrl-Z can hand control back.

Treat that boundary as the recorded game state only after proving the case
matches. #54 repaired desktop/headless birth and replay differences, with
[one verified desktop case](runs/2026-11-04-b54-desktop-death-replay/README.md). Matching
release labels or a seed field is not sufficient evidence. Verify an
untouched replay against the recorded death line first; otherwise label
what you observe as a different run. See the
[settings reference](../SETTINGS.md#the-death-replay-trainer-playing-a-dead-runs-last-turns).

## Limits, named

- **Desktop parity needs case-specific proof.** #54 reproduces one actual
  desktop Human Mage death: all 113 commands and arguments, pre-command
  observations and final death facts. Reproduction requires matching
  code/engine/content and accepted-birth RNG/options/controller context.
  A seed alone cannot recover missing context from older records; touched
  runs also need their human input. This is not universal replay coverage.
- **The graveyard is not a full death save.** It preserves selected run
  facts and journal data after the engine removes the character's normal
  save. A diagnostic snapshot of the fatal dungeon state is a parked
  feature, not part of this workflow.
- **Message capture must be observational.** The replay binds a message
  sink so the dossier can include the tail. The exactness test checks that
  this does not move the named fixture's recorded death; another record's
  own verification still decides whether it is exact.
- **Rungs are turn-offsets; boundaries are decisions.** The autoplayer can
  only stop at decision boundaries, so a rung whose target falls inside a
  single decision has no release point (`none` in the ladder README), and
  two rungs can share a boundary (the dossier names the boundary turn, so
  sharing is visible).
- **A diagnosis is analysis, never a live-run mutation** (rule 5). It
  reads code and dossiers and writes text.


The B99 Neo upgrade moves the current replay-test baseline to the
[98-command desktop case](runs/2026-11-05-b99-desktop-death-replay/README.md).
The older B54 case remains unchanged and valid with its recorded code and
engine; changing the controller requires a fresh record, not editing history.
