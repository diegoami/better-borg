/**
 * Mandos death replay: reconstruct the accepted birth under matching original
 * code/content/configuration, drive once and inspect versioned living windows.
 * A seed alone does not establish equivalence. The retained verification checks
 * endpoint facts and the whole command census; it does not prove full ordered
 * commands, observations or RNG trajectory identity.
 *
 * V2 uses5/12/25/40/60/82/105 Neo Core game-turn offsets. The named legacy v1
 * retains5/10/15/20 and its former first-boundary handling of pre-start targets.
 * One visit hook observes every requested window at the first living decision
 * boundary at or after its target. Shared boundaries are explicit; no trailing
 * post-death visit or interpolated/pre-start state is invented. Earlier event
 * anchors are separate evidence and are not captured by this profile change.
 *
 * The existing accepted-birth plan/RNG/options checks and endpoint/census
 * comparison remain the source of the verdict. Missing executable/start facts
 * or divergent attempts must remain visible; no replay is a new natural life.
 */

import type * as Core from "@rpgm-tools/neo-angband-core";
import type { GamePack, GameState, StartedGame } from "@rpgm-tools/neo-angband-core";
import { bindCore, coreIsBound } from "../core-api.js";
import { driveLife, observingLife, type LifeStall } from "../play-session.js";
import type { StrategyPack } from "../class/pack.js";
import type { StageDefinition } from "../loop/stage.js";
import { birthReplayDataOf, type BirthReplayData } from "../records/birth-replay.js";
import { DEFAULT_WINDOW_PROFILE, windowProfile, windowSchedule, missingBoundaryReason, type WindowProfile } from "./windows.js";
export { normalizeOffsets } from "./windows.js";
import { capturePostmortem, renderDossier, type DossierHeader, type PostmortemCapture } from "./dossier.js";

/** Current v2 windows; named v1 retains historical behavior/evidence. */
export const DEFAULT_OFFSETS = DEFAULT_WINDOW_PROFILE.offsets;

