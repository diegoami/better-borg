# Mandos quick reference

Mandos is the class-agnostic Borg fork for measured stage grinding in Neo
Angband. It restores defects in the original TypeScript port and adds
class/race birth pools, kept stage saves, journals and replay analysis.
Start with the [repository README](../README.md) for the purpose, evidence
and desktop lab setup.

## Play and control

| Action | Where |
| --- | --- |
| Start a new lineage | **New Mandos character** on the title screen. |
| Hand over or take back an existing character | Ctrl-Z in play; the game asks for confirmation when handing over. |
| Choose classes and races | Enable the desired `Class:` and `Race:` toggles in the Mods screen. One of each pins a combination; all off in a pool means all on. |
| Choose the stage to keep saves at | `borg.stageClvl` and `borg.stageDepth`; both thresholds must be reached. |
| Check a watched lab session | `node tools/lab.mjs check` reports births, deaths, kept saves and missing consent. |

Enabling the mod alone does not give it your character. A character handed
to an autoplayer gets the game's permanent `NOSCORE_BORG` mark.

## Settings

The [settings reference](../SETTINGS.md) gives defaults, reload behavior and
recipes. The Mods screen carries the full descriptions.

| Group | Identifiers | Defaults |
| --- | --- | --- |
| Class pool | `borg.classWarrior` through `borg.classBlackguard` | All nine classes on. |
| Race pool | `borg.raceHuman` through `borg.raceKobold` | All eleven races on. |
| Target stage | `borg.stageClvl`, `borg.stageDepth` | 2 and 1 (c2d1). |
| Risk | `borg.playsRisky` | Off. |
| Gear valuation | `borg.worshipsDamage`, `borg.worshipsSpeed`, `borg.worshipsHp`, `borg.worshipsMana`, `borg.worshipsAc`, `borg.worshipsGold` | All off. |
| Town saving and early stockpiles | `borg.selfScum`, `borg.munchkinStart` | Self-scum on, munchkin start off. |
| Replay handoff | `borg.replayReleaseTurn`, `borg.replayDeathTurn` | 0 (release mode off, death turn unnamed). |

### Toggle reference

The names and defaults below match the Mods screen. The overview above
explains the pools; each switch remains individually listed here.

| Setting | Identifier | Default | What it does |
| --- | --- | --- | --- |
| Play risky | `borg.playsRisky` | off | Skip the early hit-point and character-level gates that hold Mandos above a depth, wait longer before drinking a cure, and back away later in a losing fight. |
| Value melee and missile damage | `borg.worshipsDamage` | off | Add weight to weapon and bow damage when Mandos scores a set of gear, so a trade that costs armour for damage looks better than it otherwise would. |
| Value speed | `borg.worshipsSpeed` | off | Add weight to a speed bonus when scoring gear. |
| Value hit points | `borg.worshipsHp` | off | Add weight to constitution and hit points when scoring gear. |
| Value spell points | `borg.worshipsMana` | off | Add weight to spell points when scoring gear. |
| Value armour class | `borg.worshipsAc` | off | Add weight to armour class when scoring gear. |
| Value gold | `borg.worshipsGold` | off | Sell harder, walk down rather than pay for a recall, and put off the first deep recall. |
| Save up for something it wants | `borg.selfScum` | on | Let Mandos set itself a gold target and work in town until it can afford one item it has decided it needs. |
| Skimp on stockpiles for an early munchkin run | `borg.munchkinStart` | off | Below character level borg_munchkin_level (12), value stockpiles of resist poison and speed potions, phase door, word of recall and the deeper cures less than it normally would, on the assumption that a young character is cashing out early. |
| Class: Warrior | `borg.classWarrior` | on | Allow this class in the next-birth draw pool. |
| Class: Mage | `borg.classMage` | on | Allow this class in the next-birth draw pool. |
| Class: Druid | `borg.classDruid` | on | Allow this class in the next-birth draw pool. |
| Class: Priest | `borg.classPriest` | on | Allow this class in the next-birth draw pool. |
| Class: Necromancer | `borg.classNecromancer` | on | Allow this class in the next-birth draw pool. |
| Class: Paladin | `borg.classPaladin` | on | Allow this class in the next-birth draw pool. |
| Class: Rogue | `borg.classRogue` | on | Allow this class in the next-birth draw pool. |
| Class: Ranger | `borg.classRanger` | on | Allow this class in the next-birth draw pool. |
| Class: Blackguard | `borg.classBlackguard` | on | Allow this class in the next-birth draw pool. |
| Race: Human | `borg.raceHuman` | on | Allow this race in the next-birth draw pool. |
| Race: Half-Elf | `borg.raceHalfElf` | on | Allow this race in the next-birth draw pool. |
| Race: Elf | `borg.raceElf` | on | Allow this race in the next-birth draw pool. |
| Race: Hobbit | `borg.raceHobbit` | on | Allow this race in the next-birth draw pool. |
| Race: Gnome | `borg.raceGnome` | on | Allow this race in the next-birth draw pool. |
| Race: Dwarf | `borg.raceDwarf` | on | Allow this race in the next-birth draw pool. |
| Race: Half-Orc | `borg.raceHalfOrc` | on | Allow this race in the next-birth draw pool. |
| Race: Half-Troll | `borg.raceHalfTroll` | on | Allow this race in the next-birth draw pool. |
| Race: Dunadan | `borg.raceDunadan` | on | Allow this race in the next-birth draw pool. |
| Race: High-Elf | `borg.raceHighElf` | on | Allow this race in the next-birth draw pool. |
| Race: Kobold | `borg.raceKobold` | on | Allow this race in the next-birth draw pool. |

