/**
 * The inventory ledger's core (#28): the discard-moment definition, asserted.
 *
 * The ledger is the evidence base for the reviewer (tools/inventory-review/):
 * what the Borg KEPT and what it let go, at the moments the pack was too full
 * to keep everything. Everything the reviewer shows is frozen here, so the
 * definition itself is the contract: the capacity-pressure threshold, the
 * drop/sell/stash family, the handle-attributed departure, and the pack that
 * stayed. The tests are written against the mod's real seams (rows frozen from
 * a view, commands as the census sees them) so a wiring change cannot quietly
 * redefine a moment.
 */

import { describe, expect, it } from "vitest";
import { TV } from "./core-api.js";
import {
  MAX_MOMENTS_KEPT,
  PACK_SIZE,
  PRESSURE_FREE_SLOTS,
  discardWayOf,
  inventoryLedger,
  kindLabel,
  readDiscardMoment,
  underPressure,
  type LedgerCommand,
  type LedgerRow,
} from "./inventory.js";

/** A pack row, as any side freezes it from its own view. */
function row(over: Partial<LedgerRow> & Pick<LedgerRow, "handle">): LedgerRow {
  return {
    desc: "a Ration of Food",
    kind: "food",
    tval: TV.FOOD,
    sval: 5,
    number: 1,
    value: 3,
    ...over,
  };
}

/** N filler rows, so pressure is a one-word read in each case. */
function pack(n: number): LedgerRow[] {
  return Array.from({ length: n }, (_, i) => row({ handle: 100 + i, desc: `filler ${String(i)}` }));
}

const STAMP = { turn: 5130, depth: 1 };
const NEXT: LedgerCommand = { code: "walk", handle: null, shop: null };

/** The commands the census would have counted, handle and all. */
const DROP: LedgerCommand = { code: "drop", handle: 7, shop: null };
const SELL: LedgerCommand = { code: "shop-sell", handle: 9, shop: 2 };
const STASH: LedgerCommand = { code: "shop-sell", handle: 9, shop: 7 };

describe("the capacity-pressure threshold", () => {
  it("is the game's own pack size with at most two free slots", () => {
    expect(PACK_SIZE).toBe(23);
    expect(PRESSURE_FREE_SLOTS).toBe(2);
    expect(underPressure(PACK_SIZE)).toBe(true);
    expect(underPressure(PACK_SIZE - PRESSURE_FREE_SLOTS)).toBe(true);
    expect(underPressure(PACK_SIZE - PRESSURE_FREE_SLOTS - 1)).toBe(false);
  });
});

describe("the discard family (one decision family, three ways out)", () => {
  it("classifies drop and destroy as drops", () => {
    expect(discardWayOf(DROP)).toBe("drop");
    expect(discardWayOf({ code: "destroy", handle: 7, shop: null })).toBe("drop");
  });

  it("splits the sell command by shop: a store buys, the home keeps", () => {
    expect(discardWayOf(SELL)).toBe("sell");
    expect(discardWayOf(STASH)).toBe("stash");
    expect(discardWayOf({ code: "shop-sell", handle: 7, shop: null })).toBe("sell");
  });

  it("refuses everything that is not a discard, however much leaves", () => {
    for (const code of ["walk", "wear", "quaff", "fire", "eat", "rest", "shop-buy"]) {
      expect(discardWayOf({ code, handle: 7, shop: null })).toBeNull();
    }
  });
});

describe("the kind label", () => {
  it("names a tval by the engine's own constant table", () => {
    expect(kindLabel(TV.FOOD)).toBe("food");
    expect(kindLabel(TV.POTION)).toBe("potion");
    expect(kindLabel(TV.NULL)).toBe("null");
  });
});

