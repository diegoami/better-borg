# Repository reorganization review records

These tracked files are available from a fresh clone of Mandos; an untracked umbrella directory is not required.

- [Coordinator dossier](REPOSITORY-REORGANIZATION.md): purposes, changes, migration tables and evidence, with explicit review corrections.
- [Original review request](REVIEW-REQUEST.md): scope and output contract (local paths describe the original host).
- [Independent review](REPOSITORY-REORGANIZATION-REVIEW.md): verbatim original, **CHANGES REQUESTED**.
- [Coordinator response](REVIEW-RESPONSE.md): R1–R5 corrections and deferred optional suggestions.

The reviewer owns the verdict. Any follow-up review must be a separate file and identify new commit heads; never rewrite the original into an approval. Source proposal branches still exclude bootstrap/review commits.

Public archive note: coordinator dossier/request paths use `<ANGBAND_WORKSPACE>`
in place of the original host's absolute workspace path. Their operational
content is preserved; the independent review itself is copied without edits.
