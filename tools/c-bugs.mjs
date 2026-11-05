#!/usr/bin/env node
/** Compatibility entry: current C catalogue is owned by the engine/C session. */
import { readFileSync } from "node:fs";
const ref=JSON.parse(readFileSync(new URL("../docs/c-bugs.json",import.meta.url),"utf8"));
if(ref.schema!=="angband/catalogue-location@1" || ref.repository!=="diegoami/neo-angband-tracker") throw new Error("Invalid catalogue location");
if(process.argv.includes("--write")) throw new Error("Generate the C catalogue in neo-angband-tracker, not Mandos: "+ref.page);
console.log("C catalogue owner: "+ref.page);
