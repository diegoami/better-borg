# Internal C validation: B87 west-side light coverage

2026-11-04, checked through 21:12 UTC. Internal proposal
[#89](https://github.com/diegoami/mandos/issues/89), local correction #87.
**Upstream posting is withheld until the owner approves this report.**

## Result

Reproduced in a built **C Angband engine with the C Borg**, during a natural
seeded game. No map, player, item or RNG state was manufactured. At game
turn 71, seed 1000, Human Warrior, town depth 0, Borg position `(32,8)`, an
equipped light has radius 2 and all four radius-two floor gates are true.

| Observation | Unfixed C | Only two offsets corrected |
| --- | --- | --- |
| West shoulder light bits (north/south) | 0 / 0 | 1 / 1 |
| East shoulder light bits (north/south) | 1 / 1 | 1 / 1 |
| Light-list entries / distinct grids | 21 / 19 | 21 / 21 |

This is a defect in the **Borg's own `BORG_LIGHT` cache**, not evidence that
Angband's lighting engine fails. It is not a reproduced death or a strength
improvement. Both 100,000-turn runs finish alive at character level 7 and
maximum depth 3; their later paths differ (13,867 versus 13,215 key events).

## Source and executable proof

- C upstream: `angband/angband` master
  `e473720ed88a0f0c7ca66815cef3000eb4a38bc3`.
- Isolated harness source: `diegoami/borg-rs`
  `613227bc53c4f0e77ec457d5721febe9cf8bfe03`.
- Before instrumentation, its `angband/src/borg` tree and official
  `src/borg` have the identical tree object
  `a71e9ba6625a4e65a67e0849b6f95dfc5c60a4a2`.
- GCC 15.2.0, CMake 4.4.4, Linux x86_64/WSL2; CMake Release,
  `SUPPORT_BORG_HARNESS=ON`, `BORG_IMPL=c`, `ALLOW_BORG`, `-O3 -DNDEBUG`.
  Built with two workers. The compile database contains 59 C Borg units;
  the link command has no Rust crate/library. `nm` confirms linked
  `do_cmd_borg`, `borg_think` and `borg_update_light`.
- The unmodified C Borg's seed-1000 key log matches every byte of the
  project's C reference: 180,210 bytes, SHA-256
  `06885c7e77e46d5c70eba6b16f2d7fd900cd13824361bfe13d784d9d4ddae51a`.
- Added an observation-only `BORG_HARNESS` block at the end of the real
  `borg_update_light`: it prints the first naturally occurring open tick's
  state and never modifies game/Borg state or draws RNG. Its full key log
  remains byte-identical to the baseline and reference.
- Kept that identical observer and changed only the west y offsets from
  `+/-2` to `+/-1`; rebuilt and reran the same seed, birth and configuration.
  The after witness has the same turn, position, depth, light and floor gates.
- Borg cheat death is off; each run has isolated saves/settings. The
  harness scripts birth and records keys; it also fixes seed/calendar
  nondeterminism. Those harness changes are declared, not stock UI execution.

[Exact reproduction commands](commands.md), the JSON receipt, duplicate
search summary, observation-only patch and carry-patch check are retained
alongside this report. Raw summaries/key logs, compile database, link
command, full query responses and reviewed PR patches remain in
`artifacts/b87-c-validation/`. No extraction/stub replaces the function.
The distributable `patches/upstream-c/B87-west-light.patch` was separately
verified to apply cleanly to official C master and yield byte-identical
corrected source to the tested after build after removing the observer.
Observation code is not part of that carry patch.

## Duplicate/fix check

GitHub REST search was used with exact `is:issue` / `is:pr` and open/closed
qualifiers; all 14 query result sets were complete and below the 100-item
page cap. Full queries/results are in `duplicate-search-summary.json` and
the raw `duplicate-search.json`.

Searches covered `borg light` separately for open/closed issues and PRs,
plus `borg west`, `borg-cave-light`, `BORG_LIGHT`, `borg lantern`,
`borg torch`, `borg radius`, `borg_update_light`, `light west`,
`lighting asymmetric`, and `borg shoulder`.

Closest reports assessed:

- [#6309](https://github.com/angband/angband/issues/6309) and
  [PR #6311](https://github.com/angband/angband/pull/6311): an empty
  brightness lantern incorrectly treated as not needing fuel; the PR
  changes `borg-trait.c`, not west-grid offsets.
- [#3777](https://github.com/angband/angband/issues/3777) and
  [PR #208](https://github.com/angband/angband/pull/208): redundant room
  lighting, fixed in 2013; a different behavior.
- [PR #5795](https://github.com/angband/angband/pull/5795) reorganizes the
  affected C function but retains the same west offsets.
- [PR #6136](https://github.com/angband/angband/pull/6136) changes light
  traits/Necromancer handling in this file, but leaves the west arm intact.
- PRs #5676, #5974, #6114, #6589 and #6760 were also reviewed through
  their changed-file patches; none supplies this correction. #6683 concerns
  detection arrays with large tiles, not this light cache.

**No exact duplicate was found within this documented search.** This is
not a claim that a search can prove absence of every historical discussion.
The defect is still present and reproduced at current C master. The last
100 upstream commits and the affected file's available history were checked;
that history is shallow, so it is not presented as an exhaustive ancestry audit.
Recheck the tracker and master immediately before any approved submission.

## Destination and future PR vehicle

For this tested C version, the maintained source and reporting route are
`angband/angband`. Its [Borg guide](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/docs/hacking/borg.rst)
describes reintegration into Angband and directs users to this repository's
`src/borg`. [CONTRIBUTING](https://github.com/angband/angband/blob/e473720ed88a0f0c7ca66815cef3000eb4a38bc3/CONTRIBUTING.md)
names the official repository and its issue/PR route. The Borg maintainer
handles the Borg-specific #6309/#6311 and #6136 there. These are primary
route evidence, not an assumption that bundling alone determines ownership.
No preferred separate current C Borg tracker was identified in these sources.

After explicit approval, the proposed issue and PR target are
**`angband/angband`**. Proposed head:
**`diegoami/neo-angband:pr/borg-west-light`**, cut directly from refreshed
official C `master` (currently `e473720...`) and containing only the C fix.
GitHub reports the existing fork's parent as `neostryder/neo-angband` and
network source as `angband/angband`; it is in the official fork network.
Do not branch from neostryder's TypeScript master, the lab or borg-rs history.
No such branch was pushed and no external issue/PR/comment was posted.

Credit: the owner's borg-rs C bug catalogue, entry 4, at `613227bc53c4`.
