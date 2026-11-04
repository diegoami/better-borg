/**
 * THE PACK REGISTRY: which class packs exist (M2 unification, #15), and the
 * pack a drawn class is born and measured through (#16, #17).
 *
 * "A new class starts as a pack plus a setting, never a fork" (docs/
 * process.md section 2). Since #16 the setting half is the birth pools
 * (src/birth/pools.ts): one toggle per class, so no class index lives here
 * any more. PACKS holds the DEDICATED packs, the ones with a measured plan of
 * their own (the warrior, so far). Every other class is the generic pack's
 * (./generic.ts): the game's own suggested stats.
 */

import type { StrategyPack } from "./pack.js";
import { warriorPack } from "./warrior/index.js";
import { genericPackFor } from "./generic.js";

/** The dedicated packs. */
export const PACKS: readonly StrategyPack[] = [warriorPack];

/**
 * The pack a class is born through: its dedicated pack, or the generic pack
 * for that class. FORK (Mandos #17): the generic fallback.
 */
export function packForClass(className: string): StrategyPack {
  return PACKS.find((pack) => pack.className === className) ?? genericPackFor(className);
}
