# B99 upgraded desktop death and exact replay

Kind: verified behavior baseline after Neo parity adoption; no survival claim.
A real Neo desktop Human Mage, seed99110530, dies to a yellow mold on turn3167,
level1/depth1, gold319, score108, after98 submitted commands.

All98 commands and arguments and every pre-command turn, grid, HP, SP and
depth match the published-package headless driver. Full death facts and census
match. An uninstrumented desktop control has identical end facts and captured
birth RNG/options (run-slot identity differs). Its plugin hash equals the
committed production plugin; the observed copy only adds trace collection.

Desktop engine runtime is beta.2-mandos.2, source3408a1c4f, incorporating Neo
0cc75b4af plus our #429/#432/#433 carry. Later lab commit9d6ae21ec changes only
version documentation/parsing. The observed run was captured from the working
upgrade before commitc7fbfe1; runtime equality is established by the control
plugin hash, not by claiming the old working-tree HEAD describes those files.

The record uses the actual accepted birth RNG/options, same generic Mage pack,
and complete content. Both desktop runs use isolated profiles with declared
lab permissions; no owner character or save was edited. The observer calls no
game commands and draws no RNG.

The previous B54 desktop case stays byte-identical and valid for its recorded
controller/engine. The upgraded policy changes that death, so the current
replay test points here. Missing live boundaries remain honestly missed.
Raw observation/build logs and isolated profiles are retained in artifacts/.
