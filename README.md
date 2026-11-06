# Mandos

Mandos is a **bug-fix consumer for the Neo Angband Borg**. It adopts verified
port and engine corrections, translates applicable validated C fixes into its
TypeScript derivative, and keeps their source and consumer evidence traceable.
Existing class/race choices and controller behavior remain; this repository is
not the active platform for strategy research or experimental performance work.

The routine is **intake → reproduce → verify → carry → track upstream
resolution → retire the replaced backport**. Targeted legal scenarios, fixed-seed
regressions and basic run/death/stall records support that work. Broad class/seed
cohorts, stage/save-ladder research, trainer feedback and advanced death/replay
analysis are parked optional tools. Their code, branches and evidence are
preserved, not deleted or automatically moved elsewhere. See
[the scope contract](docs/MANDOS-SCOPE.md) and [scope task181](https://github.com/diegoami/mandos/issues/181).

Prefer the **unpatched published engine**. [Adoption180](https://github.com/diegoami/mandos/issues/180)
qualifies beta.3 and chooses the actual supported default from runtime evidence;
preparation is not verified adoption. A local engine backport is an exception
for a demonstrated required Mandos gameplay defect, with its own regression and
removal condition. Optional replay is not a reason to require PR433 or a patched
engine for ordinary use. A valid general engine bug can remain open even when
Mandos does not require its carry. The manifest, package pins and final adoption
receipt describe the delivered profile; this documentation does not deploy it.
Package/Core tests alone do not certify stock-desktop loading, trust or grants;
those are separate from the retained lab profile.

Start an agent at [AGENTS](AGENTS.md), [RULES](RULES.md), [PLAN](PLAN.md) and
[checkpoint36](https://github.com/diegoami/mandos/issues/36). The
[component map](docs/SESSION.md) keeps ownership separate:

- Engine/C tracker: original C Borg, Angband game and Neo engine source defects.
- Neo Borg mod tracker: faithful TypeScript port defects and source proposals.
- Mandos: applicable consumer corrections, its own bugs and verified integration.
- better-borg-c: independent native consumer/experiment work when owner-directed.

C corrections are translated here, not imposed on the fidelity-only port.
borg-rs is independent and reports directly to our C board; no Rust polling,
dispatch, code transfer or issue migration is implied. Future experimental work
belongs in a separately authorized better-borg-c or borg-rs session, not this queue.

[Controls](docs/README.md), [adoption process](docs/process.md),
[source ownership](docs/UPSTREAM.md), [patch ledger](patches/README.md),
[historical records](docs/runs/README.md), [transferred issues](docs/migrations/repository-split.json).
The [canonical C catalogue](https://github.com/diegoami/neo-angband-tracker/blob/master/docs/C-BUGS.md)
stays in the engine/C repository. Old pages here are reference links.

Use Node22+ and the pnpm version in package.json. Run `pnpm install --frozen-lockfile`
and `CI=1 pnpm verify` for the supported default. `mandos.stageRetirement` is an
explicit optional opt-in, off by default. Retained replay/dossier/window/handoff
tests use `pnpm test:optional-replay` with their matching profile. Optional tools/profiles
have their own requirements and do not gate a routine engine upgrade. Rebuild
plugin.js when its runtime source changes. A source merge is not a lab deployment;
owner saves/profiles and the running lab stay untouched without separate authorization.

The seven applied C corrections at baseline6c7916a remain preserved, including
their targeted regressions and independent removal units; parking research does
not undo bug fixes. Upstream credit, GPL/Angband licences and AI_USAGE_POLICY
remain intact. [Pre-split history](docs/history/repository-split) and
[reorganization reviews](docs/migrations/reorganization-review/README.md) remain reference evidence.
