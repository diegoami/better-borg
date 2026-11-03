# better-borg

**A class-agnostic fork of [Borg](https://github.com/neostryder/neo-angband-mod-borg)
— defect fixes and strength improvements for every borg, staged for upstream,
with per-class strategy packs.**

One repository, one core, packs instead of forks (the no-N-forks doctrine,
docs/process.md section 2): the class a Borg plays is a STRATEGY PACK under
`src/class/` selected by the `borg.class` setting - **pack #1 is the
warrior**, the lineage of the archived
[neowarrior-borg](https://github.com/diegoami/neowarrior-borg) fork, whose
class-agnostic instruments (restart loop, journal/graveyard, session driver,
records) merged here at M2 open and whose run records moved with them
(docs/runs/). The rule this repo runs by:

- **Port defects** (behaviour that diverges from the Angband 4.2.6 borg the
  port claims to be) are fixed here **and offered upstream** as pull requests.
- **Improvements upstream declines** - or that are choices rather than
  defects - live here.
- **Class- or build-specific behaviour lives in a pack** under `src/class/`,
  never in the core and never in a fork of this repository; a new class
  starts as a pack plus a setting.

Current focus, in order: the seed-1 door-closing defect (half a session spent
closing doors, reproduced bit-for-bit on pristine upstream), the unported
swap subsystem, then the strength roadmap in
[docs/plans/getting-stronger.md](docs/plans/getting-stronger.md) (formula
engine, offline parameter evolution, accumulated knowledge).

## Layout

Same as the stock mod plus the pack layer: `plugin.ts`/`title.ts` are the
mod's own code, `src/api2/` bridges the mod API, `src/` is the port,
`src/loop/` + `src/records/` + `src/play-session.ts` are the class-agnostic
instrument (the unattended line and its measurement), and `src/class/` holds
the strategy packs. Every change from upstream is marked in the source
beside the C it came from and named in its commit; the import commit
`70145c5` is the boundary.

## Building and testing

    pnpm install --frozen-lockfile
    pnpm verify     # typecheck, test, and prove plugin.js is a current build

The play harness needs the game's content pack: a sibling checkout of
`neo-angband` at `../neo-angband`, or `NEO_ANGBAND_REPO`. Run records live
under [docs/runs/](docs/runs/README.md) - a change without a record is an
unmeasured change.

## Licence and credits

The borg is Ben Harrison's, extensively developed by Dr Andrew White and
maintained by the Angband contributors; the Neo Angband port is by
neostryder / RPGM Tools. This fork carries their work and marks every one of
its own changes. Dual licence GPL v2 / Angband licence - see
[LICENSE.md](LICENSE.md).
