# Borg: quick reference

Angband's automatic player, ported from the borg in Angband 4.2.6. It plays the way you do, through the same commands, over mod API 2, with no privileged code inside the engine.

This page is the short version: every setting, what the mod asks the game for,
and where the longer material is. The account of why each of these exists is in
[the repository README](../README.md).

## Settings

Each one is a named toggle on the game's own Mods screen, which shows the full
description. The identifier is the name a save and another mod see; where a
switch has no flag of its own, the game knows it by its section id instead.

| Setting | Identifier | Default | What it does |
| --- | --- | --- | --- |
| Play risky | `borg.playsRisky` | off | borg_plays_risky. Skip the early hit-point and character-level gates that hold the Borg above a depth, wait longer before drinking a cure, and back away later in a losing fight. |
| Value melee and missile damage | `borg.worshipsDamage` | off | borg_worships_damage. Add weight to weapon and bow damage when the Borg scores a set of gear, so a trade that costs armour for damage looks better than it otherwise would. |
| Value speed | `borg.worshipsSpeed` | off | borg_worships_speed. Add weight to a speed bonus when scoring gear. |
| Value hit points | `borg.worshipsHp` | off | borg_worships_hp. Add weight to constitution and hit points when scoring gear. |
| Value spell points | `borg.worshipsMana` | off | borg_worships_mana. Add weight to spell points when scoring gear. |
| Value armour class | `borg.worshipsAc` | off | borg_worships_ac. Add weight to armour class when scoring gear. |
| Value gold | `borg.worshipsGold` | off | borg_worships_gold. Sell harder, walk down rather than pay for a recall, and put off the first deep recall. |
| Save up for something it wants | `borg.selfScum` | on | borg_self_scum. Let the Borg set itself a gold target and work in town until it can afford one item it has decided it needs. |
| Skimp on stockpiles for an early munchkin run | `borg.munchkinStart` | off | borg_munchkin_start. Below character level borg_munchkin_level (12), stop valuing potions of resist poison and speed, phase door, word of recall and the deeper cure stockpiles as highly as it normally would, on the assumption that a young character is cashing out rather than settling in. |
| Class: Warrior | `borg.classWarrior` | on | The Borg may birth a Warrior. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Mage | `borg.classMage` | on | The Borg may birth a Mage. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Druid | `borg.classDruid` | on | The Borg may birth a Druid. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Priest | `borg.classPriest` | on | The Borg may birth a Priest. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Necromancer | `borg.classNecromancer` | on | The Borg may birth a Necromancer. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Paladin | `borg.classPaladin` | on | The Borg may birth a Paladin. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Rogue | `borg.classRogue` | on | The Borg may birth a Rogue. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Ranger | `borg.classRanger` | on | The Borg may birth a Ranger. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Class: Blackguard | `borg.classBlackguard` | on | The Borg may birth a Blackguard. Each birth draws its class from the classes switched on; switch on just one to always play it. All off counts as all on. |
| Race: Human | `borg.raceHuman` | on | The Borg may birth a Human. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Half-Elf | `borg.raceHalfElf` | on | The Borg may birth a Half-Elf. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Elf | `borg.raceElf` | on | The Borg may birth a Elf. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Hobbit | `borg.raceHobbit` | on | The Borg may birth a Hobbit. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Gnome | `borg.raceGnome` | on | The Borg may birth a Gnome. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Dwarf | `borg.raceDwarf` | on | The Borg may birth a Dwarf. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Half-Orc | `borg.raceHalfOrc` | on | The Borg may birth a Half-Orc. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Half-Troll | `borg.raceHalfTroll` | on | The Borg may birth a Half-Troll. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Dunadan | `borg.raceDunadan` | on | The Borg may birth a Dunadan. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: High-Elf | `borg.raceHighElf` | on | The Borg may birth a High-Elf. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |
| Race: Kobold | `borg.raceKobold` | on | The Borg may birth a Kobold. Each birth draws its race from the races switched on; switch on just one to always play it. All off counts as all on. |

