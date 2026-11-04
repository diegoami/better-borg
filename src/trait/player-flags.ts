/**
 * player_has(player, PF_*): the class's player flags, as the view reports
 * them (`PlayerView.classFlags`, PF_* codes without the prefix, in the
 * engine since 1.3.0).
 *
 * FORK (Mandos #55), a DEFECT fix toward the C: the port left out the
 * PF_COMBAT_REGEN gates because "the frozen view does not carry" the flags
 * (inherited, flow-misc.ts at 70145c5). It has carried them since 1.3.0.
 */

import type { BorgContext } from "../context.js";

/** Whether the character's class has the player flag `code` (e.g. "COMBAT_REGEN"). */
export function playerHas(ctx: BorgContext, code: string): boolean {
  const flags = (ctx.view.player() as { readonly classFlags?: readonly string[] }).classFlags;
  return Array.isArray(flags) && flags.includes(code);
}
