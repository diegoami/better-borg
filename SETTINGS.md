# Mandos settings

**Current scope:** [Mandos is a bug-fix consumer](docs/MANDOS-SCOPE.md).
Existing controls remain for compatibility. Strategy/cohort/stage research and
advanced replay are PARKED optional work, not ordinary-play or engine-upgrade
gates. Runtime180 defines the delivered profile; prefer stock published beta.3,
with an engine carry only if a real required gameplay defect proves it necessary.
PR433 is not a default dependency or a promise of live seed/birth metadata.
The retained optional suite is `pnpm test:optional-replay`; historical replay
needs its original executable/content/configuration and accepted start inputs.

The `borg.*` identifiers are stable saved setting names, including Mandos's
own birth-pool, stage and replay settings.
Mandos reads the behavior toggles when its controller is created; changing
them requires a reload before the controller uses the new value. The birth
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
so an unattended line varies its pair and the same counter gives the same
pair. The draw uses neither a wall clock nor the controller's decision RNG. The counter is not a record of what was played; the
per-character journal is. All toggles start on.

- **Pin a lineage**, e.g. "always a High-Elf Warrior": switch on only
  `Class: Warrior` and only `Race: High-Elf`.
- **A range**, e.g. "any fighter, any sturdy race": switch on Warrior,
  Paladin and Blackguard, and Dwarf, Half-Troll and Dunadan.
- **All off** in a pool counts as all on, and the log says so.

A Warrior is born through the warrior pack's measured point-buy plan. Every
other class is born on the game's own suggested stats for that race and
class (the birth screen's starting spread, the C's `generate_stats`), until
a dedicated pack for it is measured. Spell study and testing are restored
from the C Borg (#50 / PR #63); eligible spells also participate in the
combat chooser (#69). A generic birth plan does not prevent a caster from
learning or fighting with its spells.

## Optional retained stage retirement (off by default)

`mandos.stageRetirement` is **false by default** and requires a reload when
changed. Only an explicit opt-in enables the existing stage save/rename/restart
mechanism. The two retained threshold settings below do not end a default life
merely because c2d1 is reached. They apply on the next birth when retirement is
enabled; the owner scope change does not erase the old code or kept saves.

The optional mechanism keeps a save and starts another character after both
thresholds are reached:

1. `borg.stageClvl` = 2 (the character level a run must reach),
2. `borg.stageDepth` = 1 (the depth a run must have arrived on; 0 is town).

The default was selected using the [c2d1 calibration baseline](docs/runs/2026-11-03-stage-baseline-c2d1/README.md).
It is an early measurement target, not a claim about the strongest stage
Mandos can reach. Later fixes change the reach-rate; the
[run records](docs/runs/README.md) name the build, cohort and result.
The former level20/moderate-depth research goal and stronger-stage campaign
are parked. This historical calibration is not a current Mandos task or upgrade gate.

A successful save and rename keep a library entry before the next birth.
If either is refused, Mandos logs the reason and keeps playing; it does
not abandon a living character without keeping the save. The
[stage-ladder work](https://github.com/diegoami/mandos/issues/26) covers
using those kept characters as the inputs to later stages.

A retired save's name is short because the host caps save names at 15
characters: `M s20 c2d1` from the harness (the seed is the name's identity
- the ladder maps its per-seed cohorts by it) or `M n17 c2d1` in the mod
(the lineage counter used by the mod's naming scheme). Historical enhanced builds could also record a seed through PR433. The
default does not promise that metadata; naming stays based on the lineage counter. The date a slot was kept is
the roster's own last-played column.

## Optional preserved replay handoff (advanced work parked)

The [post-mortem workflow](docs/postmortem.md) can generate a dossier ladder
for a dead harness run with `tools/replay.mjs`. It needs the record's Borg
code, engine/content pin and planned birth. The replay verifies cause,
turn, decision count and command census; a mismatch is reported as
DIVERGED. A rung crossed entirely by the killing decision has no live
release boundary.

Two settings arm the optional human handoff, both read once per page so
the release point is fixed for the life:

1. `borg.replayReleaseTurn` = 0 (off): the turn the Borg stops and hands
   the keyboard back with the death banner. Take it from the dossier's
   rung line ("release boundary: turn N").
2. `borg.replayDeathTurn` = 0 (unnamed): the recorded death turn the banner
   counts down from ("recorded death: turn T").

For a matching replay, the dossier's provenance block names the birth and
its release boundary. The lab launch route is `?seed=<S>&new`, with only
the recorded class and race enabled, followed by **New Mandos character**.
At the release turn, Mandos hands back the keyboard and shows the death
banner; subsequent human commands are logged, and Ctrl-Z can hand control
back.

**A seed alone is insufficient proof of a matching lab replay.**
[#54](https://github.com/diegoami/mandos/issues/54) now reproduces one actual
desktop death, including all 113 commands and observed death facts; see the
[case evidence](docs/runs/2026-11-04-b54-desktop-death-replay/README.md).
It requires matching code/content and accepted-birth RNG/options/controller
context, not just a seed. This does not prove every desktop replay.
The harness and lab use the beta.2 engine base with carried fixes; their
birth and seed paths must also agree. Verify the replay before treating a
dossier boundary as the same game state. The graveyard retains selected
run facts and journal data, not a full save of the fatal dungeon.