The `Class:` and `Race:` toggles are the birth pools (#16): each character
the Borg births draws its class from the classes switched on and its race
from the races switched on, deterministically from a persisted birth counter.
Switch on just one to always play it; all off counts as all on. A Warrior is
born through the warrior pack's measured plan, any other class on the game's
own suggested stats. See [SETTINGS.md](../SETTINGS.md) for recipes.

The Mods screen also carries the mod's numeric settings, each one number a
player can move. The Borg reads them when they matter, not at load time.

| Setting | Identifier | Default | Range | What it does |
| --- | --- | --- | --- | --- |
| Stage character level | `borg.stageClvl` | 2 | 0-50 | The character level a run must reach for the Borg to count it as having attained its target stage, together with `borg.stageDepth`. A run that attains is saved under a library name and the next character starts. The default is the stage baseline's calibration (2026-11-03); raise it as the Borg grows stronger. Read once per page, so a change applies to the next birth. |
| Stage depth | `borg.stageDepth` | 1 | 0-100 | The dungeon depth a run must have arrived on (0 is the town) for the Borg to count it as having attained its target stage, together with `borg.stageClvl`. The owner's destination is a moderate depth at character level around 20, which the settings reach as the Borg grows stronger. Read once per page, so a change applies to the next birth. |
| Death replay release turn | `borg.replayReleaseTurn` | 0 | 0-1000000 | The death-replay trainer's release point: when the game's turn counter reaches this value the Borg stops playing and hands the keyboard back with the death banner, so the owner can play the last turns of a dead run themselves. Take the number from the dossier ladder's release-boundary line (docs/runs/, the run's postmortem directory); 0 keeps the replay mode off. Read once per page, so the release point is fixed for the whole life. |
| Death replay death turn | `borg.replayDeathTurn` | 0 | 0-1000000 | The recorded death turn the death-replay banner counts down from: with `borg.replayReleaseTurn` armed, the banner names this turn and how many turns remain. Take it from the dossier's recorded-death line; 0 shows the banner without the countdown. Read once per page with `borg.replayReleaseTurn`. |

## What it needs

- **Engine:** `>=1.23.0-beta.1`
- **Mod API:** `>=2.0.0 <3.0.0`
- **Shape:** `plugin`
- **Facets:** `plugin`
- **Capabilities:** `command:add`, `state:player.read`, `state:monsters.read`, `state:map.read`, `state:inventory.read`, `state:floor.read`, `state:stores.read`, `state:spells.read`, `state:turn.read`, `state:monsters-actual.read`, `state:interaction.read`, `input:intent`, `input:prompt.reply`, `event:message`, `event:run-end`, `event:dungeonlevel`, `event:player-command`, `ui:title`, `ui:birth.replace`, `profiles:manage`, `saves:manage`, `session:control`

Only `state:monsters-actual.read` lets the Borg see past what the character has found. It uses that for two things: the exact hit points of monsters the character can perceive, and those monsters' race records. The game leaves it off unless you switch it on, and without it the Borg plays from what the character knows. See [How the Borg runs on mod API 2](API2-MIGRATION.md).

What a capability string permits, and what a mod that asks for one cannot do
without it, is in [the mod lifecycle
document](https://github.com/neostryder/neo-angband/blob/master/docs/modding/MOD_LIFECYCLE.md).

## Elsewhere

- [README](../README.md), the full account
- [Changelog](../CHANGELOG.md), what changed in each version
- [Planned](../PLANNED.md), what is not built yet
- [How the Borg runs on mod API 2](API2-MIGRATION.md), what it reads and submits
- [How the Borg reaches the
  game](https://github.com/neostryder/neo-angband/blob/master/docs/modding/BORG.md),
  in the game's own repository
- [Installing a
  mod](https://github.com/neostryder/neo-angband/blob/master/docs/MODS.md), the
  route every mod installs by
