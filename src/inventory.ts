/**
 * THE INVENTORY LEDGER (#28): what the Borg kept and what it let go, at the
 * moments the pack was too full to keep everything.
 *
 * The owner directive (2026-11-03): the old borg was bad at INVENTORY
 * OPTIMIZATION, and the fix begins with evidence - a corpus of the sharp
 * decisions, human-judged, that B03's valuation seam will one day train
 * against. A DISCARD MOMENT is the sharpest of them: the pack is full or
 * nearly, something must go, and WHAT the Borg chose to give up is exactly the
 * judgement a reviewer can grade. Stash vs sell vs drop is ONE decision family
 * (the issue's spec note): the moments the Borg chooses the home carry the
 * same context as the ones it drops on the floor or sells for gold.
 *
 * THE DEFINITION, as implemented:
 *
 *   capacity pressure  the pack held at most PRESSURE_FREE_SLOTS free slots of
 *                      its PACK_SIZE (>= 21 of 23) at the moment of the
 *                      decision - measured on the pack BEFORE the item left,
 *                      because that is the pack the Borg was choosing over.
 *                      Why 2: at 23/23 the game itself sheds on the next
 *                      pickup (pack_overflow) and every choice is forced; at
 *                      22 the next find fills the pack; at 21 the Borg's own
 *                      keep/leave machinery (junk crush, sell-to-home, the
 *                      take flow's one-empty-slot requirement - borg-flow-
 *                      take.c's borg_items[PACK_SLOTS-1].iqty check) is making
 *                      the choices a reviewer wants to grade. Below that band
 *                      a sale is a cash decision, not a capacity one, and the
 *                      ledger can widen later (the issue says discard moments
 *                      FIRST).
 *   an item leaving     the departure is attributed by HANDLE: only the gear
 *                      handle the command itself named counts, and only if it
 *                      is really gone (absent, or its stack shrank) in the
 *                      next observation. A refused command discarded nothing
 *                      and journals nothing; a monster stealing a different
 *                      item mid-window is noise the handle match refuses.
 *   the family          drop | sell | stash - "drop"/"destroy" are drops, a
 *                      "shop-sell" in a store sells, the same command in the
 *                      home (BORG_HOME) stashes.
 *
 * LIKE #27'S SIGNAL, this is observation-only from state the decision pass
 * already produced: the pack rows are frozen from the same view the decision
 * read, the command is the one the census counted, and nothing here draws RNG,
 * reads a clock, or runs an extra pass - a decision that journals a moment is
 * byte-for-byte the decision that did not (rule 5; the play suites are the
 * proof). The moments are JSON-clean (no live objects) and land additively in
 * the run record (schema id frozen, rule 7) and in the journal's archive
 * entry beside #27's `unsure`, with sibling field names (turn, depth) so both
 * read without translation.
 */

import { TV } from "./core-api.js";
import { BORG_HOME, PACK_SIZE } from "./store/store.js";

/**
 * How many free pack slots the pressure band allows: the moment fires when the
 * pack held at most this many free slots of its PACK_SIZE. See the header for
 * why it is 2.
 */
export const PRESSURE_FREE_SLOTS = 2;

/**
 * The pack's capacity, the game's own z_info->pack_size (carry-cap:pack-size,
 * 23 in the shipped content) - the port's own constant (src/store/store.ts),
 * the same number borgFirstEmptyInventorySlot measures against.
 */
export { PACK_SIZE };

/** How many discard moments a journal keeps, newest last (the unsure tail's rule). */
export const MAX_MOMENTS_KEPT = 200;

/** How many message lines one moment carries (the window's tail, newest last). */
export const MAX_SAID_KEPT = 8;

/** The one decision family, three ways out. */
export type DiscardWay = "drop" | "sell" | "stash";

/** One pack row, frozen from whichever view observed it. */
export interface LedgerRow {
  /** The gear handle at the moment (identity within the run; a command names it). */
  readonly handle: number;
  /** The game's own description of the item, as the player's inventory shows it. */
  readonly desc: string;
  /** The readable tval name (the engine's own constant table, lowercased). */
  readonly kind: string;
  readonly tval: number;
  readonly sval: number;
  /** How many of the stack the row carries. */
  readonly number: number;
  /** The stack's value as the view priced it, when it did. */
  readonly value: number | null;
}

/** Where and when an observation stood. */
export interface LedgerStamp {
  readonly turn: number;
  readonly depth: number;
}

/** The command whose execution the next observation will judge. */
export interface LedgerCommand {
  /** The command code, as the census counts it. */
  readonly code: string;
  /** The gear handle the command named, when it named one. */
  readonly handle: number | null;
  /** The shop number the character stood in (BORG_HOME = the home), when in one. */
  readonly shop: number | null;
}

/** One discard moment: everything in it survives JSON round-trips. */
export interface DiscardMoment {
  /** The turn of the DECISION (the observation before the item left). */
  readonly turn: number;
  /** The depth the decision was made on. */
  readonly depth: number;
  readonly way: DiscardWay;
  /** The command code as issued. */
  readonly command: string;
  /** Pack rows in use at the decision - the pressure, as a number. */
  readonly slotsUsed: number;
  /** The pack's capacity (PACK_SIZE), so a reader needs no table. */
  readonly packSize: number;
  /** The item as it stood before it left. */
  readonly left: LedgerRow;
  /** How many of its stack departed (1 for a whole item; more for a bunch). */
  readonly gone: number;
  /** The pack that stayed, as the next observation found it. */
  readonly stayed: readonly LedgerRow[];
  /** The message lines over the command's execution, oldest first (may be empty). */
  readonly said: readonly string[];
}

