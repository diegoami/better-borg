/**
 * THE UNCERTAINTY SIGNAL (#27, phase 1): where the Borg was NOT sure, as a
 * deterministic, journaled fact.
 *
 * The trainer loop begins with the Borg knowing its own doubts. Two signals,
 * both computed from state the decision pass already produced - nothing here
 * draws RNG, reads a clock, or runs an extra simulation pass, so a decision
 * that journals an unsure point is byte-for-byte the decision that did not
 * (rule 5; the stock suites are the proof). The signal is ALWAYS ON and
 * needs no setting and no capability: it is a journal, not a question path -
 * turning unsure points into live trainer questions (#27's phase 2) is
 * DEFERRED by the owner (2026-11-03), and this tree builds none of it.
 *
 * WHERE VALUATION SCORES SURFACE (the brief's open question, answered): the
 * engine's agent seam (AgentController) is a frozen view-in/command-out
 * boundary and exposes NO scores - the host never ranks candidate actions for
 * a mod. The valuations live in THIS port's own decision code, and the one
 * place that numerically ranks alternative candidate ACTIONS with comparable
 * scores is the best-attack chooser (src/fight/attack.ts, borgAttack): it
 * scores every BF_* method through borg_calculate_attack_effectiveness and
 * commits the highest. The think ladder itself is priority-ordered
 * (first-rung-wins, not scored), and the item valuations (takeValue, the wear
 * checks) are per-item thresholds, not per-decision candidate rankings. So
 * "valuation ties" means ATTACK-CHOOSER ties, read at their source; no
 * engine-side read was needed, and none was added.
 *
 * THE TWO SIGNALS:
 *
 *   valuation-tie   the chooser's top two methods scored within TIE_WITHIN of
 *                   each other, and the command committed was the chooser's
 *                   own (identity: the point describes THIS decision). An
 *                   exact tie is the purest case - which method won was then
 *                   decided by enum order alone, bookkeeping, not judgement.
 *   known-world-gap the command acts on a grid the Borg's own map has never
 *                   observed (no BORG_MARK) - terrain it believes things
 *                   about without ever having seen. Rare (flow routes
 *                   through known grids), and rare is fine: the signal is
 *                   journaled, never fabricated.
 *
 * The unsure point is JSON-clean (no live objects): it lands in the run
 * record (additive fields, schema id frozen - rule 8) and in the on-death
 * report beside B29's post-mortem facts, with sibling field names (turn,
 * depth, at) so #28's ledger can read both without translation.
 */

import type { AgentCommand } from "@rpgm-tools/neo-angband-core";
import type { BorgWorld } from "./world/model.js";
import { BORG_MARK } from "./world/grid.js";
import { BF } from "./fight/bf.js";

/**
 * The two view reads a point stamps itself with, as a structural shape: the
 * port does not name host types (adapter-boundary.test.ts's rule), and the
 * signal needs exactly these - the turn the decision read and where the
 * character stood. Both the engine's own view and the API 2 bridge's view
 * satisfy it.
 */
export interface StampView {
  turn(): number;
  player(): { readonly depth: number; readonly hp: number; readonly grid: { readonly x: number; readonly y: number } };
}

/**
 * The tie window: the runner-up's score at or above this fraction of the
 * winner's makes the choice a tie. Relative, not absolute, because attack
 * scores are expected-damage numbers whose scale grows with the character; 5%
 * keeps the signal to choices the chooser could not separate.
 */
export const TIE_WITHIN = 0.05;

/**
 * How many unsure points a journal keeps, newest last: the tail a post-mortem
 * reads is the run's last doubts before its end. The TOTAL is kept beside the
 * tail (a run with five thousand unsure points is a different Borg), so
 * truncation never pretends the signal was rare.
 */
export const MAX_UNSURE_KEPT = 100;

/** One candidate of a tied valuation, as the journal carries it. */
export interface AttackCandidate {
  /** The attack method's own name (the BF enum's: THRUST, LAUNCH, ...). */
  readonly method: string;
  /** The chooser's score for it (expected net reward). */
  readonly score: number;
}

/** One journaled unsure point: everything in it survives JSON round-trips. */
export interface UnsurePoint {
  readonly kind: "valuation-tie" | "known-world-gap";
  /** The game's turn (stamped from the view the decision read). */
  readonly turn: number;
  /** The depth the decision was made on. */
  readonly depth: number;
  /** Where the character stood. */
  readonly at: { readonly x: number; readonly y: number };
  /** The character's hit points at the decision. */
  readonly hp: number;
  /** What the Borg chose (the command's code). */
  readonly chosen: string;
  /** The tied candidates, best first (valuation-tie only; empty otherwise). */
  readonly candidates: readonly AttackCandidate[];
  /** The unobserved grid the command acts on (known-world-gap only). */
  readonly aim: { readonly x: number; readonly y: number } | null;
}

