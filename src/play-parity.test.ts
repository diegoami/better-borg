import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as Core from "@rpgm-tools/neo-angband-core";
import * as Controller from "./controller.js";
import { loadPack, observingLife, packRoot } from "./play-session.js";

const content = packRoot();
const suite = content === null ? describe.skip : describe;

suite("desktop/harness controller initialization (#54)", () => {
  it("does not expose API1 line-of-sight grids that the API2 known world cannot see", () => {
    const game = Core.startGame(loadPack(content!), { seed: 99110530, depth: 1 });
    const factory = vi.spyOn(Controller, "createBorg");
    const observation = observingLife(Core, game);
    const borg = factory.mock.results[0]!.value as Controller.Borg;
    const input = vi.spyOn(borg, "controller").mockImplementation((view) => {
      const known = Core.buildKnownWorld(game.state);
      const visible = new Set(known.level!.cells.filter((cell) => cell.visible).map((cell) => `${cell.x},${cell.y}`));
      const raw = Core.createAgentView(game.state);
      let checked = 0;
      for (let y = 0; y < game.state.chunk.height; y++) for (let x = 0; x < game.state.chunk.width; x++) {
        if (raw.cell(x, y)?.inView && !visible.has(`${x},${y}`)) {
          expect(view.cell(x, y)?.inView, `unseen grid ${x},${y}`).toBe(false);
          checked++;
        }
      }
      expect(checked).toBeGreaterThan(0);
      return null;
    });
    try { observation.arm(); Core.runGameLoop(game.state, game.registry); }
    finally { input.mockRestore(); factory.mockRestore(); observation.uninstall(); }
  });

  it("initializes the real town stores and the same world as the complete content pack", () => {
    const pack = loadPack(content!);
    const records = (name: string) => JSON.parse(readFileSync(join(content!, `${name}.json`), "utf8")).records;
    const desktopPack = { ...pack, store: records("store"), world: records("world"),
      chestTraps: records("chest_trap"), hints: records("hints"), uiKnowledge: records("ui_knowledge") };
    const harness = Core.startGame(pack, { seed: 4242, depth: 0 });
    const desktop = Core.startGame(desktopPack, { seed: 4242, depth: 0 });
    expect(harness.state.stores).toHaveLength(records("store").length);
    expect(Core.saveGame(harness)).toEqual(Core.saveGame(desktop));
  });

  it.each([1, 73])("starts the same private stream as the shipped plugin on world seed %i", (seed) => {
    const game = Core.startGame(loadPack(content!), { seed });
    // plugin.ts supplies resolvers/config, and uses createBorg's default stream.
    const desktop = Controller.createBorg();
    const factory = vi.spyOn(Controller, "createBorg");
    let observation: ReturnType<typeof observingLife> | undefined;
    try {
      observation = observingLife(Core, game);
      const harness = factory.mock.results[0]!.value as Controller.Borg;
      const draws = (borg: Controller.Borg): number[] =>
        Array.from({ length: 32 }, () => borg.rng.randint0(1_000_000));
      expect(draws(harness)).toEqual(draws(desktop));
    } finally {
      observation?.uninstall();
      factory.mockRestore();
    }
  });
});
