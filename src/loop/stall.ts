/**
 * THE STALL WATCH: the same command against the same scene, again and again,
 * is a command the game takes and does nothing with (#56).
 *
 * One copy for both drivers. Until #56 only the mod's tick (src/api2/
 * controller.ts) watched for stalls: after STALLS_BEFORE_FORGET identical
 * commands it forgot what it believed about the aimed grid, and after
 * STALLS_BEFORE_RELEASE it handed the keyboard back. The headless harness
 * did neither, so a stalled life simply played on to its cap (the B55
 * Blackguard: 397 rests in 400 decisions), and the forget step - which
 * changes later decisions - happened in the lab and never in a measured
 * run. Both drivers now count through this module. The tick still releases
 * the keyboard; the harness ends the life and records the stall, so a stuck
 * borg leaves evidence the way a dead one does.
 *
 * FORK (Mandos #56), a CHOICE: upstream's port has the tick's guard but no
 * shared watch and no stall record.
 *
 * Pure and deterministic: the scene key reads only the view, and nothing
 * here draws randomness or reads a clock (rule 5).
 */

import type { AgentCommand } from "@rpgm-tools/neo-angband-core";
import type { BorgWorld } from "../world/model.js";
import { BORG_MARK, BORG_VIEW } from "../world/grid.js";

/** Keypad direction to the grid offset it names (the game's own table). */
const DIR_DX: readonly number[] = [0, -1, 0, 1, -1, 0, 1, -1, 0, 1];
const DIR_DY: readonly number[] = [0, 1, 1, 1, 0, 0, 0, -1, -1, -1];

/** The grid a directional command aims at, or null for one with no direction. */
export function aimedGrid(command: AgentCommand, from: { readonly x: number; readonly y: number }): { x: number; y: number } | null {
  const dir = (command as { readonly dir?: number }).dir;
  if (dir === undefined || dir < 1 || dir > 9 || dir === 5) return null;
  return { x: from.x + DIR_DX[dir]!, y: from.y + DIR_DY[dir]! };
}

/** Stop believing the Borg's map of one grid: unknown terrain, not marked or in view. */
export function forgetGrid(world: BorgWorld, x: number, y: number): void {
  if (!world.map.inBounds(x, y)) return;
  const grid = world.map.at(x, y);
  grid.feat = 0;
  grid.info &= ~(BORG_MARK | BORG_VIEW);
}

/**
 * Identical commands in a row against an unchanged scene, after which the
 * Borg stops believing its map of the grid the command aimed at. A door the
 * game opened without the Borg's map hearing of it is the case this exists
 * for: the game takes "open" for a door that is no longer there and no turn
 * passes, so nothing the Borg's refusal and idle counts watch ever moves.
 */
export const STALLS_BEFORE_FORGET = 6;
/** The same, after which the life is stalled: the tick releases the keyboard, the harness ends the life. */
export const STALLS_BEFORE_RELEASE = 40;
/** Waits in a row on which the Borg had no command at all. */
export const IDLE_BEFORE_RELEASE = 25;

/** The slice of a view the scene key reads. */
export interface SceneView {
  player(): unknown;
  monsters(): readonly { readonly grid: { readonly x: number; readonly y: number }; readonly hp?: unknown }[];
}

/**
 * FORK: Mandos #99 retains the shared headless/desktop watch while adopting
 * Neo's published-grade tests. An effect clearing or crossing a grade changes
 * the scene; an unseen countdown within one grade does not. Presence of an
 * affliction alone does not prove that a repeated command spent a turn.
 * Food remains outside the key so it cannot hide an otherwise unchanged rest.
 */
const AFFLICTIONS = ["blind", "confused", "afraid", "poisoned", "cut", "stun", "paralyzed"] as const;

/**
 * What the scene is, for the purpose of "did that command change anything":
 * the player's grid, depth, hp, sp, exp and gold, its timed afflictions, and
 * every perceived monster's grid and hp. The game turn is deliberately left
 * out: a rest that passes turns and changes nothing else is exactly a stall.
 */
export function sceneKey(view: SceneView): string {
  const player = view.player() as Readonly<Record<string, unknown>> & { readonly grid: { readonly x: number; readonly y: number } };
  const status = (player["status"] ?? {}) as Readonly<Record<string, unknown>>;
  const afflictions = AFFLICTIONS.map((name) => status[name] ?? 0);
  const monsters = view.monsters().map((monster) => [monster.grid.x, monster.grid.y, monster.hp]);
  return JSON.stringify([player.grid.x, player.grid.y, player["depth"], player["hp"], player["sp"], player["exp"], player["gold"], afflictions, monsters]);
}

/** What one observed decision calls for. */
export interface StallStep {
  /** Identical commands in a row so far, this one included (0 for the first). */
  readonly repeats: number;
  /** Forget the grid this command aimed at (every STALLS_BEFORE_FORGET repeats). */
  readonly forget: boolean;
  /** The life is stalled: the command repeated STALLS_BEFORE_RELEASE times, or no command came IDLE_BEFORE_RELEASE times. */
  readonly stalled: { readonly kind: "repeat" | "idle"; readonly command: string | null } | null;
}

/** A stall watch: feed it each decision's scene and command, in order. */
export interface StallWatch {
  observe(scene: string, command: AgentCommand | null): StallStep;
}

export function createStallWatch(): StallWatch {
  let lastScene = "";
  let lastCommand = "";
  let repeats = 0;
  let idle = 0;
  return {
    observe(scene, command) {
      if (command === null) {
        idle += 1;
        if (idle >= IDLE_BEFORE_RELEASE) {
          idle = 0;
          return { repeats: 0, forget: false, stalled: { kind: "idle", command: null } };
        }
        return { repeats: 0, forget: false, stalled: null };
      }
      idle = 0;
      const key = JSON.stringify(command);
      repeats = scene === lastScene && key === lastCommand ? repeats + 1 : 0;
      lastScene = scene;
      lastCommand = key;
      if (repeats >= STALLS_BEFORE_RELEASE) {
        repeats = 0;
        return { repeats: STALLS_BEFORE_RELEASE, forget: false, stalled: { kind: "repeat", command: command.code } };
      }
      return { repeats, forget: repeats >= STALLS_BEFORE_FORGET && repeats % STALLS_BEFORE_FORGET === 0, stalled: null };
    },
  };
}
