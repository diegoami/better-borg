# Death dossier - seed 99110530, 15 turns before the death

The rung 15 of the replay ladder (5/10/15/20 turns before death) for the dead run recorded in `docs/runs/2026-11-04-b54-desktop-death-replay` (runs.json seed 99110530, life 1; recorded 2026-11-04T23:00:11.909Z). The replay rebooted the recorded seed with the same planned birth and drove the Borg deterministically; this page freezes what the character knew at the release point. Format `mandos/postmortem@1`.

## The rung

- ladder: 5/10/15/20 turns before death (this dossier: 15)
- recorded death: turn 2450, to "giant yellow centipede" (character level 1, deepest depth 1, 113 decisions)
- target turn (death turn minus 15): 2435
- release boundary: turn 2441 - the first decision boundary at or after the target, 112 of 113 decisions in
- replay verification: EXACT - the replayed death reproduced the record (cause, turn, decisions, census)
- human replay settings: borg.replayReleaseTurn = 2441, borg.replayDeathTurn = 2450

## The character at the boundary

- Borg, Human Mage, character level 1
- hit points 1/10, spell points 1/2, gold 319
- depth 1, grid 116,58, turn 2441

## The screen (the remembered map, 33x17 around the character)

```
     #%%#.%%#%                   
     .......<#                   
     #.##.%*%####                
     #.##:...'..#                
     #....#%.#'%%                
     #.#####.#..%                
     #.#   %.%..% #              
           #.##%%c%              
           #....@.#              
           #####%##              
                                 
                                 
                                 
                                 
                                 
                                 
                                 
```

Visible monsters (letter = the map cell):
- c giant yellow centipede at 117,57 (7/7 hp)

## Message log (the last 20 lines, oldest first, repeats counted)

- You are confused.
- There is a wall in the way!
- You are confused.
- There is a wall in the way!
- You are confused.
- There is a wall in the way!
- You are no longer confused.
- You enter a maze of up staircases.
- You enter a maze of down staircases.
- This seems a tame, sheltered place.
- You enter a maze of up staircases.
- You enter a maze of down staircases.
- This seems a tame, sheltered place.
- x2 You have found a secret door.
- The white icky thing dies.
- The giant yellow centipede bites you.
- The giant yellow centipede stings you.
- The giant yellow centipede bites you.
- The giant yellow centipede stings you.
- *** LOW HITPOINT WARNING! ***

## The pack

- a) 3 Rations of Food
- b) a Scroll of Word of Recall
- c) a Book of Magic Spells [First Spells]
- d) 2 Wooden Torches (5000 turns)
- e) 4 Yellow Potions

## Worn equipment (body slots in order)

- a) a Rapier (1d6) (+0,+0)
- b) -
- c) -
- d) -
- e) -
- f) a Wooden Torch (4894 turns)
- g) -
- h) -
- i) -
- j) -
- k) -
- l) -

## The home (what the character stashed in town)

- (nothing)

## Recent decisions (the last 30, oldest first; at = depth:x,y; alone = nothing visible)

- #83 1:107,51 alone=yes walk
- #84 1:106,51 alone=yes walk
- #85 1:106,52 alone=yes walk
- #86 1:106,53 alone=yes walk
- #87 1:106,54 alone=yes walk
- #88 1:106,55 alone=yes walk
- #89 1:107,54 alone=yes walk
- #90 1:108,54 alone=yes walk
- #91 1:109,54 alone=yes walk
- #92 1:110,53 alone=yes walk
- #93 1:111,53 alone=yes walk
- #94 1:112,54 alone=yes walk
- #95 1:112,55 alone=yes walk
- #96 1:112,54 alone=yes open
- #97 1:112,54 alone=yes walk
- #98 1:113,53 alone=yes open
- #99 1:113,53 alone=yes walk
- #100 1:114,54 alone=yes walk
- #101 1:115,55 alone=yes walk
- #102 1:114,54 alone=yes walk
- #103 1:113,53 alone=yes walk
- #104 1:112,54 alone=yes walk
- #105 1:112,55 alone=yes walk
- #106 1:112,56 alone=yes walk
- #107 1:112,57 alone=yes walk
- #108 1:113,58 alone=yes walk
- #109 1:114,58 alone=yes walk
- #110 1:115,58 alone=no cast
- #111 1:115,58 alone=no walk
- #112 1:116,58 alone=no walk

## Command census (to the boundary)

- ascend x2
- cast x3
- descend x3
- open x6
- pickup x1
- rest x2
- study x1
- walk x94

## Provenance

- seed 99110530, life 1 - record `docs/runs/2026-11-04-b54-desktop-death-replay` (b54-desktop-death-replay)
- engine @rpgm-tools/neo-angband-core 1.23.0-beta.2 + carried patches: PR #432 (fixes #414), PR #429 (fixes #428), PR #433 (fixes #431) (the record's engine: @rpgm-tools/neo-angband-core 1.23.0-beta.2 + carried patches: PR #432 (fixes #414), PR #429 (fixes #428), PR #433 (fixes #431)); content @rpgm-tools/neo-angband-content 1.23.0-beta.2
- borg generic-mage pack (stock parameters; captured desktop birth); decision cap 600
- watched-lineage replay (a death the MOD played, seed unknown to it) needs the upstream seed seam: neo-angband#431

