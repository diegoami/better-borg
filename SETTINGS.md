# Settings reference

Mandos (formerly better-borg). The Borg reads the toggles below when its controller is created; changing any
of them requires a reload before the controller uses the new value. The birth
settings are different: `borg.class` and `borg.raceRandom` are read once per
page (every armed birth follows the reload its writer issues, so each birth
sees the then-current value) and `borg.raceChoice` at each birth, so all
three apply to the next rebirth without waiting on anything else. The stage
settings (`borg.stageClvl`, `borg.stageDepth`) keep the same next-birth
lifetime: one stage per life, read once per page - a mid-run stage change
would be a mid-life policy shift, which determinism forbids (rule 5).

| Flag | Default | What it does | Reload required |
| --- | --- | --- | --- |
| `borg.playsRisky` | off | Lets the Borg dive sooner and accept more danger. | Yes, controller side. |
| `borg.worshipsDamage` | off | Gives weapon and bow damage more weight when choosing gear. | Yes, controller side. |
| `borg.worshipsSpeed` | off | Gives speed bonuses more weight when choosing gear. | Yes, controller side. |
| `borg.worshipsHp` | off | Gives Constitution and hit points more weight when choosing gear. | Yes, controller side. |
| `borg.worshipsMana` | off | Gives spell points more weight when choosing gear. | Yes, controller side. |
| `borg.worshipsAc` | off | Gives armour class more weight when choosing gear. | Yes, controller side. |
| `borg.worshipsGold` | off | Makes the Borg prioritize gold and delay some descents. | Yes, controller side. |
| `borg.selfScum` | on | Lets the Borg work in town toward a chosen purchase. | Yes, controller side. |
| `borg.munchkinStart` | off | Reduces early stockpile priorities for a faster cash focused start. | Yes, controller side. |
| `borg.raceRandom` | on | Every warrior draws its race uniformly from the bake-off shortlist (Half-Troll, Dunadan, High-Elf, Dwarf), seeded by a persisted birth counter: the same counter always draws the same race, each birth bumps the counter, so an unattended line varies its race deterministically - no clock, no random numbers, the Borg's decision RNG untouched. The counter is not a record of what was played; the per-character journal is. | Yes, birth side: read once per page. |
| `borg.raceChoice` | 2 | The race the Borg's planned warrior is born as when `borg.raceRandom` is off: 0 Half-Troll, 1 Dunadan, 2 High-Elf, 3 Dwarf - the bake-off shortlist, in this order everywhere; the default (2, High-Elf) is the bake-off's recommendation. Falls back to Half-Troll on a pack that lacks the named race. | No: read at each birth. |
| `borg.class` | 0 | The class pack the Borg's planned character is born from: 0 Warrior - the default, and the only pack installed in this release; the archived neowarrior-borg fork's lineage, continued here. The value is a persisted parameter the mod reads at each page (a change applies to the next rebirth); the Mods-screen ROW for it appears together with the second pack, because the host's setting rows need a range wider than one value - until then a stored value is honored by the wiring, with out-of-range values resolving to the default. | Yes, birth side: read once per page. |

## The pinned lineage

"Always reborn as a warrior High-Elf" - one specific class and race, every
rebirth, the whole unattended line - is three settings:

1. `borg.class` = 0 (Warrior, the only pack),
2. `borg.raceRandom` = off (the draw off: the pin below decides),
3. `borg.raceChoice` = 2 (High-Elf, the bake-off's recommendation).

Every pack exposes the same two race parameters with the warrior pack's
semantics (`raceChoice` indexes the ACTIVE pack's candidate list;
`raceRandom` toggles its draw), so the same recipe pins any future lineage:
set the class, turn the draw off, set the race index. With the draw ON the
line varies its race over the pack's shortlist deterministically instead -
the owner's default for an unattended line.

## The stage: what the grind keeps a save at

Since the purpose redirect (#25), the mod's main job is the grind: it plays
unattended, and when a run reaches its target stage it KEEPS A SAVE of that
run (renamed into the library - the picker's `M ...` names, beside the
ordinary ones) and starts the next character. Two numeric settings define
the stage, both read once per page so a change applies to the NEXT birth:

1. `borg.stageClvl` = 2 (the character level a run must reach),
2. `borg.stageDepth` = 1 (the depth a run must have arrived on; 0 is town).

The defaults are CALIBRATED, not guessed: the stage baseline
(`docs/runs/2026-11-03-stage-baseline/`) measured today's Borg on the
standard seed grid and found the frontier at character level 2, depth 1 -
attained by half the grid, one rung deeper by none. That is the strongest
rung today's strength can grind at, and it ships as the default so the
number has somewhere to climb from. The owner's destination - roughly
character level 20 at moderate depth, reachable in a watched evening - is
where the strength work (the swap subsystem, the upstream door-close PR)
is headed; move the two settings as it lands. The ladder (#26) climbs the
same settings: stage N+1's lineage resumes from stage N's kept saves.

A retired save's name is short because the host caps save names at 15
characters: `M s20 c2d1` from the harness (the seed is the name's identity
- the ladder maps its per-seed cohorts by it) or `M n17 c2d1` in the mod
(the lineage counter - a mod cannot know the game seed). The date a slot
was kept is the roster's own last-played column.