describe("one observed decision", () => {
  it("records a drop under pressure: the item that left, the pack that stayed", () => {
    const ledger = inventoryLedger();
    const torch = row({ handle: 7, desc: "a Wooden Torch (with 1500 turns of light)", kind: "light", tval: TV.LIGHT, number: 1 });
    /* The decision: 23 rows, one of them the torch, and the command drops it.
     * The first observation only seeds. */
    expect(ledger.observe([...pack(22), torch], DROP, { turn: 5140, depth: 1 }, [])).toBeNull();
    /* The next observation sees the torch gone; the window's message line
     * arrives with it, because that is when the window closed. */
    const moment = ledger.observe(pack(22), NEXT, { turn: 5142, depth: 1 }, ["You drop a Wooden Torch (t)."]);
    expect(moment).not.toBeNull();
    expect(moment!.way).toBe("drop");
    expect(moment!.command).toBe("drop");
    /* The moment is stamped at the DECISION (the observation before the item
     * left), not at the observation that noticed the departure. */
    expect(moment!.turn).toBe(5140);
    expect(moment!.depth).toBe(1);
    expect(moment!.slotsUsed).toBe(23);
    expect(moment!.packSize).toBe(PACK_SIZE);
    expect(moment!.left).toEqual(torch);
    expect(moment!.gone).toBe(1);
    expect(moment!.stayed).toHaveLength(22);
    expect(moment!.said).toEqual(["You drop a Wooden Torch (t)."]);
    expect(ledger.total).toBe(1);
    expect(ledger.moments).toHaveLength(1);
  });

  it("records a sell and a stash with the same shape", () => {
    const ledger = inventoryLedger();
    const dagger = row({ handle: 9, desc: "a Dagger (1d4)", kind: "sword", tval: TV.SWORD, value: 12 });
    ledger.observe([...pack(21), dagger], SELL, STAMP, []);
    const sold = ledger.observe(pack(21), NEXT, STAMP, ["You sold a Dagger for 12 gold."]);
    expect(sold!.way).toBe("sell");
    expect(sold!.left).toEqual(dagger);
    expect(sold!.said).toEqual(["You sold a Dagger for 12 gold."]);

    ledger.observe([...pack(22), dagger], STASH, STAMP, []);
    const stashed = ledger.observe(pack(22), NEXT, STAMP, ["You have a Dagger (s)."]);
    expect(stashed!.way).toBe("stash");
    expect(stashed!.left).toEqual(dagger);
    expect(ledger.total).toBe(2);
  });

  it("counts a partial departure: gone is the count, stayed keeps the remainder", () => {
    const ledger = inventoryLedger();
    const arrows = row({ handle: 3, desc: "34 Arrows", kind: "arrow", tval: TV.ARROW, number: 34 });
    ledger.observe([...pack(21), arrows], { code: "shop-sell", handle: 3, shop: 4 }, STAMP, []);
    const rest = row({ handle: 3, desc: "14 Arrows", number: 14 });
    const moment = ledger.observe([...pack(21), rest], NEXT, STAMP, ["You sold 20 Arrows for 5 gold."]);
    expect(moment!.gone).toBe(20);
    expect(moment!.left).toEqual(arrows);
    expect(moment!.stayed.find((item) => item.handle === 3)).toEqual(rest);
  });

  it("does NOT fire one slot short of pressure: the boundary is honest", () => {
    const ledger = inventoryLedger();
    /* 20 rows of 23 - three free slots: below the band, however junky the item. */
    ledger.observe([...pack(19), row({ handle: 7 })], DROP, STAMP, []);
    const moment = ledger.observe(pack(19), NEXT, STAMP, []);
    expect(moment).toBeNull();
    expect(ledger.total).toBe(0);
  });

  it("does not fire when the named item stayed: a refused command discarded nothing", () => {
    const ledger = inventoryLedger();
    const torch = row({ handle: 7, number: 1 });
    ledger.observe([...pack(22), torch], DROP, STAMP, ["The command was refused."]);
    const moment = ledger.observe([...pack(22), torch], NEXT, STAMP, []);
    expect(moment).toBeNull();
    expect(ledger.total).toBe(0);
  });

  it("attributes only the handle the command named: other departures are noise", () => {
    const ledger = inventoryLedger();
    const stolen = row({ handle: 42, desc: "a Steel Helm", number: 1 });
    const dropped = row({ handle: 7, desc: "a Wooden Torch", number: 1 });
    ledger.observe([...pack(21), stolen, dropped], DROP, STAMP, []);
    /* The helm left too (a thief), but the command named the torch - and the
     * torch stayed, so the drop was refused and nothing is journaled. */
    const moment = ledger.observe([...pack(21), dropped], NEXT, STAMP, ["A novice rogue nabbed your Steel Helm."]);
    expect(moment).toBeNull();
  });

  it("does not fire across a non-discard command, however full the pack was", () => {
    const ledger = inventoryLedger();
    ledger.observe(pack(23), { code: "fire", handle: 3, shop: null }, STAMP, []);
    const moment = ledger.observe(pack(22), NEXT, STAMP, []);
    expect(moment).toBeNull();
  });

  it("keeps a bounded tail beside the raw total", () => {
    const ledger = inventoryLedger();
    const torch = row({ handle: 7, number: 1 });
    for (let n = 0; n < MAX_MOMENTS_KEPT + 5; n++) {
      ledger.observe([...pack(22), torch], DROP, { ...STAMP, turn: STAMP.turn + n }, []);
      ledger.observe(pack(22), NEXT, STAMP, []);
    }
    expect(ledger.total).toBe(MAX_MOMENTS_KEPT + 5);
    expect(ledger.moments).toHaveLength(MAX_MOMENTS_KEPT);
    /* Newest last, like the uncertainty journal's tail. */
    expect(ledger.moments[ledger.moments.length - 1]!.turn).toBe(STAMP.turn + MAX_MOMENTS_KEPT + 4);
  });

  it("caps the message window at the newest lines", () => {
    const ledger = inventoryLedger();
    const torch = row({ handle: 7, number: 1 });
    const noise = Array.from({ length: 20 }, (_, i) => `line ${String(i)}`);
    ledger.observe([...pack(22), torch], DROP, STAMP, []);
    const moment = ledger.observe(pack(22), NEXT, STAMP, noise);
    expect(moment!.said).toEqual(noise.slice(-8));
  });
});

