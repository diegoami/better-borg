# CBUG-0086: visible Itangast is not an unseen attacker

Mandos consumer [165](https://github.com/diegoami/mandos/issues/165), canonical C
[source102](https://github.com/diegoami/neo-angband-tracker/issues/102), reviewed
C proposal [cad765806](https://github.com/diegoami/neo-angband-tracker/commit/cad765806eed6431642ab02b53240d7938470c21).
Discovery credit: borg-rs. Native and TypeScript validation remain distinct.

A public attack message names a visible, tracked Itangast standing next to the
Borg. The inherited two-character test calls that name the unseen pronoun It.
The full defense chooser then requests a True Seeing potion. Requiring the
complete pronoun stops that request while preserving actual unseen attackers.

## Verification: exact source and changed behavior

TS base: `2690ae09c4166332fa9f5ff8f032e0fb52327bcc`. Independent translation:
`81600f90ab4e780a05333eb4aa4a988ed431c518`.
[Old predicate and caller](https://github.com/diegoami/mandos/blob/2690ae09c4166332fa9f5ff8f032e0fb52327bcc/src/perceive-messages.ts#L270-L320)
and [corrected predicate](https://github.com/diegoami/mandos/blob/81600f90ab4e780a05333eb4aa4a988ed431c518/src/perceive-messages.ts#L270-L281)
make the causal change inspectable. The Something prefix and lower-case fold
are unchanged; `lower.startsWith("it")` becomes `lower === "it"`.
The surrounding hit/miss parsing, fear formulas and defense policy do not change.
The independent [TS patch unit](../../../patches/c-translations/CBUG-0086-exact-unseen-name.patch)
records this Mandos departure from the uncorrected C/Neo baseline.

The same six-case file is used before and after, SHA256
`3e3665158d6748cced1ce094d8e9288d03bc84b19446fc9fe4586b20a4a9bc92`.
All fixture identity/knowledge assertions pass. Before: **2 complete expected
regression failures /4 passing controls**; after: **6/6**, plus existing
perception/defense controls **112/112 across3 files**,2.03seconds. Typecheck and
session check pass. This source-only handoff does not claim a rebuilt plugin or
full consumer gate; the final combined integration supplies those separately.

| Public message | Before | After |
| --- | --- | --- |
| Itangast misses you | False unseen stamp100/fear22; quaff; spends1 potion | Stamp0/fear0; no command; spends0 |
| Itangast claws you | False unseen stamp100/fear44; quaff; spends1 potion | Stamp0/fear0; no command; spends0 |
| The Ogre misses you | Recognized; no detection or potion | Complete observation unchanged |
| It /it /Something misses you | Unseen stamp100/fear22; spends1 potion | All3 complete observations unchanged |

Actual calculated danger starts448 for the visible dragon. False regional fear
raises it to470 or492 before correction; afterward it remains448. These are
Borg decision scores, not HP loss. Avoidance is derived from noticed current
HP421, so all three values are below the unchanged detection limit842. The
fixture does not inject a positive defense score or replace the danger resolver.
The actual full `borgDefend` chooser selects the action, not a copied helper.

The requested command is exactly `quaff` with real potion handle7. The real
registered engine quaff handler consumes one of two True Seeing potions and
returns100 action energy before; no command is executed afterward. The real
transaction character's19 HP stays19. All four complete control JSON records
in before.json and after.json are identical, not just a selected counter.
Vitest timings/log headers naturally differ and are not claimed byte-identical.

## Reproduce in a fresh disposable comparison

Prerequisites: a Mandos clone, matching frozen dependencies installed with
`pnpm install --frozen-lockfile`, Node24.21.0, pnpm12.16.1, Python3 and flock.
From that clone (no lab or workstation save is needed):

```sh
git fetch --no-tags origin task/cbug-0086-exact-unseen-name
git show FETCH_HEAD:docs/runs/2026-11-06-cbug0086/reproduce.py > /tmp/reproduce-mandos-cbug0086.py
python3 /tmp/reproduce-mandos-cbug0086.py
```

The runner checks dependency declarations/fixture hash, creates two fresh
immutable detached worktrees, links the declared installed dependencies and
runs the same public-message tests under the shared validation lock. It rejects
unexpected exits/summaries, changed complete controls and wrong potion outcomes.
It prints the output directory with full logs, JSON, exits and SHA256 manifest.
The exact published runner was executed successfully; reproduce.log retains
that result. The helper intentionally does not run the unrelated full suite or
change the live checkout. Temporary trees are retained for inspection.

Copyable source inspection, with no game/profile changes:

```sh
git grep -n -E 'isInvisibleAttacker|locateAttacker|needSeeInvis' 2690ae09c4166332fa9f5ff8f032e0fb52327bcc -- src/perceive-messages.ts
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/perceive-messages.ts | sed -n '270,320p;530,561p'
git show 2690ae09c4166332fa9f5ff8f032e0fb52327bcc:src/fight/defend.ts | sed -n '692,726p'
git diff 2690ae09c4166332fa9f5ff8f032e0fb52327bcc 81600f90ab4e780a05333eb4aa4a988ed431c518 -- src/perceive-messages.ts
```

The exhaustive source-file search classifies the predicate definition, its
single attacker-lookup caller, the unseen-timestamp write, and the hit/miss/
spell call sites. The decisive branch sets needSeeInvis before known-name
lookup. The defense routine reads elapsed time and available resources before
requesting the potion. Existing Something recognition stays separate.

## Interventions and limits

This is an isolated public-view/message-to-defense comparison, not a natural
encounter or whole-game replay. The decision frame is a constructed Human
Warrior40 at depth52/421 HP, current light2, known Flames ring and temporary
fire protection50. Itangast is legally adjacent: player(20,12),monster(21,12).
Registered monster records supply actual race facts and bound blow templates;
no invented monster damage or forced danger score is used. Miss/hit message
strings model those registered messages; no actual monster attack occurs.

The item identities come from actual engine object preparation, assessed flags,
flavor knowledge, learned runes and public buildKnownWorld snapshots, followed
by the normal itemView adapter. Decision code sees only that public view.
Fixture code alone prepares live objects. The no-monster unseen controls model
what an observer cannot see, rather than adding a visible ghost.

The quaff transaction is deliberately a separate fresh native-TS engine
character with19 HP, sharing the actual potion handle/quantity. It proves the
command consumes a real potion; it does not turn the constructed421-HP decision
frame into a complete played encounter. No world turns/enemy attacks are run,
and no HP-loss, death, encounter-frequency or survival benefit is claimed.
Extra sight might help a future unseen enemy; this setup measures no such benefit.

[Native C evidence](https://github.com/diegoami/neo-angband-tracker/blob/3f36553e631db17de9821a4822141a81739b56bf/docs/audit/c-reports/CBUG-0086/README.md)
independently measures its own potion consequence. Those native damage/timing
figures are not copied as TS observations. Setup-only debugging (flavor-awareness,
registry Map iteration, type decoding and command quoting) is excluded from the
frozen before/after comparison; its ignored scratch logs are retained locally.

Published core/SDK/content beta.2, combined package patch, runtime fingerprint,
existing test assertions/seeds/caps/timeouts, data/profile and lab are unchanged.
Source status remains owned by the tracker. After final verified integration,
consumer165 is carried/open until upstream correction and verified adoption;
a source-only patch or this focused report alone is not carried.
