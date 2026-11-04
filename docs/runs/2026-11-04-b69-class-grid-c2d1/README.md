# 2026-11-04 - b69-class-grid-c2d1: borg_attack finds its targets - 37/71 to 57/72

THE B69 MEASUREMENT (#69). The same grid as `../2026-11-04-class-grid-c2d1/`
(nine classes, born Human, seeds 1-8, `--stage 2,1`, cap 10000), with one
change: borg_attack's target scan no longer requires BORG_OKAY, a flag the
port never sets, so the borg's main fight decision has targets for the first
time. (The warrior's false stall on seed 7 was fixed by #65 in between.)

| Class | Before (class-grid-c2d1) | After (this record) |
| --- | --- | --- |
| Warrior | 6/7 (1 stall) | **8/8** |
| Paladin | 6/8 | **8/8** |
| Rogue | 7/8 | **8/8** |
| Blackguard | 6/8 | **8/8** |
| Priest | 4/8 | **7/8** |
| Ranger | 4/8 | **6/8** |
| Mage | 2/8 | **4/8** |
| Druid | 1/8 | **4/8** |
| Necromancer | 1/8 | **4/8** |
| **All** | **37/71** | **57/72** |

Deaths fall from 26 to 11. The Mage now fights with Magic Missile (35 casts
in the grid, from 9). The pure casters are still the weakest: the
Necromancer's lit-grid penalty (#68) and the confusing spores (#67) are open.
