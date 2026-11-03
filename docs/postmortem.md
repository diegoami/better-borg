# The AI post-mortem

How a session with code access turns a dead run's dossier into a diagnosis,
and how diagnoses become work. This is the trainer loop's automated half
(#29): the owner's conclusion, made architecture - dossiers are generated
per death, a session writes the diagnosis, and **the feedback loop needs no
human in its critical path**. The human replay path (the owner playing the
last turns themselves) stays, and is optional; #28's human curation remains
valuable when it happens, but nothing waits on it.

## The loop

1. **A run dies** in a harness session (`tools/runs.mjs`); the record lands
   under `docs/runs/<session>/` (append-only, rule 8).
2. **The dossier ladder is generated** beside the record:

       node tools/replay.mjs --record docs/runs/<session>

   This replays every dead run in the record (same seed, same planned
   birth, same deterministic Borg) and writes `<session>/postmortem/`:
   a `README.md` ladder table and one `seed-<n>/offset-<k>.md` dossier per
   dead run x ladder rung (5/10/15/20 turns before death by default;
   `--offsets` widens the set). A rung whose target turn falls inside a
   single decision has NO live boundary and is listed as `none` - the
   killing decision of a fast death can spend more turns than the smallest
   rung. The replay's death line is verified against the record (cause,
   turn, decisions, the whole census) and the verdict is printed in every
   dossier; a DIVERGED replay says so at the top rather than dressing its
   dossiers as the recorded run.
3. **A session writes a diagnosis** (this document's routine, below) into
   `seed-<n>/diagnosis.md` beside the dossiers it read.
4. **Diagnoses become work**: a named defect or a valuation adjustment
   becomes a B-task or an issue, with the dossier as its reproduced
   evidence. Nothing applies a diagnosis to live play (rule 5: learning is
   offline; parameter changes land as measured, re-baselined changes).

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

Everything is a pure function of the replay: the same record, engine and
content produce byte-identical dossiers (the exactness test pins this), so
two dossiers diff cleanly across changes.

## The routine (what a diagnosing session does)

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
   `src/think.ts`'s ladder) and ask: given THIS screen, THIS pack, THESE
   hit points, was that the code's intended behavior? Name the function
   and the line.
5. **Write the diagnosis** (shape below) into `seed-<n>/diagnosis.md`.
   Every claim cites its evidence (dossier section or source line); every
   "should have differed" names WHICH code or weight would have to change.
   Speculation is allowed and LABELLED - a hypothesis to test, never a
   finding.
6. **File what the diagnosis implies**: an issue (defect: restores what the
   4.2.6 borg did; choice: improves on it - rule 3 decides the kind) or a
   valuation-adjustment task, linking the dossier path as the reproduced
   evidence. Do not change decision code from a diagnosis session without
   its own measured task.

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

The owner can play the last turns themselves: launch the lab build with the
recorded seed (`?seed=<S>&new`), pin the dossier's named race settings,
birth from the title row, and set `borg.replayReleaseTurn` /
`borg.replayDeathTurn` from the dossier's rung lines. The Borg replays the
run deterministically to the release boundary, then hands the keyboard back
with the death banner (`src/loop/replay.ts`); from there every command the
owner issues is logged (`[replay] ...`, the `event:player-command` rail
that #27's phase 3 deepens into paired state snapshots). One caveat,
stated: the lab build runs the lab branch's engine (the noteSpot fix, our
PR #429), while the harness record ran the published engine - until a
release carries the fix, a lab replay of a HARNESS death can diverge from
the record at the first door-close. The automated path's evidence is the
dossier either way.

## Limits, named

- **Harness runs only, V1.** A watched lineage's deaths replay only when
  the seed seam lands upstream (neo-angband#431) - a mod cannot read the
  seed its game runs on, so the mod's own graveyard cannot name one.
- **The message tail is a bound sink, proven neutral.** The recorded
  sessions booted message-less; the replay binds `state.msg` so the dossier
  carries the tail. Every engine call site is an optional call
  (`state.msg?.(...)` - verified at the pin), and the exactness test pins
  the neutrality on the committed record: if binding the sink moved play,
  the replay would diverge and the test would go red.
- **Rungs are turn-offsets; boundaries are decisions.** The autoplayer can
  only stop at decision boundaries, so a rung whose target falls inside a
  single decision has no release point (`none` in the ladder README), and
  two rungs can share a boundary (the dossier names the boundary turn, so
  sharing is visible).
- **A diagnosis is analysis, never a live-run mutation** (rule 5). It
  reads code and dossiers and writes text.
