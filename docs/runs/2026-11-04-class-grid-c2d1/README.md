# 2026-11-04 - class-grid-c2d1: every class, eight seeds, to stage c2d1 (#31)

The first class grid: each of the nine classes, born Human through its pack
(the warrior's measured plan; every other class on the game's suggested
stats, #17), seeds 1-8, `--stage 2,1`, cap 10000, at `main@0bd7626f` (with
borg_play_magic, #50; the combat-regen gates, #55; the primary-caster test,
#57; the play-step magic, #59). One directory per class.

| Class | Reached c2d1 | Deaths | Causes |
| --- | --- | --- | --- |
| Rogue | 7/8 | 1 | wild dog |
| Warrior | 6/7 | 0 | (one life STALLED: `open` x40, seed 7) |
| Paladin | 6/8 | 2 | Fang, Farmer Maggot's Dog; crow |
| Blackguard | 6/8 | 2 | grey mold; wild cat |
| Priest | 4/8 | 4 | giant yellow centipede (2); grey mold; grey mushroom patch |
| Ranger | 4/8 | 4 | grey mold; fruit bat; wild dog; poison |
| Mage | 2/8 | 6 | rock lizard; fruit bat (2); grey mushroom patch (2); a fatal wound |
| Druid | 1/8 | 7 | wild dog (2); wild cat; crow; Grip, Farmer Maggot's Dog; white icky thing; giant white centipede |
| Necromancer | 1/8 | 7 | blue yeek; wild cat; grey mushroom patch (2); Grip, Farmer Maggot's Dog; fruit bat; a fatal wound |

Lives per class: a session boots the next seed only behind a death or a
retirement, so a life that survives its cap without attaining ends it. The
warrior's stalled life (seed 7) ended its session after 7 lives.

Leads, each to be attributed against the C (#34):
- the pure casters (Mage, Druid, Necromancer) are far behind;
- grey mushroom patches and grey molds kill across five classes (#38's family);
- the warrior's `open` stall on seed 7 (#56's first measured stall).

    for c in Warrior Mage Druid Priest Necromancer Paladin Rogue Ranger Blackguard; do
      node tools/runs.mjs --label grid-$(echo $c | tr A-Z a-z) --class $c --race Human --seeds 1,2,3,4,5,6,7,8 --cap 10000 --stage 2,1 --out <dir>
    done
