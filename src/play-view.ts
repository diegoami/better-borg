/** FORK: Mandos #54. The harness must decide from the same API2 knowledge as the shipped mod. */
import type * as Core from "@rpgm-tools/neo-angband-core";
import type { KnownWorldData, LoadoutSimulation } from "@rpgm-tools/neo-angband-mod-sdk";
import { itemView, playerView, simulationView } from "./api2/world.js";
import type { GradeFloors } from "./api2/records.js";

export function playGradeFloors(game: Core.StartedGame): GradeFloors {
  return new Map(game.players.timed.map((effect) => {
    let floor = 1;
    const grades = new Map<string, number>();
    for (const grade of effect.grades) {
      if (grade.name && !grades.has(grade.name)) grades.set(grade.name, floor);
      floor = grade.max + 1;
    }
    return [effect.name, grades];
  }));
}

export function playView(core: typeof Core, game: Core.StartedGame, raw: Core.AgentView,
  deps: Core.AgentViewDeps, floors: GradeFloors): Core.AgentView {
  // This is the same public known-world builder the real API2 host invokes.
  const known = core.buildKnownWorld(game.state, deps) as unknown as KnownWorldData;
  if (!known.player || !known.level) throw new Error("The play harness has no known player/level");
  const player = playerView(known.player, floors);
  const { width, height } = known.level;
  const cells = new Map(known.level.cells.map((cell) => [cell.y * width + cell.x, cell]));
  const names = new Map((known.monsters ?? []).map((monster) => [`${monster.grid.x},${monster.grid.y}`, monster]));
  const monsters = core.trueMonsterViews(game.state, deps).flatMap((monster) => {
    const named = names.get(`${monster.grid.x},${monster.grid.y}`);
    return named?.raceIndex === monster.raceIndex ? [{ ...monster, id: named.id }] : [];
  });
  const occupants = new Map(monsters.map((monster) => [monster.grid.y * width + monster.grid.x, monster.id]));
  return {
    ...raw,
    player: () => structuredClone(player),
    monsters: () => structuredClone(monsters),
    mapBounds: () => ({ width, height }),
    cell: (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return null;
      const monster = player.grid.x === x && player.grid.y === y ? -1 : (occupants.get(y * width + x) ?? 0);
      const remembered = cells.get(y * width + x);
      if (!remembered) return { x, y, feat: 0, passable: false, inView: false, known: false,
        monster, objectCount: 0, knownObjectCount: 0, glow: false, trap: false };
      const memory = remembered.remembered;
      return { x, y, feat: memory.feat, passable: memory.passable, inView: remembered.visible,
        known: true, monster, objectCount: memory.objects.length, knownObjectCount: memory.objects.length,
        glow: remembered.glow, trap: memory.traps.some((trap) => !trap.disabled
          && game.booted.registries.traps?.[trap.index]?.flags.has(core.TRF.TRAP)),
        ...(memory.featCode === undefined ? {} : { featCode: memory.featCode }) };
    },
    inventory: () => (known.inventory ?? []).map(itemView),
    equipment: () => (known.equipment ?? []).map((item) => item === null ? null : itemView(item)),
    quiver: () => (known.quiver ?? []).map(itemView),
    floorItems: (x, y) => (x === player.grid.x && y === player.grid.y
      ? (known.floorHere ?? []) : (cells.get(y * width + x)?.remembered.items ?? [])).map(itemView),
    target: () => known.target === null ? null : { midx: known.target.monster ?? 0, grid: { ...known.target.grid } },
    stores: () => (known.stores ?? []).map((store) => ({ ...structuredClone(store),
      stock: store.stock.map((item) => ({ ...itemView(item), index: item.index,
        ...(item.price === undefined ? {} : { price: item.price }) })) })),
    spellbooks: () => structuredClone(known.spellbooks ?? []) as unknown as Core.SpellbookView[],
    simulateLoadout: (change) => {
      const result = raw.simulateLoadout?.(change);
      return result ? simulationView(floors)(core.knownLoadoutSimulation(game.state, result) as unknown as LoadoutSimulation) : null;
    },
  };
}
