/**
 * THE BIRTH POOLS: which class and race the Borg's next character is (#16,
 * #17; owner, 2026-11-04).
 *
 * FORK (Mandos #16), a CHOICE with no C counterpart. Upstream's borg
 * reincarnates with a random race and class; this fork plans its births, and
 * the player decides which classes and races it may draw from. Fork-only by
 * the owner's decision: "a feature of our borg, never requested upstream".
 *
 * TWENTY TOGGLES, ONE PER CLASS AND ONE PER RACE. The host's Mods screen
 * offers on/off rules and numbers, with no submenus and no multi-select
 * (neo-angband packages/web/src/mod-manager/classic-options.ts), so a pool is
 * a flat set of rules, `Class: Warrior` ... `Race: Kobold`, all on by
 * default. Each birth draws one class from the classes switched on and one
 * race from the races switched on. Switching on exactly one pins it, and an
 * empty pool falls back to the whole roster and says so in the log (a
 * birth never fails on a pool).
 *
 * THE DRAW is deterministic (rule 5): no clock, no game RNG, and the
 * Borg's decision RNG untouched. Both draws seed from the install slot's
 * persisted lineage counter (src/class/warrior/lineage.ts), which the
 * caller bumps once per drawn birth: the class from the even point of the
 * counter's hash walk, the race from the odd one, so the two vary
 * independently while one counter carries both. Same counter, same pair.
 *
 * THE ROSTERS are the game's own (the content pack's class.json and
 * p_race.json, in their record order), mirrored here because the manifest
 * must name every toggle statically. The caller checks them against the
 * live game's records when it can: a name the game does not define is
 * dropped from the pool with a log line rather than declined at birth.
 *
 * GAME-FREE: no engine import; the game's names arrive as plain lists.
 */

import type { PackRule } from "@rpgm-tools/neo-angband-mod-sdk";

/** The game's classes, class.json's record order. */
export const CLASS_ROSTER = [
  "Warrior",
  "Mage",
  "Druid",
  "Priest",
  "Necromancer",
  "Paladin",
  "Rogue",
  "Ranger",
  "Blackguard",
] as const;

/** The game's races, p_race.json's record order. */
export const RACE_ROSTER = [
  "Human",
  "Half-Elf",
  "Elf",
  "Hobbit",
  "Gnome",
  "Dwarf",
  "Half-Orc",
  "Half-Troll",
  "Dunadan",
  "High-Elf",
  "Kobold",
] as const;

/** A roster name as a flag suffix: "Half-Elf" -> "HalfElf". */
function flagSuffix(name: string): string {
  return name.replace(/[^A-Za-z0-9]/gu, "");
}

/** The class toggle's flag, e.g. `borg.classMage`. */
export function classFlag(name: string): string {
  return `borg.class${flagSuffix(name)}`;
}

/** The race toggle's flag, e.g. `borg.raceHalfElf`. */
export function raceFlag(name: string): string {
  return `borg.race${flagSuffix(name)}`;
}

/** The class toggles, in roster order, as the manifest declares them. */
export const CLASS_RULES: readonly PackRule[] = CLASS_ROSTER.map((name) => ({
  flag: classFlag(name),
  title: `Class: ${name}`,
  description: `The Borg may birth a ${name}. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on.`,
  default: true,
  requiresReload: true,
}));

/** The race toggles, in roster order, as the manifest declares them. */
export const RACE_RULES: readonly PackRule[] = RACE_ROSTER.map((name) => ({
  flag: raceFlag(name),
  title: `Race: ${name}`,
  description: `The Borg may birth a ${name}. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on.`,
  default: true,
  requiresReload: true,
}));

/**
 * THE ONE-DRAW HASH: murmur3's 32-bit finalizer, the top bits scaled to the
 * pool (the T09 race draw's own hash, src/class/warrior/settings.ts, moved
 * here unchanged). A pure function of its input; sequential inputs spread
 * across the word, so a plain `counter mod n` cycle is avoided.
 */
export function drawIndex(seed: number, size: number): number {
  let h = seed >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return Math.floor(((h >>> 0) / 0x100000000) * size);
}

/** What one birth needs to decide its pair. */
export interface BirthPoolInput {
  /** The resolved rule flags (`mod.meta.flags`); a missing flag reads as its default, on. */
  readonly flags: Readonly<Record<string, boolean | undefined>>;
  /** The install slot's lineage counter as this page read it: the draws' only seed. */
  readonly lineage: number;
  /** The live game's class names, when the caller could read them; null means unknown. */
  readonly gameClasses: readonly string[] | null;
  /** The live game's race names, when the caller could read them; null means unknown. */
  readonly gameRaces: readonly string[] | null;
}

/** What one birth decided. */
export interface BirthPair {
  readonly className: string;
  readonly raceName: string;
  /** The pools the draws were taken from, after the game check and the empty fallback. */
  readonly classPool: readonly string[];
  readonly racePool: readonly string[];
}

/** "class" -> "classes", "race" -> "races". */
function plural(kind: string): string {
  return kind.endsWith("s") ? `${kind}es` : `${kind}s`;
}

/** One pool: the switched-on names the game defines, or the whole roster if none. */
function pool(
  kind: "class" | "race",
  roster: readonly string[],
  flagOf: (name: string) => string,
  input: BirthPoolInput,
  game: readonly string[] | null,
  log: (message: string) => void,
): readonly string[] {
  const known = game !== null && game.length > 0 ? roster.filter((name) => game.includes(name)) : [...roster];
  const unknown = roster.filter((name) => !known.includes(name));
  if (unknown.length > 0) {
    log(`the game does not define the ${unknown.length > 1 ? plural(kind) : kind} ${unknown.join(", ")}, so the Borg leaves ${unknown.length > 1 ? "them" : "it"} out of its draw`);
  }
  const on = known.filter((name) => input.flags[flagOf(name)] ?? true);
  if (on.length > 0) return on;
  log(`every ${kind} toggle is off, so the Borg draws from every ${kind} instead`);
  return known.length > 0 ? known : [...roster];
}

/**
 * Decide the next birth's class and race, and log the decision once. The
 * caller bumps the lineage counter after a birth that used this.
 */
export function resolveBirthPair(input: BirthPoolInput, log: (message: string) => void): BirthPair {
  const classPool = pool("class", CLASS_ROSTER, classFlag, input, input.gameClasses, log);
  const racePool = pool("race", RACE_ROSTER, raceFlag, input, input.gameRaces, log);
  const seed = (input.lineage >>> 0) * 2;
  const className = classPool[drawIndex(seed, classPool.length)]!;
  const raceName = racePool[drawIndex(seed + 1, racePool.length)]!;
  const which = (chosen: readonly string[], kind: string): string =>
    chosen.length === 1 ? `the only ${kind} switched on` : `drawn from ${String(chosen.length)} ${plural(kind)}`;
  log(
    `the Borg's next character will be a ${raceName} ${className} ` +
      `(class ${which(classPool, "class")}, race ${which(racePool, "race")}, lineage ${String(input.lineage)})`,
  );
  return { className, raceName, classPool, racePool };
}
