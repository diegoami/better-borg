# Mandos166 live export bridge proof

This is a fresh disposable published-Core Human Mage seed3, cap600. It died
naturally at turn1960 after116 decisions, to a kobold shaman. This is a terminal
capture/export integration proof, not evidence of improved survival or a new
root-cause diagnosis.

[host-receipt.json](host-receipt.json) records the actual result and packet /
download SHA-256 values. The raw bounded packet and temporary corpus are not
committed here. The executable proof verifies all bytes before deleting its
temporary persistent backing.

```sh
flock /tmp/angband-validation.lock node tools/prove-live-deaths.mjs \
  --frontend-repository /path/to/neo-angband-tracker
```

The frontend is copied from immutable Git objects at
`9d6ae21ec5f733134f8411414359bae3019c7c2d`, the recorded lab-source profile.
The game uses Mandos's installed published `1.23.0-beta.2` Core/content and
carried package patch, independently of that frontend source. Real
`buildRunReport`, `createRunReports`, `createApi2Host`, `modKeyValueStore` and
panel mount validation are unmodified. The proof explicitly publishes the
report after the actual Core death. A fresh API2 host/recorder then reads a
file-backed temporary KV store, exports declarative panel download bytes,
imports them into a verified offline corpus and acknowledges only the matching
new packet. The actual public KV key is removed, while a legacy control key
remains. There is no Electron launch, tombstone interaction, lab deployment or
private profile access. The first-party tier matches the lab launcher's
`--lab-trust=mandos`; public tier deliberately omits the report.

Plain Node has no Vite build macros. The proof replaces unused bundled
mod/content discovery `import.meta.glob` with an empty registry and production
DEV/PROD constants; it resolves the frontend's installed `fflate` dependency.
This adapter does not replace report/broker/storage/panel behavior. The injected
panel renderer captures the actual declarative download string; a real browser
file dialog is outside this proof.

Automated controls separately compare complete commands/arguments, pre-states,
terminal facts and both game/Borg RNG with capture on/off. A contract regression
introduces messages during asynchronous loadout settling and after the final
decision: only batches actually consumed by the controller enter the report,
with no additional drain or changed commands/RNG/read counts. Another seals an
unidentified potion before terminal revelation and mutation. Storage refusals,
swallowed writes, identity conflicts, restart retry, fresh-recorder recovery,
reviewed import/hash failures, optional UI refusal and exact ACK matching are
covered without playing the lab.
