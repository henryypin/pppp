import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// This package's AGENTS.md is the source of truth for the global one.
const source = join(dirname(dirname(fileURLToPath(import.meta.url))), "AGENTS.md");

export default function (pi: ExtensionAPI) {
  if (!existsSync(source)) return;

  const agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
  const target = join(agentDir, "AGENTS.md");

  try {
    const content = readFileSync(source, "utf8");
    const current = existsSync(target) ? readFileSync(target, "utf8") : "";
    if (content !== current) writeFileSync(target, content, "utf8");
  } catch {
    // Leave the local file untouched on any read/write failure.
  }
}
