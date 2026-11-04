# B50 Ranger c2d1: 6/8 to 7/8

Kind: inherited DEFECT restoration. Code `3790c3a`, with B68 included.
Same Human Ranger cohort as B69's class grid: seeds 1–8, cap 10000,
stage c2d1. #50 restores drop_hole, drop_slow, dump_quiver and
wear_recharge, plus consume-before-drop and accurate known quiver membership.

| Measure | B69 Ranger grid | B50 |
| --- | --- | --- |
| Attainment | 6/8 | 7/8 |
| Deaths | 2 | 1 |

Seed 7 reaches and retires at decision 504 instead of dying at 671.
Seed 1 still dies to Fang at decision 287. The changed lives are seeds
2 and 7; every other per-life fact matches B69 apart from timing.
The parallel Half-Troll Warrior control remains 4/4 with identical facts.

B68, already included in this branch, restores Necromancer light and the
ZERO_FAIL lookup. The Ranger has no ZERO_FAIL or UNLIGHT and starts with
its torch; those predicates do not change this cohort's behavior.
