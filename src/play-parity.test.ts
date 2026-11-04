import { describe, expect, it, vi } from "vitest";
import * as Core from "@rpgm-tools/neo-angband-core";
import * as Controller from "./controller.js";
import { loadPack, observingLife, packRoot } from "./play-session.js";

const content = packRoot();
const suite = content === null ? describe.skip : describe;

suite("desktop/harness controller initialization (#54)", () => {
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
