# B68 Necromancer c2d1: virtual vision is not torchlight

Kind: inherited DEFECT toward borg_update_light and borg_spell_fail_rate.
Production code `4b11bba`, published beta.2 engine plus the carried patches.
Same Human Necromancer cohort as B69: seeds 1–8, cap 10000, stage c2d1.

| Measure | B69 baseline | B68 |
| --- | --- | --- |
| Reached c2d1 | 4/8 (50%) | 6/8 (75%) |
| Deaths | 4 | 2 |
| Cast commands | 12 | 43 |

The C checks the equipped light before setting BORG_LIGHT. UNLIGHT gives a
Necromancer BI_LIGHT=1 without a lamp, so the port's radius-only check
invented torchlight and incorrectly added 25 to its spell failure rate.
The fix also restores the C's BORG_LIGHT-only penalty and declared
PF_ZERO_FAIL predicate. Four scenarios fail on the old code; five pass on
the fix, including the radius-zero equipped-light boundary.

Seed 4 now dies to Fang in town; seed 8 still dies to Grip. The remaining
six retire into the library. This is a measured defect restoration, not a
claim that every death has been solved. B69 and older records stay intact.
