# B81 — Restore home random-power ego classification

Kind: DEFECT inherited from the imported TypeScript port. Tracker81; Neo465.

Home notice conflated unknown runes with random-power ego metadata. C exempts
random-power egos from duplicates even when fully identified, and gives the
extra unidentified-ego premium only to random-power egos. The port did neither.

Use existing public hasRandomPower in the two C predicates. No new data grant,
engine behavior, content/package pin, score constant or strategy is introduced.
The synthetic removal-selector case retains two useful Aman cloaks with
separate high resistances; before the erroneous50000 duplicate penalty makes
one a removal target. Fixed-power duplicates remain valid negative controls.

Source checked at C4.2.6 f3082213 and currente473720, home-notice282–304/495–499;
existing API2 item analysis already supplies randomPower from ego records.
Five cases:before3fail/2pass;after5pass. Controls in append-only
2026-11-05-b81-home-before/after records remain2/2 Warrior1/2 cap600c2d1,
with identical gameplay excluding wallClockMs. No native C save or observed
natural prevention claim. Separate C selling wrong-ego defect is unchanged.

Done-when:
- pnpm exec vitest run src/store/home-random-power.test.ts src/store/knowledge.test.ts src/store/store.test.ts src/think-session.test.ts
- pnpm exec vitest run src/postmortem/replay.test.ts
- CI=1 pnpm verify

Keep81 open until remaining scope is attributed and upstream corrections are
adopted/rebuilt/verified. Exact source/build/test/CI receipts and upstream PR
links are recorded on81 and checkpoint36; no desktop deployment is claimed.
