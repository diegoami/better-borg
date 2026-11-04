# B76 warrior c2d1 control

Kind: DEFECT in our API2 retry handling, introduced by B50.
The controller now restores its pending wear/recharge continuation when
settling loadout questions repeats a speculative decision.

The Half-Troll Warrior cohort (seeds 20/23/34/49, cap 10000, stage c2d1)
remains 4/4 at decisions 204/582/153/343. Every per-life fact matches B50
except wall-clock metadata. The direct headless harness does not need API2
loadout retries; two API2 integration scenarios are the targeted proxy.

The runner captured code `a701730`. The following commit normalizes the
optional snapshot field to false (buildThinkSession already initializes it
to false) for strict typing and rebuilds plugin.js. This changes no command
in this control. Older records remain untouched.
