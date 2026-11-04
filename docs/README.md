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

Birth pools and stage settings are fixed for a life and apply on the next
birth. Behavior-toggle changes need a reload. A Warrior uses its measured
point-buy plan; other classes use the game's suggested stats. Casters can
study and test spells, and eligible attack spells enter the combat chooser.

## Engine and permissions

The current manifest requires **our engine fork**, with range
`>=1.23.0-beta.2-mandos.1 <1.23.0`, and mod API `>=2.0.0 <3.0.0`.
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
Desktop-to-harness exact replay remains under investigation in
[#54](https://github.com/diegoami/mandos/issues/54). The graveyard stores run
facts and journal data; it does not preserve a full fatal-state save.

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
