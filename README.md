# Mandos

**Formerly better-borg** (and, before the unification, the archived
[neowarrior-borg](https://github.com/diegoami/neowarrior-borg) fork) —
**a class-agnostic fork of [Borg](https://github.com/neostryder/neo-angband-mod-borg)
— defect fixes and strength improvements for every borg, staged for upstream,
with per-class strategy packs.**

One repository, one core, packs instead of forks (the no-N-forks doctrine,
docs/process.md section 2): the class a Borg plays is a STRATEGY PACK under
`src/class/`, and the player picks which classes and races it may draw at
each birth (one toggle each, #16) - **pack #1 is the warrior**, the lineage of the archived
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

## Which engine it runs on

Mandos ships no engine code. It does depend on the engine fixes and seams
we have offered upstream (process section 6), and on the lab build's
trust entry, and it plays without them only badly or not at all. **Until
upstream releases those, every Mandos version works on OUR engine fork
only:** the `neowarrior-lab` branch of
[diegoami/neo-angband](https://github.com/diegoami/neo-angband), started as
process section 8 describes, not a stock Neo Angband install. On a stock
engine the first death ends the unattended run (fail-closed, #18), the
door-close loop (neo-angband#428) can stall a life, and the borg has no
truth domain. Each release names its engines in the CHANGELOG's
**Works on** line:

| Mandos | Stock upstream engine | Our fork |
| --- | --- | --- |
| Unreleased | no (the manifest refuses it) | `neowarrior-lab` at `7157fed1c` and later: the engine reports 1.23.0-beta.2-mandos.1 (1.23.0-beta.2 plus PR #429, #432, #433 and the lab trust). The manifest's range `>=1.23.0-beta.2-mandos.1 <1.23.0` accepts exactly our fork's builds. |
| 0.1.0 | no | `neowarrior-lab` at `8b1169799`: 1.23.0-beta.2 plus PR #429 and PR #432 and the lab trust. Its lab check verified play and rebirth only: the profile had not granted the truth domain or `session:control`, so retirement into a kept save was not verified (#53). |

What is being worked on, and why: the dated priority paragraph in
[docs/plans/getting-stronger.md](docs/plans/getting-stronger.md), and the
latest comment on the pinned
[checkpoint issue](https://github.com/diegoami/mandos/issues?q=is%3Aissue+is%3Aopen+label%3Acheckpoint).

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
