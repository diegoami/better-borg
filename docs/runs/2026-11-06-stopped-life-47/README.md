# Stopped Borg record preservation — Mandos47

[Issue47](https://github.com/diegoami/mandos/issues/47) is an owned harness/basic-record bug, not a port/gameplay retune or an engine/SDK extension. Start from verified main03fcb3fc1109b64d090f2f618fe487fb823fb365: unpatched published Core/SDK/content beta.3,1,262 required tests/75 files/zero skips. Historical task/B35-census-long-life at193f1b2/0144049 is preserved read-only, unreviewed and not cherry-picked. Its first-null termination idea is not applied.

## Actual current failure and limits

The current production observer counts a command only when the armed Borg callback returns a command. driveLife instead counted every Core loop call as a command decision, then rejected a legitimate no-command reply as a census disagreement. Shared idle handling already waits25 empty replies, but its subsequent record also failed that guard. Losing the record is therefore still a real counter-contract defect.

The actual current clock-stop is at30000, but12000/25000 windows reset the level model and the normal controller reinitializes its clock to1000. The old seed34 door-loop/natural30k story is not evidence of current default reachability. The proof explicitly prepares the agent-model clock AFTER actual controller initialization, then delegates the REAL Think implementation and existing guard in a real published-Core game. It does not replace that guard with a mocked null or claim a naturally encountered long life, death or survival effect.

Frozen before fixture e09ed248e7cbf554af15afbda81620c996c6c40a on unchanged runtime: **3 intended failures /3 passing controls**,1.57s, typecheck passes (`before.*`). Actual clock boundary:0 commands/1 armed reply triggers the census error. A separately labeled synthetic transient-null contract followed by a real walk gives1 command/2 replies and triggers it. The existing25-idle contract triggers0 commands/25 replies and fails too. Current12000 hold→1000 reset, exclusion of unarmed provider waits and an independently corrupted2-versus1 command census are passing controls. The initial negative regex omitted spaces; its one assertion error is preserved in initial-fixture-error.* and excluded from the three defect failures.

## Bounded correction

A private scalar issued-command count is independent of the mutable per-code census. Armed attempts and no-command replies are separately observed at the actual callback, not inferred from the map or Core loop statuses. The driver keeps a separate bounded loop-call budget; `decisions` reports actual issued command replies. Both census equality and attempts=commands+empty replies must hold, so genuine corruption still fails. A killing command remains counted; normal command-only records preserve their previous counts and shape.

The existing clock-stop and final-oops return sites now set a diagnostic on the owned Borg model; the next actual Think clears it. They return exactly the same command/null as before and draw no RNG. No Core state, SDK outcome, threshold, class policy or permission changes. Only this justified explicit stop may end the harness immediately. Arbitrary nulls retain25-idle tolerance and bounded caps; those remain existing `stall` observations, not invented explicit stops. Death takes precedence, then an explicit stop, then a stall; both observations are retained if a stop/stall coincide. No new death/cause/retirement is fabricated.

Own RunReport/SessionLife/runs.json add optional `attempts`, `noCommandReplies` and `stopped`(reason string) only when relevant. The stock session does not reincarnate after an explicit Borg stop. The pack chain already prevents a nondead/nonretired next birth; its log now names a stop or stall rather than claiming cap survival. The ONE record writer preserves metadata and summary; the basic CLI uses the same outcome formatter. Unknown optional caller counts display `?`, never an invented count. A minimal existing sweep outcome label accepts the same metadata; this does not activate parked cohort work. Existing records are not rewritten.

## Actual corrected checks

**32/32 focused tests across three files, zero skips,16.21s**, plus typecheck pass (`focused-after.log`, `after-typecheck.log`). They include the original six before controls, one-call idle budget, no stale diagnostic, actual complete driver→record writer/summary/shared-CLI-formatter serialization, preserved real death and basic optional output/log cases. This shared formatter/writer proof is not claimed as a naturally encountered whole CLI30000 run; no test-only production CLI flag is added.

The explicit clock case records0 commands,1 armed attempt,1 empty reply, stopped=`clock overflow (Borg clock30000)`, alive/nonnull stop reason and null death cause. A real temporary null followed by walk records1 command/2 attempts without declaring a stop. Generic idle still waits25 attempts and remains `stall:idle`; its record survives. A one-call budget performs only one idle request. Corrupted census still throws independently. Actual Mage seed3, default cap600, still dies to a kobold shaman after116 command decisions; its census matches and no new fields are added. No seed, cap, timeout or existing gameplay assertion was weakened.

All seven C patch units, five production counterpart files and six C fixture files equal baseline03 byte-for-byte (`preservation.json`). Current wrap behavior is explicit counterevidence to the old natural-overflow claim. These targeted tests do not establish a broad gameplay improvement or full ordered-trajectory identity.

Run focused checks under /tmp/angband-validation.lock:

```sh
MANDOS_STOP_PROOF_OUTPUT=/tmp/stopped-life.json pnpm test src/play-stop.test.ts src/run-record.test.ts src/play-parity.test.ts
pnpm typecheck
```

Parent reviews the frozen implementation and before/after data before required exact-head default full verification/merge. Generated plugin build and normal gate results are pending at this receipt; the optional replay25 is not a mandatory gate. No engine patch, host adapter, Core/SDK outcome, lab/profile/data, Rust, upstream post or advanced analysis implementation is part of47. Parent owns merge/post-main/labels/pins;20 remains sequential read-only preparation until delivery.