Birth pools and stage settings are fixed for a life and apply on the next
birth. Behavior-toggle changes need a reload. A Warrior uses its measured
point-buy plan; other classes use the game's suggested stats. Casters can
study and test spells, and eligible attack spells enter the combat chooser.

## Engine and permissions

The current manifest requires **our engine fork**, with range
`>=1.23.0-beta.2-mandos.2 <1.23.0`, and mod API `>=2.0.0 <3.0.0`.
Use the `neowarrior-lab` branch of
[diegoami/neo-angband](https://github.com/diegoami/neo-angband) and follow the
[lab runbook](process.md#8-watched-runs-lab-builds). The mod folder must be
named `mandos`, matching its manifest id.

The [manifest](../manifest.json) is the authority for the requested grants.
Use **Choose one by one** in the consent screen: the powerful
`state:monsters-actual.read` grant is off unless explicitly enabled. It
provides exact data about perceived monsters and their races; Mandos does
not ask for the real map. `session:control` is needed to keep successful
stage saves. The remaining grants cover known state, commands and prompts,
journal events, title/birth UI, profiles and saves.

`node tools/lab.mjs start` updates the lab's mod clone and rebuilds a changed
engine. A merge alone does not update the running desktop. Verify the
permissions and actual commits with the lab tools before comparing a watched
session with a harness record.

## Records and limits

The metric is reach-rate at a named stage over fixed seeds. c2d1 is an early
calibration milestone, not a late-game benchmark. Committed records retain
older builds and results so improvements can be checked.

Harness replays verify the recorded death line and label divergences.
The [#54 desktop death case](runs/2026-11-04-b54-desktop-death-replay/README.md)
reproduces all 113 commands and observed death facts with matching code,
engine/content and accepted-birth RNG/options/controller context. This
proves that case; a seed alone does not prove another run's exactness. The graveyard stores run
facts and journal data; it does not preserve a full fatal-state save.

## Bug fixes and carry status

Current work is bug hunting and fixing. Distinguish inherited TypeScript
port defects from inherited C bugs. Neo must follow C: a faithful copy of
a C bug needs correction in upstream Angband first, then Neo parity.
Mandos may carry an earlier marked CHOICE. `upstream-c` tracks the C
proposal route, not merely testing against C or confirmed attribution.

`carried` means merged into Mandos `main` and applied in all required
consumers; `not-carried` means absent or proposal/branch only;
`partially-carried` names incomplete coverage. A stored C patch does not
fix TypeScript consumers. Labels and tracker evidence own status, not titles.
The [C-bug catalogue](C-BUGS.md) separates source leads from reproduced C-game
outcomes and links our own fix-proposal PRs. C submissions are paused:
the list, evidence and proposals stay in diegoami repositories. Validated
fixes need meaningful scenarios and controls; a draft is not an applied fix.
The [upstream workflow](UPSTREAM.md#carry-status-and-attribution)
is the detailed reference for evidence, patches, consumer scope and regular
reviews. Confirmed Neo port defects have standing posting authorization
(owner, 2026-11-05), after attribution, reproduction and duplicate checks;
C work remains local-only under the owner's current instruction. [AGENTS.md](../AGENTS.md) is the shared agent entry point and
[RULES.md](../RULES.md) holds the numbered rules. CLAUDE.md only loads them.

Current-status reconciliation/board monitoring comes before new triage or
fixes. Port fixes use issue -> PR -> verified carry. An upstream correction
is fixed/closed after adoption with our changes, rebuild and verification;
a published release is not a closure prerequisite. patch-active separately
tracks still-needed backports. Internal issue labels and bodies own status.
The C-only catalogue retains source/evidence/fix links, with no carry column.
Its contributor section explains copying a local correction into an
Angband contributor's own PR. Our C submissions remain paused.

## Documentation map

| Read | For |
| --- | --- |
| [README](../README.md) | What Mandos adds, measured examples and getting started. |
| [Settings](../SETTINGS.md) | Birth-pool, stage and replay recipes. |
| [Plans](../PLANNED.md) and [roadmap](plans/getting-stronger.md) | Mandos's direction and design. |
| [Run records](runs/README.md) | Reproducible measurements and their format. |
| [Post-mortem workflow](postmortem.md) | Generate dossiers, verify replays and diagnose failures. |
| [API 2 bridge](API2-MIGRATION.md) | Reads, intents, caches and controller lifecycle. |
| [Process](process.md) and [upstream watch](UPSTREAM.md) | Development, lab validation and carrying fixes. |
| [Upstream history](history/README.md) | The original port's playability investigation. |
| [Changelog](../CHANGELOG.md) | Versioned changes and engine compatibility. |
