# Independent component sessions and parent coordination

| Session | Repository | Root under the Angband umbrella | Owns |
| --- | --- | --- | --- |
| C/game/engine fixes | [diegoami/neo-angband-tracker](https://github.com/diegoami/neo-angband-tracker) | neo-angband-tracker/ | C Borg, C Angband game, Neo engine; C branch/worktree in this same fork |
| Port fixes | [diegoami/neo-angband-borg-mod-tracker](https://github.com/diegoami/neo-angband-borg-mod-tracker) | neo-angband-borg-mod-tracker/ | Upstream TypeScript Borg port defects and isolated Neo proposals |
| Native C consumer | [diegoami/better-borg-c](https://github.com/diegoami/better-borg-c) | better-borg-c/ | Native product measurement, linked adoption/carry; source repairs stay on the engine/C tracker |
| Mandos development | [diegoami/mandos](https://github.com/diegoami/mandos) | better-borg/ | Mandos-only behavior, harness/lab, integration and verified adoption |

Each session reads its own AGENTS/RULES/PLAN/checkpoint. It does not inherit
another repository's queue or start fixing a different component silently.
The old neo-angband lab checkout and pristine neo-angband-upstream / original
neo-angband-mod-borg checkouts are retained references, not these workspaces.
Do not change the live lab or its mandos-lab-data while bootstrapping.

One GitHub Angband fork network is available: our neo-angband fork therefore
hosts Neo engine master and the separately based C workbench/reference topic
branches. A C proposal must never be based on Neo TypeScript master. The
native C worktree is .worktrees/angband-c inside the engine session root;
it is part of the same source-tracker repository/session. A separately launched
native-C proposal
lane uses this worktree; it is not the better-borg-c consumer product.

Upstream reports stay on angband/angband or the appropriate neostryder repo
only under the standing posting rules. Our fork issues are our canonical
trackers; transferred Mandos URLs remain historical redirects. See the
migration ledger and each checkpoint for exact current issue numbers.

## C correction flow and independent Rust peer

The engine/C tracker proves/proposes C fixes and reads incoming reports on its
own board. borg-rs now posts directly there: do not poll/fetch its repository,
files or external issues, and do not dispatch Rust work. Mandos independently
translates applicable C corrections into TS and carries/adopts them. The
fidelity-only Neo Borg mod tracker does not perform that translation service.
borg-rs independently translates/adopts C corrections in Rust, without a Neo
responsibility; its historical read-only reference is not a managed session.

The umbrella parent coordinates scoped dispatch, dependencies and verified
recovery metadata; it does not take component code ownership. Read the owning
repository instructions/checkpoint before acting. Broad reconciliation is a
weekly manual batch; targeted active blockers and closure checks remain timely.
For death discussions, follow [the active-session start/stop read contract](deaths/DISCUSSIONS.md).
No unattended reader exists. [Window profiles](deaths/WINDOWS.md) use actual Neo
turns and preserve legacy evidence, independently of native C gameplay/saves.
