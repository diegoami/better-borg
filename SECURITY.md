# Mandos security policy

## Scope

This repository maintains the Mandos fork: its plugin, declared capabilities,
decision logic and emitted commands. A vulnerability introduced by that work
belongs to `diegoami/mandos`. A shared defect may also require a coordinated
upstream report; the upstream author is not the maintainer of this fork.

The Neo Angband engine owns mod loading, capability enforcement, controller
isolation, the shared API, archive handling and the host trust model. For
those components, follow the [upstream engine security policy](https://github.com/neostryder/neo-angband/blob/master/SECURITY.md).

## Reporting a vulnerability

Do not publish an undisclosed vulnerability in an issue or pull request.
Contact the known Mandos maintainer, [diegoami](https://github.com/diegoami),
to arrange a private reporting route before sending confidential details.
This policy does not promise a particular private channel or publish a
Mandos security email address. The `strider-angband` address in upstream's
policy belongs to that project, not this fork.

Once a private route is agreed, identify Mandos, the affected tag or commit,
relevant capability or operation, reproduction steps and expected impact.
Ordinary gameplay defects without security impact belong in the
[Mandos issue tracker](https://github.com/diegoami/mandos/issues).
