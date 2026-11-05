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

// FORK: Mandos #126 verifies its existing #429 carry through the installed package.
// No updateView/noteSpots pass may hide a stale live setFeat hook.
describe("carried live terrain memory", () => {
  const fixture = () => {
    const root = packRoot();
    if (root === null) throw new Error("The engine carry test requires the content pack");
    const game = Core.startGame(loadPack(root), { seed: 1, depth: 1 });
    const grid = { x: game.state.actor.grid.x + 1, y: game.state.actor.grid.y };
    game.state.chunk.setFeat(grid, Core.FEAT.CLOSED);
    Core.squareMemorize(game.state, grid);
    return { game, grid };
  };

  it.each([Core.FEAT.OPEN, Core.FEAT.GRANITE])("immediately remembers a seen change to %i", (feat) => {
    const { game, grid } = fixture();
    game.state.chunk.sqinfoOn(grid, Core.SQUARE.SEEN);
    game.state.chunk.setFeat(grid, feat);
    expect(Core.knownFeat(game.state, grid)).toBe(feat);
  });

  it("remembers a change on the player's own unseen square", () => {
    const { game } = fixture();
    const grid = game.state.actor.grid;
    game.state.chunk.sqinfoOff(grid, Core.SQUARE.SEEN);
    game.state.chunk.setFeat(grid, Core.FEAT.OPEN);
    expect(Core.knownFeat(game.state, grid)).toBe(Core.FEAT.OPEN);
  });

  it.each([false, true])("does not reveal an unseen remote change (previously known: %s)", (known) => {
    const { game, grid } = fixture();
    if (!known) Core.squareForget(game.state, grid);
    const before = Core.knownFeat(game.state, grid);
    game.state.chunk.sqinfoOff(grid, Core.SQUARE.SEEN);
    game.state.chunk.setFeat(grid, Core.FEAT.GRANITE);
    expect(Core.knownFeat(game.state, grid)).toBe(before);
  });
});
