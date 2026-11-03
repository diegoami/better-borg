/**
 * THE DEATH REPLAY (#29): same seed, same planned birth, drive to the rung,
 * keep driving to the death, and PROVE the death line came back identical.
 *
 * The determinism insight the issue opens with: a dead run is replayable
 * WITHOUT any copy/snapshot seam because the Borg is deterministic (rule 5)
 * and `?seed=`/`startGame({seed})` re-establishes a game exactly. So the
 * replay is not a recording played back - it is the SAME RUN run again:
 * boot the recorded seed with the recorded planned birth (the pack's own
 * planFor over the record's race), install the same observing controller
 * the session drivers install, drive the same loop. Rule 5 is what makes
 * the verification meaningful: any difference between the replayed death
 * line and the recorded one is a real defect (a nondeterminism, a changed
 * decision, a changed engine), not noise.
 *
 * THE LADDER, not one offset (owner, 2026-11-03): the moments to go back to
 * are a SET - 5/10/15/20 turns before death by default, extensible by the
 * runner's --offsets. Each offset is its own rung with its own dossier. The
 * rungs ride ONE drive: the visit hook (play-session's driveLife) freezes a
 * capture at the FIRST decision boundary at or after T-N, for every N, in
 * one pass - a decision can spend enough turns to cross two rungs at once,
 * and then both rungs share a boundary, which the dossier names rather than
 * hides (the boundary turn is printed, and two rungs printing the same
 * boundary turn is the honest statement that no decision boundary fell
 * between them).
 *
 * WHAT THE REPLAY ASSERTS (rule 5, the issue's done-when): the replayed
 * death must reproduce the recorded line EXACTLY - cause, turn, decision
 * count, and the whole command census (the census/turn stamps match the
 * record). The census agreement is already asserted inside driveLife
 * (#36's rule: the record must not disagree with the game); the replay adds
 * the RECORD agreement on top, and the exactness test (src/postmortem/
 * replay.test.ts) pins a committed record's dead run against it.
 *
 * THE SEAM GAP this rides beside (scope 1, verified 2026-11-03): no
 * mod-facing surface carries the master seed (upstream ask
 * neo-angband#431), so V1 replays HARNESS runs only - runs whose seeds the
 * runner drove and the record carries. A watched lineage's deaths (the mod
 * playing, seed crypto-random per page) are the follow-on the seam unblocks.
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack, GameState, StartedGame } from "@rpgm-tools/neo-angband-core";
import { bindCore, coreIsBound } from "../core-api.js";
import { driveLife, observingLife } from "../play-session.js";
import type { StrategyPack } from "../class/pack.js";
import type { StageDefinition } from "../loop/stage.js";
import { capturePostmortem, renderDossier, type DossierHeader, type PostmortemCapture } from "./dossier.js";

/** The ladder's default rungs: 5/10/15/20 turns before death (owner, 2026-11-03). */
export const DEFAULT_OFFSETS: readonly number[] = [5, 10, 15, 20];

/** The recorded facts a replay needs, read out of a runs.json entry + header. */
export interface DeadRunFacts {
  /** The seed the run played under (the harness's own key). */
  readonly seed: number;
  /** The life number within its record (1-based). */
  readonly life: number;
  /** The race the plan birthed (the record's `race`). */
  readonly race: string;
  /** The base stats the plan bought, in the pack's stat order (the record's `baseStats`). */
  readonly baseStats: readonly number[];
  /** The death turn (the record's `turns` for a pack session: the game turn at death). */
  readonly deathTurn: number;
  /** The killer as the game named it (the record's `causeOfDeath`). */
  readonly cause: string;
  /** Decisions the life took (the record's `decisions`). */
  readonly decisions: number;
  /** The whole-life command census (the record's `commands`). */
  readonly commands: Readonly<Record<string, number>>;
  /** Character level at death (the record's `clvl`). */
  readonly clvl: number;
  /** Deepest depth stood on (the record's `maxDepth`). */
  readonly maxDepth: number;
  /** The session's stage, if it played one (the record's `runner.stage`); observationally neutral for a dying run. */
  readonly stage: StageDefinition | null;
  /** The decision cap the session ran (the record's `runner.decisions`). */
  readonly cap: number;
}

/** One rung's outcome: the frozen capture and the rendered dossier. */
export interface RungOutcome {
  readonly offset: number;
  /** T - offset. */
  readonly targetTurn: number;
  /** The boundary actually captured (the first decision boundary at or after the target). */
  readonly boundaryTurn: number;
  readonly dossier: string;
}

