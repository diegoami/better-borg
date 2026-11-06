# Mandos replay window profiles

**PARKED / OPTIONAL — not a normal-play or engine-upgrade requirement.**
The [consumer scope](../MANDOS-SCOPE.md) preserves these window profiles and old
evidence without scheduling replay work. "Default" below means the window list
inside an explicitly invoked optional replay, not the default Mandos engine.
No PR433 requirement or exact historical replay is implied: original executable,
content/configuration/start inputs must exist; otherwise report unavailable or
diverged. Earlier-anchor/coverage development stays parked.

New replays default to **mandos-death-windows-v2**:
[5,12,25,40,60,82,105](window-profile-v2.json). Historical
[mandos-death-windows-v1](window-profile-v1.json) remains selectable:

```sh
node tools/replay.mjs --record docs/runs/<session> --profile v2
node tools/replay.mjs --record <fresh-scratch-copy> --profile legacy-v1
node tools/replay.mjs --record <fresh-scratch-copy> --profile v2 --offsets 12,25,105
```

Custom offsets have their own profile ID and record the base profile and actual
normalized list. They do not silently retain the standard profile's identity.
Existing dossier directories are refused, never overwritten. No historical
record, profile receipt or dossier is rewritten by this change. Legacy v1's
former pre-start behavior is intentionally preserved for reproducibility.

Units are **Neo Core GameState.turn**, not decisions, action energy or wall time.
For endpoint T and offset N the target is T-N. The single existing replay drive
captures the first **living decision boundary at or after** that target. Multiple
windows can share a boundary: record the observed boundary rather than
interpolating. A target crossed only by the fatal command, or not reached before
a cap/stall, has no living boundary and is missed. With v2, targets earlier than
the replay's initial turn are explicitly unavailable; do not clamp to the start.
V1 retains its old first-boundary behavior, explicitly labelled as legacy.

Every new dossier and `postmortem/windows.json` names the profile, units,
pre-start policy, start/target/observed turns and verification scope. Current
"exact" verification means **endpoint and command-census agreement**, not proof
of complete ordered commands/observations/RNG identity. Matching original code,
content, configuration and accepted starting conditions remains a precondition;
missing provenance stays missing. Preserve failed/divergent attempts, identify
replay/comparison roles and do not count them as new independent natural lives.
No save format, negative-HP reload or native C timing semantics is adopted.

Earlier stock/entry/retreat events may matter beyond105. Those are **separate,
named observed event anchors** with their own event/turn and provenance, not
extra unnamed offsets or imported native C timings. This profile does not capture
earlier anchors; new output says `not-captured`. The later coverage pilot owns
that work. A bounded tail of twelve live decisions is not105 game turns.
