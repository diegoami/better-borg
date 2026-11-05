import { describe, expect, it } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import { loadPack, packRoot } from "./play-session.js";

// FORK: Mandos #100 verifies the accepted engine correction in the installed package.
describe("carried class-book spell lookup", () => {
  it("finds every class-wide spell, including the Rogue book after an unused slot", () => {
    const root = packRoot();
    if (root === null) throw new Error("The engine carry test requires the content pack");
    const players = Core.bindPlayer(loadPack(root).player);
    const rogue = players.classes.find((cls) => cls.name === "Rogue")!;
    const next = rogue.magic.books[1]!.spells[0]!;
    expect(Core.spellByIndex(rogue, next.sidx)?.name).toBe(next.name);
    for (const cls of players.classes) for (const book of cls.magic.books) {
      for (const spell of book.spells) expect(Core.spellByIndex(cls, spell.sidx)?.sidx).toBe(spell.sidx);
    }
  });
});