/**
 * The attack chooser's last committed valuation. Written once per committed
 * attack (observation-only); the runner-up rides as a SCORE (the tie's
 * other half), never as a runnable command - turning a tie into a question
 * is #27's phase 2, DEFERRED by the owner (2026-11-03): this module carries
 * no ask-mode capture, and nothing downstream of it pauses or asks.
 */
export interface AttackValuation {
  readonly best: AttackCandidate;
  readonly runner: AttackCandidate | null;
  /** The committed command (what borgAttack returned). */
  readonly command: AgentCommand | null;
}

/** The per-world uncertainty state (one per Borg, like the fight state). */
interface UncertaintyState {
  valuation: AttackValuation | null;
}

const STATES = new WeakMap<BorgWorld, UncertaintyState>();

function uncertaintyOf(world: BorgWorld): UncertaintyState {
  let st = STATES.get(world);
  if (st === undefined) {
    st = { valuation: null };
    STATES.set(world, st);
  }
  return st;
}

/** The chooser's record of its last committed attack, or null before one. */
export function attackValuationOf(world: BorgWorld): AttackValuation | null {
  return uncertaintyOf(world).valuation;
}

/** Record the chooser's committed valuation (called from src/fight/attack.ts). */
export function noteAttackValuation(world: BorgWorld, valuation: AttackValuation): void {
  uncertaintyOf(world).valuation = valuation;
}

/** An attack method's own name (the BF enum's), for journals. */
export function methodLabel(method: number): string {
  return BF[method] ?? `BF#${String(method)}`;
}

/**
 * Whether two scores are a tie: the runner scored, and within TIE_WITHIN of
 * the best. Pure - the same pair always answers the same.
 */
export function tieBetween(best: AttackCandidate, runner: AttackCandidate | null): boolean {
  if (runner === null || runner.score <= 0 || best.score <= 0) return false;
  return runner.score >= best.score * (1 - TIE_WITHIN);
}

/** Keypad direction to the grid offset it names (the game's own table). */
const DIR_DX: readonly number[] = [0, -1, 0, 1, -1, 0, 1, -1, 0, 1];
const DIR_DY: readonly number[] = [0, 1, 1, 1, 0, 0, 0, -1, -1, -1];

/** The grid a direction command acts on, or null for a command that names none. */
export function aimedAt(command: AgentCommand, from: { readonly x: number; readonly y: number }): { x: number; y: number } | null {
  const dir = (command as { readonly dir?: number }).dir;
  if (dir === undefined || dir < 1 || dir > 9 || dir === 5) return null;
  return { x: from.x + DIR_DX[dir]!, y: from.y + DIR_DY[dir]! };
}

/**
 * Assess one decision: does the command the Borg just chose mark this as an
 * unsure point? Pure over the world's own map, the recorded valuation, and
 * the view the decision read; null means the decision was sure. The caller
 * journals the point (the tick in the mod, the observing controller in the
 * harness) - this function only answers.
 *
 * The valuation tie requires IDENTITY (command === valuation.command): the
 * recorded valuation describes the last committed attack, and a decision
 * that chose some other rung's command was not that attack, however close
 * the chooser's scores were.
 */
export function assessUncertainty(world: BorgWorld, view: StampView, command: AgentCommand): UnsurePoint | null {
  const player = view.player();
  const stamp = {
    turn: view.turn(),
    depth: player.depth,
    at: { x: player.grid.x, y: player.grid.y },
    hp: player.hp,
    chosen: command.code,
  };

  const valuation = uncertaintyOf(world).valuation;
  if (valuation !== null && valuation.command === command && valuation.runner !== null && tieBetween(valuation.best, valuation.runner)) {
    return { kind: "valuation-tie", ...stamp, candidates: [valuation.best, valuation.runner], aim: null };
  }

  const aim = aimedAt(command, player.grid);
  if (aim !== null && world.map.inBounds(aim.x, aim.y) && (world.map.at(aim.x, aim.y).info & BORG_MARK) === 0) {
    return { kind: "known-world-gap", ...stamp, candidates: [], aim };
  }

  return null;
}