/**
 * Whether a pack this full is under capacity pressure. Pure: the same count
 * always answers the same.
 */
export function underPressure(slotsUsed: number): boolean {
  return slotsUsed >= PACK_SIZE - PRESSURE_FREE_SLOTS;
}

/**
 * Which member of the discard family a command is, or null when it is not a
 * discard at all. Pure.
 */
export function discardWayOf(command: LedgerCommand): DiscardWay | null {
  if (command.code === "drop" || command.code === "destroy") return "drop";
  if (command.code === "shop-sell") return command.shop === BORG_HOME ? "stash" : "sell";
  return null;
}

/** The readable name of a tval, from the engine's own TV table (the live binding). */
export function kindLabel(tval: number): string {
  for (const [name, value] of Object.entries(TV)) {
    if (value === tval) return name.toLowerCase();
  }
  return `tval${String(tval)}`;
}

/** The per-run ledger state (one per character, beside the uncertainty journal). */
export interface InventoryLedger {
  /** How many discard moments the run produced (the tail is bounded; this is not). */
  readonly total: number;
  /** The moments themselves, oldest first, bounded to MAX_MOMENTS_KEPT. */
  readonly moments: readonly DiscardMoment[];
  /**
   * One observation: the pack as it stands now (the previous command's result,
   * before this new command runs) and the command about to be carried. The
   * FIRST call only seeds - nothing has left yet. Returns the moment the
   * previous command produced, or null when it produced none. `said` is the
   * message window since the previous observation (already sliced by the
   * caller); it is capped here to the newest MAX_SAID_KEPT lines.
   */
  observe(rows: readonly LedgerRow[], command: LedgerCommand, stamp: LedgerStamp, said: readonly string[]): DiscardMoment | null;
}

/** What one observation remembers until the next one judges it. */
interface Pending {
  readonly rows: readonly LedgerRow[];
  readonly command: LedgerCommand;
  readonly stamp: LedgerStamp;
}

/**
 * Start a run's ledger. Pure observation: the caller freezes rows from its own
 * view and passes the command it is about to carry; the ledger never sees a
 * live game object.
 */
export function inventoryLedger(): InventoryLedger {
  let pending: Pending | null = null;
  const moments: DiscardMoment[] = [];
  let total = 0;
  return {
    get total(): number {
      return total;
    },
    get moments(): readonly DiscardMoment[] {
      return moments;
    },
    observe(rows, command, stamp, said) {
      let moment: DiscardMoment | null = null;
      const was = pending;
      if (was !== null) {
        const way = discardWayOf(was.command);
        const handle = was.command.handle;
        const before = way === null || handle === null ? undefined : was.rows.find((row) => row.handle === handle);
        if (before !== undefined && underPressure(was.rows.length)) {
          const after = rows.find((row) => row.handle === handle);
          const gone = after === undefined ? before.number : before.number - after.number;
          if (gone > 0) {
            moment = {
              turn: was.stamp.turn,
              depth: was.stamp.depth,
              way,
              command: was.command.code,
              slotsUsed: was.rows.length,
              packSize: PACK_SIZE,
              left: before,
              gone,
              stayed: [...rows],
              said: said.slice(-MAX_SAID_KEPT),
            };
            total += 1;
            moments.push(moment);
            if (moments.length > MAX_MOMENTS_KEPT) moments.shift();
          }
        }
      }
      pending = { rows: [...rows], command, stamp };
      return moment;
    },
  };
}

/* ==================================================================
 * The defensive read: a moment only this module writes, re-checked
 * field by field (the journal's house rule over both its slots - a
 * value this module did not write is not a record).
 * ================================================================== */

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const numberOr = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function rowOf(value: unknown): LedgerRow | null {
  if (!isObject(value)) return null;
  const handle = numberOr(value["handle"]);
  const tval = numberOr(value["tval"]);
  const sval = numberOr(value["sval"]);
  const number = numberOr(value["number"]);
  if (handle === null || tval === null || sval === null || number === null) return null;
  if (typeof value["desc"] !== "string" || typeof value["kind"] !== "string") return null;
  const price = value["value"];
  return {
    handle,
    desc: value["desc"],
    kind: value["kind"],
    tval,
    sval,
    number,
    value: price === null ? null : numberOr(price),
  };
}

/**
 * A discard moment only this module writes, or null when the value is not one.
 * Every field is re-checked; a malformed row anywhere drops the whole moment
 * (the unsure block's rule).
 */
export function readDiscardMoment(value: unknown): DiscardMoment | null {
  if (!isObject(value)) return null;
  const way = value["way"];
  if (way !== "drop" && way !== "sell" && way !== "stash") return null;
  const turn = numberOr(value["turn"]);
  const depth = numberOr(value["depth"]);
  const slotsUsed = numberOr(value["slotsUsed"]);
  const packSize = numberOr(value["packSize"]);
  const gone = numberOr(value["gone"]);
  if (turn === null || depth === null || slotsUsed === null || packSize === null || gone === null || gone < 1) return null;
  if (typeof value["command"] !== "string") return null;
  const left = rowOf(value["left"]);
  if (left === null) return null;
  const stayedRaw = value["stayed"];
  if (!Array.isArray(stayedRaw)) return null;
  const stayed: LedgerRow[] = [];
  for (const one of stayedRaw) {
    const row = rowOf(one);
    if (row === null) return null;
    stayed.push(row);
  }
  const saidRaw = value["said"];
  if (!Array.isArray(saidRaw) || saidRaw.some((line) => typeof line !== "string")) return null;
  return { turn, depth, way, command: value["command"], slotsUsed, packSize, left, gone, stayed, said: [...saidRaw] };
}
