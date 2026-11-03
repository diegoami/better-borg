# Death dossier - seed 20, 10 turns before the death

The rung 10 of the replay ladder (5/10/15/20 turns before death) for the dead run recorded in `docs/runs/2026-11-03-b32-stage-c2d1` (runs.json seed 20, life 1; recorded 2026-11-03T16:13:13.617Z). The replay rebooted the recorded seed with the same planned birth and drove the Borg deterministically; this page freezes what the character knew at the release point. Format `mandos/postmortem@1`.

## The rung

- ladder: 5/10/15/20 turns before death (this dossier: 10)
- recorded death: turn 3014, to "grey mushroom patch" (character level 1, deepest depth 2, 250 decisions)
- target turn (death turn minus 10): 3004
- release boundary: turn 3011 - the first decision boundary at or after the target, 249 of 250 decisions in
- replay verification: EXACT - the replayed death reproduced the record (cause, turn, decisions, census)
- human replay settings: borg.replayReleaseTurn = 3011, borg.replayDeathTurn = 3014

## The character at the boundary

- Borg, Half-Troll Warrior, character level 1
- hit points 2/23, spell points 0/0, gold 146
- depth 1, grid 93,21, turn 3011

## The screen (the remembered map, 33x17 around the character)

```
   ##%                           
   #>#       #.#                 
   #.#####%###'####              
   #.........'.'..#              
   #.####%%%.#.##.#########      
   ..     %...............#    % 
  . .     +................  ..# 
 . ...    %...............#    % 
.  ...    %...,.@.........#      
   ...    %...............#      
   ...    %%#%.#%%%#%%#####      
  %.#%%      %.%                 
                                 
                                 
                                 
                                 
                                 
```

Visible monsters (letter = the map cell):
- , grey mushroom patch at 91,21 (1/1 hp)

## Message log (the last 20 lines, oldest first, repeats counted)

- You are confused.
- The grey mushroom patch releases spores at you.
- You are more confused!
- You are confused.
- The grey mushroom patch releases spores at you.
- You are more confused!
- The grey mushroom patch releases spores at you.
- You are more confused!
- You are confused.
- The grey mushroom patch releases spores at you.
- You are more confused!
- x4 You are confused.
- The grey mushroom patch releases spores at you.
- *** LOW HITPOINT WARNING! ***
- You are more confused!
- You are confused.
- The grey mushroom patch releases spores at you.
- *** LOW HITPOINT WARNING! ***
- You are more confused!
- You are confused.

## The pack

- a) 3 Rations of Food
- b) a Scroll of Word of Recall
- c) a Flask of oil

## Worn equipment (body slots in order)

- a) a Dagger (1d4) (+0,+0)
- b) -
- c) -
- d) -
- e) -
- f) a Wooden Torch (4706 turns)
- g) Soft Leather Armour [8,+0]
- h) -
- i) -
- j) -
- k) -
- l) -

## The home (what the character stashed in town)

- (nothing)

## Recent decisions (the last 30, oldest first; at = depth:x,y; alone = nothing visible)

- #220 1:90,16 alone=yes walk
- #221 1:91,15 alone=no open
- #222 1:91,15 alone=no open
- #223 1:91,15 alone=no walk
- #224 1:92,16 alone=yes walk
- #225 1:93,16 alone=yes walk
- #226 1:94,16 alone=yes walk
- #227 1:94,17 alone=no walk
- #228 1:95,18 alone=no walk
- #229 1:96,18 alone=no walk
- #230 1:95,19 alone=no walk
- #231 1:94,20 alone=no walk
- #232 1:93,21 alone=no walk
- #233 1:92,22 alone=no walk
- #234 1:92,21 alone=no walk
- #235 1:91,22 alone=no walk
- #236 1:92,21 alone=no walk
- #237 1:92,22 alone=no walk
- #238 1:92,21 alone=no walk
- #239 1:91,22 alone=no walk
- #240 1:90,22 alone=no walk
- #241 1:91,23 alone=no walk
- #242 1:90,22 alone=no walk
- #243 1:89,21 alone=no walk
- #244 1:88,21 alone=no walk
- #245 1:89,21 alone=no walk
- #246 1:90,21 alone=no walk
- #247 1:91,22 alone=no walk
- #248 1:92,22 alone=no walk
- #249 1:92,21 alone=no walk

## Command census (to the boundary)

- ascend x6
- descend x7
- open x6
- pickup x1
- quaff x1
- rest x7
- walk x221

## Provenance

- seed 20, life 1 - record `docs/runs/2026-11-03-b32-stage-c2d1` (b32-stage-c2d1)
- engine @rpgm-tools/neo-angband-core 1.23.0-beta.1 (the record's engine: @rpgm-tools/neo-angband-core 1.23.0-beta.1); content neo-angband@b53ff5f0b
- borg warrior pack (stock parameters); decision cap 10000
- watched-lineage replay (a death the MOD played, seed unknown to it) needs the upstream seed seam: neo-angband#431

