# Death dossier - seed 20, 15 turns before the death

The rung 15 of the replay ladder (5/10/15/20 turns before death) for the dead run recorded in `docs/runs/2026-11-03-stage-baseline-c2d1` (runs.json seed 20, life 1; recorded 2026-11-03T11:26:24.196Z). The replay rebooted the recorded seed with the same planned birth and drove the Borg deterministically; this page freezes what the character knew at the release point. Format `mandos/postmortem@1`.

## The rung

- ladder: 5/10/15/20 turns before death (this dossier: 15)
- recorded death: turn 5049, to "floating eye" (character level 1, deepest depth 1, 364 decisions)
- target turn (death turn minus 15): 5034
- release boundary: turn 5035 - the first decision boundary at or after the target, 363 of 364 decisions in
- replay verification: EXACT - the replayed death reproduced the record (cause, turn, decisions, census)
- human replay settings: borg.replayReleaseTurn = 5035, borg.replayDeathTurn = 5049

## The character at the boundary

- Borg, Half-Troll Warrior, character level 1
- hit points 0/23, spell points 0/0, gold 146
- depth 1, grid 124,45, turn 5035

## The screen (the remembered map, 33x17 around the character)

```
                                 
                                 
                                 
                                 
                                 
                                 
                                 
              #%%%%%%%%%##       
              e.@........%       
              #%##%##%##.#       
                       %.#       
                       #.#       
                       #.%       
                       %.#       
                       %.%       
              ##########.#%##.###
              #..................
```

Visible monsters (letter = the map cell):
- e floating eye at 122,45 (11/11 hp)

## Message log (the last 20 lines, oldest first, repeats counted)

- You can move again.
- The floating eye gazes at you.
- You are paralysed!
- The floating eye gazes at you.
- *** LOW HITPOINT WARNING! ***
- The floating eye gazes at you.
- *** LOW HITPOINT WARNING! ***
- You can move again.
- The floating eye gazes at you.
- You are paralysed!
- The floating eye gazes at you.
- *** LOW HITPOINT WARNING! ***
- The floating eye gazes at you.
- *** LOW HITPOINT WARNING! ***
- You can move again.
- The floating eye gazes at you.
- You are paralysed!
- The floating eye gazes at you.
- *** LOW HITPOINT WARNING! ***
- You can move again.

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
- f) a Wooden Torch (4504 turns)
- g) Soft Leather Armour [8,+0]
- h) -
- i) -
- j) -
- k) -
- l) -

## The home (what the character stashed in town)

- (nothing)

## Recent decisions (the last 30, oldest first; at = depth:x,y; alone = nothing visible)

- #334 1:124,45 alone=no walk
- #335 1:123,45 alone=no walk
- #336 1:124,45 alone=no walk
- #337 1:123,45 alone=no walk
- #338 1:124,45 alone=no walk
- #339 1:123,45 alone=no walk
- #340 1:124,45 alone=no walk
- #341 1:123,45 alone=no walk
- #342 1:124,45 alone=no walk
- #343 1:123,45 alone=no walk
- #344 1:124,45 alone=no walk
- #345 1:123,45 alone=no walk
- #346 1:124,45 alone=no walk
- #347 1:123,45 alone=no walk
- #348 1:124,45 alone=no walk
- #349 1:123,45 alone=no walk
- #350 1:124,45 alone=no walk
- #351 1:123,45 alone=no walk
- #352 1:124,45 alone=no walk
- #353 1:123,45 alone=no walk
- #354 1:124,45 alone=no walk
- #355 1:123,45 alone=no walk
- #356 1:124,45 alone=no walk
- #357 1:123,45 alone=no walk
- #358 1:124,45 alone=no walk
- #359 1:123,45 alone=no walk
- #360 1:124,45 alone=no walk
- #361 1:123,45 alone=no walk
- #362 1:124,45 alone=no walk
- #363 1:123,45 alone=no walk

## Command census (to the boundary)

- ascend x5
- descend x6
- pickup x1
- quaff x1
- rest x5
- walk x345

## Provenance

- seed 20, life 1 - record `docs/runs/2026-11-03-stage-baseline-c2d1` (stage-baseline-c2d1)
- engine @rpgm-tools/neo-angband-core 1.23.0-beta.1 (the record's engine: @rpgm-tools/neo-angband-core 1.23.0-beta.1); content neo-angband@b53ff5f0b
- borg warrior pack (stock parameters); decision cap 10000
- watched-lineage replay (a death the MOD played, seed unknown to it) needs the upstream seed seam: neo-angband#431

