/**
 * The manifest's capability list.
 *
 * Which capabilities the code needs is the SDK checker's job (`pnpm
 * capabilities`, which runs `neo-angband-mod-check --first-party` over the
 * built plugin and this manifest), because API 2 gates each domain call on a
 * grant and the checker holds the table that says which. What the checker
 * cannot say is that a grant is wider than it needs to be, so this file keeps
 * the two promises about the list that are the Borg's own.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function capabilities(): readonly string[] {
  return (JSON.parse(readFileSync(join(repoRoot, "manifest.json"), "utf8")) as { data: { capabilities: readonly string[] } }).data.capabilities;
}

describe("manifest capabilities", () => {
  it("carries the mod's identity consistently (the #19 rename, pinned)", () => {
    /* The id is load-bearing everywhere: the install folder's name must equal
       it (disk-packs rule), the lab-trust id must equal it, and install
       storage is keyed by it. A silent edit to any of these three surfaces -
       id, name, repository - strands a player's install, so the trio is
       pinned here. The run-record schema id is NOT part of this: it is a
       format identifier committed into existing records and deliberately
       keeps the better-borg name (rule 8). */
    const data = JSON.parse(readFileSync(join(repoRoot, "manifest.json"), "utf8")) as { data: { id: string; name: string; repository: string } };
    expect(data.data.id).toBe("mandos");
    expect(data.data.name).toBe("Mandos");
    expect(data.data.repository).toBe("https://github.com/diegoami/mandos");
  });

  it("asks for no wildcard read", () => {
    /* `state:*.read` would cover every domain in one line and would grant a
       domain the mod does not read today and any domain a newer engine adds.
       The consent screen a player reads before handing over a character lists
       these, so the list is worth keeping honest. */
    expect(capabilities()).not.toContain("state:*.read");
  });

  it("holds the three grants the game checks before it calls a controller", () => {
    /* Without state:interaction.read the game never calls the controller, and without the two input grants every intent and prompt answer is refused. Nothing else says so: the SDK checker does not flag their absence, and the failure is a character that holds the keyboard and never moves. */
    for (const grant of ["state:interaction.read", "input:intent", "input:prompt.reply"]) expect(capabilities()).toContain(grant);
  });

  it("declares the two hidden reads the Borg makes, the turn it reads, and the events it reads", () => {
    /* truth.monsters and truth.race are the allowlist in src/api2/truth.ts, and the game opens exactly those two with state:monsters-actual.read. The real map is never read, so state:map-actual.read stays out of the list. world().turn is filled only with state:turn.read. The run-end event is the restart loop's only trigger: a death report is the one thing that may start the next character. The dungeonlevel event is the journal's depth milestones: the arrival the game announces is the only honest moment a depth was reached. The player-command event is the replay demonstration log's rail (#29): the web shell emits it per command taken, and from the release on it is the human's move log. */
    expect(capabilities()).toContain("state:monsters-actual.read");
    expect(capabilities()).toContain("state:turn.read");
    expect(capabilities()).not.toContain("state:map-actual.read");
    expect(capabilities()).toContain("event:message");
    expect(capabilities()).toContain("event:run-end");
    expect(capabilities()).toContain("event:dungeonlevel");
    expect(capabilities()).toContain("event:player-command");
  });

  it("declares session:control for the retire path, and nothing wider", () => {
    /* #25: the ONLY thing this mod does with the session domain is
     * session.save() - the one call a retire-on-attainment makes to keep
     * the character's save before renaming it into the library. The host's
     * own game-menu rows confirm before these calls; the mod makes no
     * dialog because retirement is unattended BY DESIGN - the stage
     * settings the owner set are the consent, and exitToTitle/quit (the
     * rest of what session:control permits) are never called. The grant is
     * as narrow as the host's vocabulary allows: there is no save-only
     * capability to ask for. */
    expect(capabilities()).toContain("session:control");
  });

  it("holds the title seams the New Borg character row needs", () => {
    for (const grant of ["ui:title", "profiles:manage"]) expect(capabilities()).toContain(grant);
  });

  it("lists each capability once", () => {
    expect(new Set(capabilities()).size).toBe(capabilities().length);
  });
});