/** How the replay's death compared with the record. */
export interface ReplayVerification {
  readonly exact: boolean;
  readonly differences: readonly string[];
  readonly replayed: {
    readonly dead: boolean;
    readonly cause: string | null;
    readonly turn: number;
    readonly decisions: number;
    readonly commands: Readonly<Record<string, number>>;
  };
}

/** Everything one replay learned. */
export interface DeathReplay {
  readonly verification: ReplayVerification;
  readonly rungs: readonly RungOutcome[];
  /** Offsets whose boundary never came (the run ended first), with why. */
  readonly missed: readonly { readonly offset: number; readonly targetTurn: number; readonly why: string }[];
}

/** Resolve the ladder's rungs: positive, whole, deduplicated, smallest first. */
export function normalizeOffsets(offsets: readonly number[]): number[] {
  const clean = [...new Set(offsets.filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b);
  if (clean.length === 0) throw new Error("the replay ladder needs at least one positive whole-number offset");
  return clean;
}

/** Compare a census pair key-by-key: same codes, same counts. */
function censusDifference(replayed: Readonly<Record<string, number>>, recorded: Readonly<Record<string, number>>): string | null {
  const codes = new Set([...Object.keys(replayed), ...Object.keys(recorded)]);
  for (const code of [...codes].sort()) {
    const a = replayed[code] ?? 0;
    const b = recorded[code] ?? 0;
    if (a !== b) return `census ${code}: replay x${String(a)} vs record x${String(b)}`;
  }
  return null;
}

/**
 * Replay one dead run and build its whole dossier ladder.
 *
 * The boot mirrors the pack session's EXACTLY (src/play-session.ts:
 * playPackSession): same startGame options over the pack's own plan, same
 * bus wiring, same announceArrival, same observing controller - anything
 * less and the replay would be a different run and the verification a
 * tautology. The plan is rebuilt from the record's race and CHECKED against
 * the record's base stats before the boot: a plan disagreement means the
 * replay is not of the recorded character, and that is a hard error, not a
 * difference to report.
 */
export async function replayDeadRun(
  core: typeof Core,
  pack: GamePack,
  strategy: StrategyPack,
  dead: DeadRunFacts,
  record: DossierHeader["record"],
  build: DossierHeader["build"],
  options: { readonly offsets?: readonly number[]; readonly log?: (message: string) => void } = {},
): Promise<DeathReplay> {
  if (!coreIsBound()) bindCore(core);
  const say = options.log ?? ((): void => undefined);
  const ladder = normalizeOffsets(options.offsets ?? DEFAULT_OFFSETS);

  const plan = strategy.planFor(core, pack, dead.race);
  if (plan.baseStats.length !== dead.baseStats.length || plan.baseStats.some((v, i) => v !== dead.baseStats[i])) {
    throw new Error(
      `seed ${String(dead.seed)}: the pack's plan for ${dead.race} buys [${plan.baseStats.join(",")}] but the record ` +
        `birthed [${dead.baseStats.join(",")}] - the replay would not be of the recorded character`,
    );
  }

  const game: StartedGame = core.startGame(pack, {
    seed: dead.seed,
    depth: 0,
    raceName: plan.raceName,
    className: strategy.className,
    roller: "point",
    birthStats: [...plan.baseStats],
  });
  const state: GameState = game.state;

  /* THE MESSAGE SINK, bound for the dossier's message-log tail. The engine
   * routes every game message through `state.msg?.(...)` and never branches
   * on its presence (verified at the pin: every call site is an optional
   * call), so binding it is observation-only - the same standing the
   * session's own kill-counter wrap keeps. The web shell binds the same
   * pair (its msglog is what the lab hook's messages(n) reads); the
   * recorded session bound nothing, and if binding this moved play by even
   * one decision, the exactness assertion this module exists to fail would
   * go red on the committed record - that test is the neutrality proof. */
  const messages = new core.MessageLog();
  state.messages = messages;
  state.msg = (text: string, type?: Parameters<NonNullable<GameState["msg"]>>[1]): void => {
    messages.add(text, core.messageTypeCode(type));
  };

  const bus = new core.GameEvents();
  state.events = bus;
  game.announceArrival();

  const observed = observingLife(core, game, dead.seed);

  /* The rungs, easiest target first (largest offset = smallest T-N). The
   * visit hook freezes a capture at the first boundary at or after each
   * rung's target turn; driveLife calls it at every loop top, and the drive
   * runs to the death (or the cap) so the verification has the whole life.
   * ASCENDING target order is what makes the consuming while-loop correct:
   * the rung whose target arrives EARLIEST is the first one a boundary
   * satisfies, and a decision that crosses several targets at once captures
   * each of them at that shared boundary (the dossier names the boundary
   * turn, so two rungs sharing it is visible, not hidden). */
  const rungs: { offset: number; targetTurn: number; capture: PostmortemCapture }[] = [];
  const pending = ladder
    .map((offset) => ({ offset, targetTurn: dead.deathTurn - offset }))
    .sort((a, b) => a.targetTurn - b.targetTurn);
  let visitIndex = 0;
  const visit = (): void => {
    while (visitIndex < pending.length && state.turn >= pending[visitIndex]!.targetTurn) {
      const rung = pending[visitIndex]!;
      rungs.push({
        offset: rung.offset,
        targetTurn: rung.targetTurn,
        capture: capturePostmortem(core, state, {
          commands: observed.commands,
          trail: observed.trail,
        }),
      });
      visitIndex += 1;
    }
  };

  const { dead: died, taken } = driveLife(
    core,
    game,
    dead.cap,
    observed,
    dead.seed,
    dead.stage ?? undefined,
    visit,
  );
  /* No trailing visit on purpose: a rung whose target was crossed only by
   * the KILLING decision (or never reached before the cap) has no live
   * decision boundary at or after it, and a post-mortem snapshot is not a
   * release point - it lands in `missed`, with the reason. */
  observed.uninstall();

  const replayedCommands: Record<string, number> = { ...observed.commands };
  const differences: string[] = [];
  if (!died) differences.push(`the replay survived its cap of ${String(dead.cap)} decisions (the record died)`);
  const replayedCause = died ? state.actor.player.diedFrom : null;
  if (died && replayedCause !== dead.cause) differences.push(`cause: replay "${String(replayedCause)}" vs record "${dead.cause}"`);
  if (state.turn !== dead.deathTurn) differences.push(`turn: replay ${String(state.turn)} vs record ${String(dead.deathTurn)}`);
  if (taken !== dead.decisions) differences.push(`decisions: replay ${String(taken)} vs record ${String(dead.decisions)}`);
  const census = censusDifference(replayedCommands, dead.commands);
  if (census !== null) differences.push(census);
  if (died && state.actor.player.lev !== dead.clvl) differences.push(`character level: replay ${String(state.actor.player.lev)} vs record ${String(dead.clvl)}`);
  if (state.actor.player.maxDepth !== dead.maxDepth) differences.push(`max depth: replay ${String(state.actor.player.maxDepth)} vs record ${String(dead.maxDepth)}`);

  say(
    `seed ${String(dead.seed)} replay ${differences.length === 0 ? "reproduced the recorded death exactly" : `DIVERGED (${differences.join("; ")})`}`,
  );

  const verification: ReplayVerification = {
    exact: differences.length === 0,
    differences,
    replayed: { dead: died, cause: replayedCause, turn: state.turn, decisions: taken, commands: replayedCommands },
  };

  const missed = pending.slice(rungs.length).map((rung) => ({
    offset: rung.offset,
    targetTurn: rung.targetTurn,
    why: died
      ? `the replay died at turn ${String(state.turn)} before turn ${String(rung.targetTurn)} had a decision boundary`
      : `the replay survived its cap before turn ${String(rung.targetTurn)}`,
  }));
  for (const miss of missed) say(`seed ${String(dead.seed)} offset ${String(miss.offset)}: ${miss.why}`);

  const rungOutcomes: RungOutcome[] = rungs.map((rung) => {
    const header: DossierHeader = {
      seed: dead.seed,
      life: dead.life,
      record,
      death: { turn: dead.deathTurn, cause: dead.cause, clvl: dead.clvl, maxDepth: dead.maxDepth, decisions: dead.decisions },
      offset: rung.offset,
      ladder,
      targetTurn: rung.targetTurn,
      boundaryTurn: rung.capture.turn,
      /* The census the capture froze is the WHOLE life so far, so its total
       * IS the decisions completed at the boundary (the census and the
       * decision count agree by driveLife's own assertion, #36's rule). */
      decisionsAtBoundary: censusCount(rung.capture),
      verification,
      build,
    };
    return {
      offset: rung.offset,
      targetTurn: rung.targetTurn,
      boundaryTurn: rung.capture.turn,
      dossier: renderDossier(header, rung.capture),
    };
  });

  return { verification, rungs: rungOutcomes, missed };
}

/** Sum a census record. */
function censusCount(capture: PostmortemCapture): number {
  let total = 0;
  for (const count of Object.values(capture.census)) total += count;
  return total;
}
