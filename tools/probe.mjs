/* Throwaway probe: what did the pack look like, decision by decision? */
import { build } from "esbuild";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = fileURLToPath(new URL("./", import.meta.url));
const REPO_ROOT = resolve(HERE, "..");
const bundle = join(REPO_ROOT, "artifacts", ".probe.mjs");
await build({
  stdin: {
    contents: `
import * as Core from "@rpgm-tools/neo-angband-core";
import { loadPack, packRoot } from "./src/play-session.js";
import { createBorg } from "./src/controller.js";
import { bindCore } from "./src/core-api.js";
import { makeCoreResolvers } from "./src/resolvers.js";
import { ContentIdResolver } from "@rpgm-tools/neo-angband-core";

bindCore(Core);
const seed = Number(process.argv[2] ?? 7);
const game = Core.startGame(loadPack(packRoot()), { seed, depth: 0 });
const state = game.state;
const resolver = new ContentIdResolver({
  objects: game.booted.registries.objects,
  playerRaces: game.players.races,
  playerClasses: game.players.classes,
});
const borg = createBorg({
  rngSeed: (seed * 2654435761) >>> 0 || 1,
  resolvers: makeCoreResolvers({
    races: game.booted.registries.monsters.races,
    objects: game.booted.registries.objects,
    state: state,
    blowMethods: game.booted.registries.monsters.blowMethods.values(),
  }),
});
let armed = false;
let n = 0;
const maxima = [];
Core.installController(state, (view, act) => {
  if (!armed) return null;
  armed = false;
  const cmd = borg.controller(view, act);
  n += 1;
  const rows = view.inventory().length;
  maxima.push(rows);
  const quiver = view.quiver().length;
  if (rows >= 10 || (cmd && (cmd.code === "drop" || cmd.code === "shop-sell"))) {
    const args = cmd && cmd.args ? " h=" + String(cmd.args.handle) : "";
    console.log("#" + String(n).padStart(5) + " rows=" + String(rows).padStart(2) + " quiver=" + String(quiver).padStart(2) + " " + (cmd ? cmd.code + args : "none"));
  }
  return cmd;
}, { viewDeps: { resolver, reg: game.booted.registries.objects } });

for (let i = 0; i < Number(process.argv[3] ?? 1200); i++) {
  armed = true;
  const status = Core.runGameLoop(state, game.registry);
  if (status === Core.LOOP_STATUS.DEAD) { console.log("DEAD at decision " + String(n)); break; }
  if (status === Core.LOOP_STATUS.DEATH_CONFIRM) { state.pendingDeath?.resolve(true); continue; }
  if (status === Core.LOOP_STATUS.LEVEL_CHANGE) {
    game.changeLevel(state.targetDepth ?? state.chunk.depth + 1);
    state.generateLevel = false;
  }
}
console.log("max pack rows seen: " + String(Math.max(...maxima)));
`,
    resolveDir: REPO_ROOT,
    loader: "js",
  },
  outfile: bundle,
  bundle: true,
  format: "esm",
  platform: "node",
  external: ["@rpgm-tools/*"],
  logLevel: "silent",
});
const run = await import(pathToFileURL(bundle).href);
void run;
