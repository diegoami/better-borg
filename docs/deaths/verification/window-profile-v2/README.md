# Window-profile slice1 verification

Base e0a3b02, same published Core/SDK/content beta.2 plus existing carried patch.
This implements only166's approved profile/instruction slice. It does not ship
the preserved exporter, a feedback pilot, earlier-anchor capture or gameplay.

- Standalone `src/postmortem/replay.test.ts`:6 passed,12.71s.
- Version/profile/boundary controls:7 passed, including shared, fatal/cap missed,
  pre-start unavailable, exact-at-start and named legacy behavior.
- Actual CLI on disposable B99 public-record copies: v2 accounts for7 windows,
  legacy-v1 for4, custom for2. Metadata names profile, actual units, start/target/
  observed turns, endpoint/census scope and earlier anchors not-captured.
- Background `CI=1 pnpm verify`, shared validation lock: exit0;1249 tests /77 files,
  zero skips;178.83s. Logs are retained beside this receipt.
- `pnpm check` proves the existing737.6KiB API2 plugin current. No plugin rebuild,
  package/patch or historical docs/runs change was needed.

The live replay's named legacy/current comparison preserves the same recorded
endpoint and census. This is not full ordered trajectory/RNG identity proof.
No new natural life or measured survival improvement is claimed. CLI outputs
remain disposable artifacts, not rewritten historical dossiers. The known
seed-only CLI output-path collision remains outside this slice.

Actual targeted start/stop read receipts are in ../../feedback-reads/.
The sole new comment during this task was the marked agent task receipt;
owner feedback remains acknowledged, not resolved. Final PR/checkpoint receipts
may follow this stop read and must be marked as agent receipts.
