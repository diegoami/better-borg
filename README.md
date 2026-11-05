# Mandos

Mandos is a Borg that helps with the grind in
[Neo Angband](https://github.com/neostryder/neo-angband): choose which
classes and races it may play, set a target stage, and let it produce
characters that reach that stage. A successful run is kept as a loadable
save; after a death or a successful retirement, it starts another character.

It builds on Angband 4.2.6's C Borg and
[neostryder's TypeScript port](https://github.com/neostryder/neo-angband-mod-borg).
Mandos restores missing or mistranslated behavior, measures the result, and
offers port-defect fixes upstream. It also adds its own stage-grinding,
class/race selection, journals and analysis tools. The previous name was
**better-borg**; the former single-class **neowarrior-borg** fork is archived.

## What you can do

- Play any of the game's **nine classes and eleven races**. Each birth draws
  from the `Class:` and `Race:` toggles you enable; enable one of each to pin
  a combination. All are enabled by default.
- Keep characters at a chosen stage, defined by both character level and
  dungeon depth. The default **c2d1** means character level 2 and arrival at
  dungeon depth 1. This is an early calibration milestone; higher stages
  need their own measurements.
- Inspect a journal of finished runs and generate post-mortem dossiers from
  reproducible harness runs. The dossiers show the map, messages, equipment
  and recent decisions before the recorded death.
- Hand an existing character to Mandos with Ctrl-Z, and take the keyboard
  back when you want to play.
  Handing a character to an autoplayer marks it `NOSCORE_BORG`, keeping it
  off the high-score table.

There is one shared core for every class. The Warrior has a dedicated,
measured point-buy plan; the other classes use the game's suggested birth
stats through the generic pack. Class-specific strategies belong in packs
inside this repository, rather than in separate class forks.

## Where the improvements come from

A green unit suite did not establish that the inherited port followed the C
Borg in play. The audit compares the two, reproduces defects and measures
restorations on fixed seeds. Examples:

| Restoration | Practical effect | Recorded result |
| --- | --- | --- |
| Attack target scan (#69) | The main combat chooser can find monsters: the port required a panel flag it never sets. | The class grid reached c2d1 in [57/72 lives, up from 37/71](docs/runs/2026-11-04-b69-class-grid-c2d1/README.md). |
| Necromancer light and spell failure (#68) | Dark vision is no longer mistaken for carrying a lamp, so dark corridors do not add an incorrect 25-point spell penalty. | The [Necromancer cohort](docs/runs/2026-11-04-b68-necromancer-c2d1/README.md) improved from 4/8 to 6/8. |
| Inventory and recharge rungs (#50) | Restore pack-space, weight shedding, whole-stack bad-ammo drops and worn-item recharging from the C Borg. | The [Ranger cohort](docs/runs/2026-11-04-b50-ranger-c2d1/README.md) improved from 6/8 to 7/8; the Warrior control stayed 4/4. |

These measurements describe their named builds, races, seeds and stage.
They are historical early-game comparisons, not a late-game success rate.
They predate #54's complete-content loader correction and do not establish
current desktop reliability.
[Run records](docs/runs/README.md) retain the raw facts and older baselines.

The [B99 upgrade record](docs/tasks/B99.md) adopts Neo Borg source74a017d
and Neo engine0cc75b4af, retaining our own packs and run instrumentation.
Its [current desktop replay](docs/runs/2026-11-05-b99-desktop-death-replay/README.md)
verifies all98 commands and death facts. The paired small-cohort results are
recorded honestly; this upgrade does not establish a uniform survival gain.
The [patch index](patches/README.md) names each independent engine carry.

Bug leads come from our runs, tests and source audits, and from the related
[borg-rs port](https://github.com/diegoami/borg-rs) (tracked in #86). Each lead
needs verification against the relevant source revision.

Changes are named by provenance: a **DEFECT** restores the C Borg or fixes an
engine/port error; confirmed Neo port fixes are offered there. C findings
and proposed fixes stay in our own catalogue/repositories. A **CHOICE** deliberately changes
policy and remains a marked Mandos decision. Qualify whether a defect is
inherited from the imported TypeScript port or from C. Neo's Borg must
follow C: a faithful copy of a C bug needs an upstream Angband correction
first, then Neo parity. Mandos may carry an earlier marked CHOICE.

The current scope is bug hunting and fixing only. Our maintained
[C-bug catalogue](docs/C-BUGS.md) separates leads, source checks and actual
C-game reproductions, and links proposed fixes in our own repositories.
**No submissions to angband/angband now**; we are maintaining our list and
local proposals, not taking on upstream C maintenance. `upstream-c` tracks
C-origin investigations, not proof of a defect or permission to submit.
A validated fix needs a reproducible meaningful consequence and controls.
Carry labels
(`carried`, `not-carried`, `partially-carried`) describe verified coverage in
Mandos `main` and its required consumers; a patch file alone is insufficient.
Confirmed Neo port defects may be posted directly under the owner's
2026-11-05 authorization, after attribution, reproduction and duplicate checks.
See the [canonical upstream workflow](docs/UPSTREAM.md#carry-status-and-attribution)
for evidence, patches, consumer tracking and regular status reviews.

Learning and parameter searches
happen offline; a live character follows a fixed deterministic policy.

Current-status reconciliation/board monitoring comes before new triage or
fixes. Port fixes use issue -> PR -> verified carry. An upstream correction
is fixed/closed after adoption with our changes, rebuild and verification;
a published release is not a closure prerequisite. patch-active separately
tracks still-needed backports. Internal issue labels and bodies own status.
The C-only catalogue retains source/evidence/fix links, with no carry column.
Its first option is the direct compare/open-PR link; copying and patch
alternatives live in a separate guide. The single-file catalogue is temporary.
[The pre-outreach evaluation](https://github.com/diegoami/neo-angband/issues/2)
plans fork-owned upstream trackers and a separate C/game/Neo-engine session;
Neo Borg development and Mandos-specific work stay here. Existing tracker
homes remain current until a linked migration. Our C submissions remain paused.

## Run Mandos in the desktop lab

The current checkout requires **our engine fork**,
[diegoami/neo-angband](https://github.com/diegoami/neo-angband), on its
`neowarrior-lab` branch. The manifest accepts
`>=1.23.0-beta.2-mandos.2 <1.23.0`; stock Neo Angband is outside that range.
The lab carries engine fixes and seams offered upstream. Mandos itself
ships no engine code.

1. Follow the [checkout and lab setup](docs/process.md#1-setup), including
   the engine branch and a mod clone named `mandos` in the lab data folder.
2. From this repository, run:

   ```sh
   pnpm install --frozen-lockfile
   node tools/lab.mjs status
   node tools/lab.mjs start
   ```

   `start` updates the lab's mod clone, rebuilds a changed engine and prints
   the actual mod and engine commits. A repository merge alone does not
   update a running desktop session.
3. Enable Mandos in the Mods screen. Use **Choose one by one** to grant the
   requested permissions, including `state:monsters-actual.read` (the truth
   domain) and `session:control` (keeping successful saves).
4. Choose your class/race pools and stage in Settings, then select **New
   Mandos character** on the title screen. Ctrl-Z hands an existing
   character over or takes the keyboard back.
5. After watching births, deaths and kept retirements, run
   `node tools/lab.mjs check`. It reports missing permissions and the
   outcomes in the newest lab log.

See [Settings](SETTINGS.md) for recipes and the
[lab runbook](docs/process.md#8-watched-runs-lab-builds) for the full setup.
Each release's [changelog](CHANGELOG.md) names its compatible engine build.
Version 0.1.0 was checked on our fork at `8b1169799`; that desktop check
covered play and rebirth, while its retirement evidence came from the
headless harness because the lab profile lacked the required consents.

## Analysis limits

Harness death replay checks the cause, turn, decision count and command
census against the record. It needs the matching Borg code, engine, content
and accepted-birth RNG/options and controller context. In
[#54](https://github.com/diegoami/mandos/issues/54), one actual desktop
Human Mage death reproduced all 113 commands and arguments, pre-command
observations and final death facts in the harness; see the
[committed evidence](docs/runs/2026-11-04-b54-desktop-death-replay/README.md).
That proves the named matching-code case, not every desktop run. A seed
alone cannot reconstruct missing birth context from older records.

The graveyard is a journal, not a full save of the fatal game state. Death
snapshots with negative HP are a proposed diagnostic extension. The engine's
ordinary dead-save path does not retain the dungeon entities for that use.

## Develop and measure

Use Node 22+ and the pnpm version in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm verify
node tools/runs.mjs --label my-control --seeds 20,23,34,49 --cap 10000 --stage 2,1 --out artifacts
```

`pnpm verify` runs typecheck, tests and the committed plugin currency check.
The harness finds content through `NEO_ANGBAND_REPO`, then the published
content devDependency, then a sibling `../neo-angband` checkout. The default
engine under test is the pinned published package plus the carried patches.
Probe output goes to ignored `artifacts/`; committed measurements use
[the run-record format](docs/runs/README.md).

- [Documentation index and quick reference](docs/README.md)
- [Mandos plans](PLANNED.md) and the [strength roadmap](docs/plans/getting-stronger.md)
- [Work process](docs/process.md), [upstream tracking](docs/UPSTREAM.md) and
  the latest [checkpoint](https://github.com/diegoami/mandos/issues/36)

## Licence and credits

The Borg is Ben Harrison's, extensively developed by Dr Andrew White and
maintained by the Angband contributors. The Neo Angband port is by
neostryder / RPGM Tools. Mandos carries their work and marks its own changes.
Dual licence GPL v2 / Angband licence; see [LICENSE.md](LICENSE.md).
The [original port's planning history](docs/history/README.md) is preserved
separately from Mandos's roadmap.