/** The recorded facts a replay needs, read out of a runs.json entry + header. */
export interface DeadRunFacts extends BirthReplayData {
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
  /**
   * FORK (Mandos #56): the stall that ended the life, when it stalled rather
   * than died (the record's `stall`). The replay must then stall the same
   * way, at the same decision and turn; the rungs anchor at the life's end
   * (`deathTurn`, the record's `turns`) exactly as for a death.
   */
  readonly stall?: LifeStall;
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
  readonly scope: "endpoint-and-command-census";
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
  readonly profile: WindowProfile;
  readonly startTurn: number;
  readonly earlierAnchors: { readonly status: "not-captured"; readonly anchors: readonly never[] };
  readonly verification: ReplayVerification;
  readonly rungs: readonly RungOutcome[];
  /** Offsets whose boundary never came (the run ended first), with why. */
  readonly missed: readonly { readonly offset: number; readonly targetTurn: number; readonly why: string }[];
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
  options: { readonly profile?: string; readonly offsets?: readonly number[]; readonly log?: (message: string) => void } = {},
): Promise<DeathReplay> {
  if (!coreIsBound()) bindCore(core);
  const say = options.log ?? ((): void => undefined);
  const profile = windowProfile(options.profile, options.offsets);
  const ladder = profile.offsets;
  const birth = birthReplayDataOf(dead);
  if ((dead.birthRngState !== undefined && birth.birthRngState === undefined)
    || (dead.birthOptions !== undefined && birth.birthOptions === undefined)) {
    throw new Error(`seed ${String(dead.seed)}: invalid accepted-birth replay input`);
  }
  if (birth.birthRngState === undefined) {
    throw new Error(`Optional replay unavailable for seed ${String(dead.seed)}: accepted-birth RNG input is missing; a seed alone cannot verify a captured birth`);
  }
  if (birth.birthRngState?.quick || birth.birthRngState?.fixed) {
    throw new Error(`seed ${String(dead.seed)}: a debug RNG birth cannot be replayed as normal play`);
  }

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
    ...(birth.birthRngState === undefined ? {} : { rngState: birth.birthRngState }),
    ...(birth.birthOptions === undefined ? {} : { optionOverrides: birth.birthOptions }),
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

  const observed = observingLife(core, game, pack);

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
  const schedule = windowSchedule(dead.deathTurn, state.turn, profile);
  const startTurn = state.turn;
  const visit = (): void => {
    for (const rung of schedule.take(state.turn)) {
      rungs.push({
        offset: rung.offset,
        targetTurn: rung.targetTurn,
        capture: capturePostmortem(core, state, {
          commands: observed.commands,
          trail: observed.trail,
        }),
      });
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
  const replayedCause = died ? state.actor.player.diedFrom : null;
  if (dead.stall === undefined) {
    if (!died) differences.push(`the replay survived its cap of ${String(dead.cap)} decisions (the record died)`);
    if (died && replayedCause !== dead.cause) differences.push(`cause: replay "${String(replayedCause)}" vs record "${dead.cause}"`);
  } else {
    /* #56: a stalled record replays to the same stall. */
    const want = dead.stall;
    const got = observed.stall;
    if (died) differences.push(`the replay died of "${String(replayedCause)}" (the record stalled)`);
    if (got === null) differences.push(`the replay did not stall (the record stalled: ${want.kind} ${String(want.command)} at decision ${String(want.decision)})`);
    else if (got.kind !== want.kind || got.command !== want.command || got.decision !== want.decision || got.turn !== want.turn) {
      differences.push(
        `stall: replay ${got.kind} ${String(got.command)} at decision ${String(got.decision)} turn ${String(got.turn)} ` +
          `vs record ${want.kind} ${String(want.command)} at decision ${String(want.decision)} turn ${String(want.turn)}`,
      );
    }
  }
  if (state.turn !== dead.deathTurn) differences.push(`turn: replay ${String(state.turn)} vs record ${String(dead.deathTurn)}`);
  if (taken !== dead.decisions) differences.push(`decisions: replay ${String(taken)} vs record ${String(dead.decisions)}`);
  const census = censusDifference(replayedCommands, dead.commands);
  if (census !== null) differences.push(census);
  if (died && state.actor.player.lev !== dead.clvl) differences.push(`character level: replay ${String(state.actor.player.lev)} vs record ${String(dead.clvl)}`);
  if (state.actor.player.maxDepth !== dead.maxDepth) differences.push(`max depth: replay ${String(state.actor.player.maxDepth)} vs record ${String(dead.maxDepth)}`);

  say(
    `seed ${String(dead.seed)} replay ${differences.length === 0 ? "matched the recorded death endpoint/census" : `DIVERGED (${differences.join("; ")})`}`,
  );

  const verification: ReplayVerification = {
    scope: "endpoint-and-command-census",
    exact: differences.length === 0,
    differences,
    replayed: { dead: died, cause: replayedCause, turn: state.turn, decisions: taken, commands: replayedCommands },
  };

  const missed = [
    ...schedule.preStart.map(rung => ({
      ...rung,
      why: `target turn ${String(rung.targetTurn)} precedes replay start turn ${String(startTurn)}; no pre-start state is available`,
    })),
    ...schedule.remaining().map(rung => ({
      ...rung,
      why: missingBoundaryReason(died ? "death" : observed.stall !== null ? "stall" : "cap", state.turn, rung.targetTurn),
    })),
  ];
  for (const miss of missed) say(`seed ${String(dead.seed)} offset ${String(miss.offset)}: ${miss.why}`);

  const rungOutcomes: RungOutcome[] = rungs.map((rung) => {
    const header: DossierHeader = {
      seed: dead.seed,
      life: dead.life,
      record,
      death: { turn: dead.deathTurn, cause: dead.cause, clvl: dead.clvl, maxDepth: dead.maxDepth, decisions: dead.decisions },
      offset: rung.offset,
      ladder,
      windowProfile: profile,
      replayStartTurn: startTurn,
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

  return { profile, startTurn, earlierAnchors: { status: "not-captured", anchors: [] }, verification, rungs: rungOutcomes, missed };
}

/** Sum a census record. */
function censusCount(capture: PostmortemCapture): number {
  let total = 0;
  for (const count of Object.values(capture.census)) total += count;
  return total;
}
