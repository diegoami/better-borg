# Settings reference

Mandos (formerly better-borg). The Borg reads the toggles below when its controller is created; changing any
of them requires a reload before the controller uses the new value. The birth
pools are different: the `Class:` and `Race:` toggles are read once per page
(every armed birth follows the reload its writer issues, so each birth sees
the then-current toggles), so a change applies to the next rebirth without
waiting on anything else. The stage
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
| `borg.classWarrior` ... `borg.classBlackguard` | on | The class pool: one toggle per class the game defines (Warrior, Mage, Druid, Priest, Necromancer, Paladin, Rogue, Ranger, Blackguard). Each birth draws its class from the classes switched on. | Yes, birth side: read once per page. |
| `borg.raceHuman` ... `borg.raceKobold` | on | The race pool: one toggle per race (Human, Half-Elf, Elf, Hobbit, Gnome, Dwarf, Half-Orc, Half-Troll, Dunadan, High-Elf, Kobold). Each birth draws its race from the races switched on. | Yes, birth side: read once per page. |

## The birth pools: which classes and races the Borg plays

Each character the Borg births draws ONE class from the `Class:` toggles
switched on and ONE race from the `Race:` toggles switched on (#16; a fork
choice, upstream's Borg reincarnates at random). The draw is deterministic:
it is seeded by a persisted birth counter, and each birth bumps the counter,
so an unattended line varies its pair, the same counter always gives the
same pair, and there is no clock, no random number and no use of the Borg's
decision RNG. The counter is not a record of what was played; the
per-character journal is. All toggles start on.

- **Pin a lineage**, e.g. "always a High-Elf Warrior": switch on only
  `Class: Warrior` and only `Race: High-Elf`.
- **A range**, e.g. "any fighter, any sturdy race": switch on Warrior,
  Paladin and Blackguard, and Dwarf, Half-Troll and Dunadan.
- **All off** in a pool counts as all on, and the log says so.

A Warrior is born through the warrior pack's measured point-buy plan. Every
other class is born on the game's own suggested stats for that race and
class (the birth screen's starting spread, the C's `generate_stats`), until
a dedicated pack for it is measured. Caster classes play without learning
spells for now: the borg's spell-learning step is one of the C steps the
port never ported (#50).

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

## The death-replay trainer: playing a dead run's last turns

Since #29 the record of every dead harness run carries a post-mortem
dossier ladder (`docs/runs/<session>/postmortem/`, written by
`tools/replay.mjs`; the workflow is docs/postmortem.md) - and the owner can
play any rung's last turns themselves. Two settings arm it, both read once
per page so the release point is fixed for the life (rule 5):

1. `borg.replayReleaseTurn` = 0 (off): the turn the Borg stops and hands
   the keyboard back with the death banner. Take it from the dossier's
   rung line ("release boundary: turn N").
2. `borg.replayDeathTurn` = 0 (unnamed): the recorded death turn the banner
   counts down from ("recorded death: turn T").

The launch recipe (the dossier's provenance block names the exact birth):
open the lab build with `?seed=<S>&new`, pin the recorded character's class and
race (only its `Class:` and `Race:` toggles on), birth
from the title row, and the Borg replays the run deterministically to the
release turn - then the keyboard is yours, every command you issue is
logged (`[replay] ...`), and Ctrl-Z gives it back at any moment.

One caveat, stated: the lab build runs the lab branch's engine (the
noteSpot fix, upstream PR #429) while a harness record ran the published
engine - until a release carries the fix, a lab replay of a HARNESS death
can diverge from the record at the first door-close. The watched-lineage
deaths the mod itself records replay exactly once the upstream seed seam
lands (neo-angband#431): a mod cannot read the seed its game runs on.