describe("the defensive read (the journal's side)", () => {
  const moment = {
    turn: 5140,
    depth: 1,
    way: "drop",
    command: "drop",
    slotsUsed: 23,
    packSize: 23,
    left: { handle: 7, desc: "a Wooden Torch", kind: "light", tval: TV.LIGHT, sval: 1, number: 1, value: 3 },
    gone: 1,
    stayed: [{ handle: 8, desc: "a Ration of Food", kind: "food", tval: TV.FOOD, sval: 5, number: 1, value: 3 }],
    said: ["You drop a Wooden Torch (t)."],
  };

  it("round-trips a moment this module wrote", () => {
    expect(readDiscardMoment(JSON.parse(JSON.stringify(moment)))).toEqual(moment);
  });

  it("round-trips a real ledger's moments through JSON", () => {
    const ledger = inventoryLedger();
    ledger.observe([...pack(22), row({ handle: 7 })], DROP, STAMP, []);
    ledger.observe(pack(22), NEXT, STAMP, ["You drop a Ration of Food."]);
    expect(ledger.moments.map((one) => readDiscardMoment(JSON.parse(JSON.stringify(one))))).toEqual(ledger.moments);
  });

  it("drops a value this module did not write", () => {
    expect(readDiscardMoment(null)).toBeNull();
    expect(readDiscardMoment(42)).toBeNull();
    expect(readDiscardMoment("drop")).toBeNull();
    expect(readDiscardMoment({ ...moment, way: "lost" })).toBeNull();
    expect(readDiscardMoment({ ...moment, turn: "soon" })).toBeNull();
    expect(readDiscardMoment({ ...moment, left: { handle: 7 } })).toBeNull();
    expect(readDiscardMoment({ ...moment, stayed: "empty" })).toBeNull();
    expect(readDiscardMoment({ ...moment, said: [7] })).toBeNull();
    expect(readDiscardMoment({ ...moment, gone: -1 })).toBeNull();
  });
});
