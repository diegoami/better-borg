# Death dossier - seed 34, 20 turns before the death

The rung 20 of the replay ladder (5/10/15/20 turns before death) for the dead run recorded in `docs/runs/2026-11-03-stage-baseline-c2d1` (runs.json seed 34, life 3; recorded 2026-11-03T11:26:24.196Z). The replay rebooted the recorded seed with the same planned birth and drove the Borg deterministically; this page freezes what the character knew at the release point. Format `mandos/postmortem@1`.

## The rung

- ladder: 5/10/15/20 turns before death (this dossier: 20)
- recorded death: turn 1365, to "grey mold" (character level 1, deepest depth 1, 45 decisions)
- target turn (death turn minus 20): 1345
- release boundary: turn 1347 - the first decision boundary at or after the target, 43 of 45 decisions in
- replay verification: EXACT - the replayed death reproduced the record (cause, turn, decisions, census)
- human replay settings: borg.replayReleaseTurn = 1347, borg.replayDeathTurn = 1365

## The character at the boundary

- Borg, Half-Troll Warrior, character level 1
- hit points 6/23, spell points 0/0, gold 149
- depth 1, grid 73,13, turn 1347

## The screen (the remembered map, 33x17 around the character)

```
                                 
         ###%##%#                
         #......%                
         #.####'%%#.%#%# #####   
         #.# ##..............'   
         #.###..............##   
         ..##..............##    
         #.#..............%#     
         #.#####@#.##%%%+%#      
         #.#   #m.               
         #.#####.#               
         ..'.....#               
          ######.#               
               #<#               
               ###               
                                 
                                 
```

Visible monsters (letter = the map cell):
- m grey mold at 73,14 (1/1 hp)

## Message log (the last 20 lines, oldest first, repeats counted)

- You enter a maze of down staircases.
- This seems a tame, sheltered place.
- The grey mold releases spores at you.
- You feel much better.
- You feel like a killing machine!
- You have no more Potions of Berserk Strength (b).
- x2 The grey mold releases spores at you.
- x21 You failed to pick the lock.
- You no longer feel berserk.
- x72 You failed to pick the lock.
- You have picked the lock.
- You see nothing there to open.
- x6 The grey mold releases spores at you.

## The pack

- a) 2 Rations of Food
- b) a Scroll of Word of Recall

## Worn equipment (body slots in order)

- a) a Dagger (1d4) (+0,+0)
- b) -
- c) -
- d) -
- e) -
- f) a Wooden Torch (4865 turns)
- g) Soft Leather Armour [8,+0]
- h) -
- i) -
- j) -
- k) -
- l) -

## The home (what the character stashed in town)

- (nothing)

## Recent decisions (the last 30, oldest first; at = depth:x,y; alone = nothing visible)

- #14 1:67,14 alone=yes walk
- #15 1:67,13 alone=yes walk
- #16 1:67,12 alone=yes walk
- #17 1:67,11 alone=yes walk
- #18 1:67,10 alone=yes walk
- #19 1:67,9 alone=yes walk
- #20 1:67,8 alone=yes walk
- #21 1:67,7 alone=yes walk
- #22 1:68,7 alone=yes walk
- #23 1:69,7 alone=yes walk
- #24 1:70,7 alone=yes walk
- #25 1:71,7 alone=yes walk
- #26 1:72,7 alone=yes open
- #27 1:72,7 alone=yes open
- #28 1:72,7 alone=yes open
- #29 1:72,7 alone=yes walk
- #30 1:72,8 alone=yes walk
- #31 1:72,9 alone=yes walk
- #32 1:71,10 alone=yes walk
- #33 1:70,11 alone=yes walk
- #34 1:71,11 alone=yes walk
- #35 1:72,12 alone=yes walk
- #36 1:73,13 alone=no walk
- #37 1:73,12 alone=no walk
- #38 1:73,13 alone=no walk
- #39 1:73,12 alone=no walk
- #40 1:73,13 alone=no walk
- #41 1:73,12 alone=no walk
- #42 1:73,13 alone=no walk
- #43 1:73,12 alone=no walk

## Command census (to the boundary)

- descend x1
- open x3
- quaff x1
- walk x38

## Provenance

- seed 34, life 3 - record `docs/runs/2026-11-03-stage-baseline-c2d1` (stage-baseline-c2d1)
- engine @rpgm-tools/neo-angband-core 1.23.0-beta.1 (the record's engine: @rpgm-tools/neo-angband-core 1.23.0-beta.1); content neo-angband@b53ff5f0b
- borg warrior pack (stock parameters); decision cap 10000
- watched-lineage replay (a death the MOD played, seed unknown to it) needs the upstream seed seam: neo-angband#431

