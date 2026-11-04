/**
 * THE WARRIOR'S RACE SHORTLIST (T07 bake-off, #33): the four races the
 * warrior plan was measured on.
 *
 * Until #16 this module held the warrior's race settings (`borg.raceRandom`,
 * a draw from this shortlist, and `borg.raceChoice`, a pin into it). Those
 * are gone: since #16 the player picks the races (and classes) the Borg may
 * draw from with one toggle each (src/birth/pools.ts), over the game's whole
 * roster. What stays is the shortlist itself, as measurement data: the
 * headless harness boots candidate 0 (Half-Troll) when a run names no race,
 * which keeps today's records comparable with the committed ones, and the
 * bake-off tooling sweeps the four.
 */

/** The bake-off shortlist, in its measured order: 0 Half-Troll, 1 Dunadan, 2 High-Elf, 3 Dwarf. */
export const WARRIOR_RACE_CANDIDATES = ["Half-Troll", "Dunadan", "High-Elf", "Dwarf"] as const;
