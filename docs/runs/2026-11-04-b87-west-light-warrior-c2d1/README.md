# B87 west-light correction: warrior control

Kind: CHOICE correcting a C lighting defect, identified by borg-rs
(`docs/c-bugs.md` entry 4 at `613227bc53c4`). This is bug work under rule 15.
The targeted proxy is correct east/west perception: both west shoulders
gain `BORG_LIGHT` at radii 2, 3 and 5; the existing wall gate remains.

The Half-Troll Warrior cohort (seeds 20/23/34/49, cap 10000, stage c2d1)
remains 4/4. This is **not unchanged gameplay** and does not establish a
strength improvement. The corrected perceived light changes exploration.

| Seed | Before decisions / turns | After decisions / turns | Outcome |
| --- | --- | --- | --- |
| 20 | 204 / 2288 | 204 / 2288 | c2d1, identical except time |
| 23 | 582 / 5956 | 661 / 6743 | c2d1, later |
| 34 | 153 / 1510 | 300 / 3001 | c2d1, later; kills 6 to 7, gold 164 to 184 |
| 49 | 343 / 3446 | 344 / 3456 | c2d1, one decision later |

Before: `2026-11-04-b54-provenance-warrior-c2d1/runs.json`.
The raw record is authoritative for every other changed command/position
counter. No old record was edited.

A standalone fixture using the actual reference C function and macro,
with radius two and all floor predicates true, gives:

```text
before: listed=21 unique=19 west_shoulders=0,0 east_shoulders=16,16
after:  listed=21 unique=21 west_shoulders=16,16 east_shoulders=16,16
```

This is a perception fixture, not a claim that a particular live death
was caused by the defect. It fixes the demonstrable missing light flags;
the longer stage paths in this small cohort are recorded rather than
presented as a strength gain.
