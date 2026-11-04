# B69 chain fixtures at cap 600

Kind: regression-fixture update for the inherited BORG_OKAY defect (#69).
`tools/runs.mjs --label b69-chain-cap600 --seeds 73,1,34,49 --cap 600`
plays the unchanged Half-Troll Warrior plan on the B69 attack fix.

| Seed | Decisions | Turn | Result |
| --- | --- | --- | --- |
| 73 | 420 | 4525 | Died to grey mold |
| 1 | 600 | 7055 | Survived |

The first death boots seed 1; its survival prevents seeds 34 and 49 from
booting. The three restart/recording tests now use this measured pair.
All seeds 1–72 survived individual probes at the same cap (scratch logs in
`artifacts/b69-chain-seed-*.log`); seed 73 is the first death in that sweep.

The run names `670c1983 (dirty)`: only test fixture edits were in flight;
production play code is exactly `670c1983`. The older records stay unchanged.
The B69 class-grid record remains the behavior measurement at c2d1.
