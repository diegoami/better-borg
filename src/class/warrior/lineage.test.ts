/**
 * TESTS FOR THE LINEAGE COUNTER: the birth draws' only seed (T09, #33; since
 * #16 the class and race pools' seed, src/birth/pools.ts). Moved here from
 * the warrior's settings.test.ts when the race settings gave way to the
 * pools: it survives a simulated reload, preserves the slot's sibling keys,
 * and never rejects. It is NOT a record - the journal says what lived and
 * died.
 */

import { describe, expect, it } from "vitest";
import type { Api2Slot, JsonValue } from "@rpgm-tools/neo-angband-mod-sdk";
import { LINEAGE_KEY, bumpLineage, lineageFrom, readLineage } from "./lineage.js";

/** An install slot that holds its value in memory, like presenter.test.ts's. */
function slot(initial: JsonValue | null = null): Api2Slot & { held(): JsonValue | null } {
  let value: JsonValue | null = initial;
  return {
    get: () => Promise.resolve({ ok: true as const, value }),
    set: (next) => {
      value = next;
      return Promise.resolve({ ok: true as const, value: null });
    },
    held: () => value,
  };
}

/** A slot whose get or set is refused, as broken storage answers. */
function refusingSlot(): Api2Slot {
  return {
    get: () => Promise.resolve({ ok: false as const, reason: "refused" as const, code: "refused", message: "storage is broken" }),
    set: () => Promise.resolve({ ok: false as const, reason: "refused" as const, code: "refused", message: "storage is broken" }),
  };
}

/** A slot whose calls reject, the other shape broken storage takes. */
function throwingSlot(): Api2Slot {
  return {
    get: () => Promise.reject(new Error("storage is broken")),
    set: () => Promise.reject(new Error("storage is broken")),
  };
}

describe("the lineage counter", () => {
  it("reads a fresh install as zero, and only trusts non-negative integers", () => {
    /* The counter is ours alone; a value that is not a non-negative integer
     * (garbage, a foreign writer's shape, a negative) reads as a fresh
     * lineage rather than poisoning the draw - deterministically. */
    expect(lineageFrom(null)).toBe(0);
    expect(lineageFrom({})).toBe(0);
    expect(lineageFrom({ profileIds: ["p1"] })).toBe(0);
    expect(lineageFrom({ [LINEAGE_KEY]: 7 })).toBe(7);
    expect(lineageFrom({ [LINEAGE_KEY]: 2.5 })).toBe(0);
    expect(lineageFrom({ [LINEAGE_KEY]: -3 })).toBe(0);
    expect(lineageFrom({ [LINEAGE_KEY]: "7" })).toBe(0);
    expect(lineageFrom([1, 2])).toBe(0);
  });

  it("survives a simulated reload: a bump lands and the next page's read sees it", async () => {
    /* THE SLOT ROUND-TRIP: the write the bump makes is the value a fresh
     * read (a new page, after the reload every armed birth follows) gets
     * back. Without this, every birth would seed from 0 and the whole line
     * would play one class and race. */
    const held = slot({ profileIds: ["p1"] });
    expect(await readLineage(held)).toBe(0);
    expect(await bumpLineage(held)).toBe(true);
    expect(await readLineage(held)).toBe(1); /* the simulated reload */
    expect(await bumpLineage(held)).toBe(true);
    expect(await readLineage(held)).toBe(2);
  });

  it("preserves the slot's sibling keys through every bump", async () => {
    /* The install slot is shared: the title row's profileIds, the
     * presenter's one-shot warriorBirth flag, and any later sibling. Every
     * bump is a read-modify-write that carries them forward - the same
     * discipline presenter.ts's consume and title.ts's installMemory keep
     * (#26). */
    const shared = slot({ profileIds: ["p1"], warriorBirth: true, newSibling: 42 });
    await bumpLineage(shared);
    expect(shared.held()).toEqual({ profileIds: ["p1"], warriorBirth: true, newSibling: 42, lineage: 1 });
    await bumpLineage(shared);
    expect(shared.held()).toEqual({ profileIds: ["p1"], warriorBirth: true, newSibling: 42, lineage: 2 });
  });

  it("never rejects: broken storage answers zero/false, not a throw", async () => {
    /* The wiring reads and bumps fire-and-forget from a synchronous getter;
     * a counter that could reject would be an unhandled rejection inside a
     * birth. A failed bump is benign and deterministic - the next draw
     * re-seeds from the counter that is still stored - so it is answered,
     * not raised. */
    await expect(readLineage(refusingSlot())).resolves.toBe(0);
    await expect(readLineage(throwingSlot())).resolves.toBe(0);
    await expect(bumpLineage(refusingSlot())).resolves.toBe(false);
    await expect(bumpLineage(throwingSlot())).resolves.toBe(false);
  });
});
