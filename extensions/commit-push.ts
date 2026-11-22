import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const STATUS_KEY = "commit-push";
const TIMEOUT_MS = 120_000;
const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function buildTask(message: string): string {
  return [
    "Commit and push this repository's current working-tree changes using git. Never edit, create, or delete files.",
    "",
    "1. Inspect: `git status --short` and `git diff`.",
    "2. Stage: `git add -A`, then check `git status --short` for secrets or build artifacts (`.env`, private keys, large binaries); unstage and report any you find.",
    message
      ? `3. Commit: use this message: ${JSON.stringify(message)}.`
      : "3. Commit: write a concise one-line conventional-commit message summarizing the diff.",
    "4. Push: `git push` to the current branch's upstream. If the branch has no upstream, stop and report it; never push to a new or force-pushed branch.",
    "",
    "Stop at the first failure and report the exact command and its error. Never force-push, amend, or rewrite history. Finish by reporting the branch, files changed, commit hash, and push result.",
  ].join("\n");
}

// Same resolution as pi-subagents' spawner: prefer the current pi script/runtime,
// fall back to `pi` on PATH.
export function getPiInvocation(args: string[]): { command: string; args: string[] } {
  const currentScript = process.argv[1];
  const isBunVirtualScript =
    currentScript !== undefined &&
    (currentScript.startsWith("/$bunfs/root/") || /^[A-Za-z]:[\\/]~BUN[\\/]root[\\/]/.test(currentScript));
  if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }
  const execName = path.basename(process.execPath).toLowerCase();
  const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
  if (!isGenericRuntime) {
    return { command: process.execPath, args };
  }
  return { command: "pi", args };
}

function tail(text: string, maxLines = 5, maxChars = 400): string {
  const lines = text.trim().split("\n").slice(-maxLines).join("\n");
  return lines.length > maxChars ? `${lines.slice(0, maxChars)}…` : lines;
}

export default function (pi: ExtensionAPI) {
  let active = false;

  pi.registerCommand("commit-push", {
    description: "Commit and push current changes in a background pi process",
    handler(args, ctx) {
      if (active) {
        ctx.ui.notify("commit-push is already running.", "warning");
        return;
      }

      let stdout = "";
      let stderr = "";
      let settled = false;

      const finish = (text: string, kind: "info" | "error") => {
        if (settled) return;
        settled = true;
        active = false;
        clearInterval(spinner);
        ctx.ui.setStatus(STATUS_KEY, undefined);
        ctx.ui.notify(text, kind);
      };

      active = true;
      let frame = 0;
      const spinner = setInterval(() => {
        ctx.ui.setStatus(STATUS_KEY, `${FRAMES[frame++ % FRAMES.length]} commit-push running…`);
      }, 120);
      ctx.ui.setStatus(STATUS_KEY, `${FRAMES[frame++ % FRAMES.length]} commit-push running…`);

      let child: ReturnType<typeof spawn>;
      try {
        const invocation = getPiInvocation([
          "-p",
          "--no-session",
          "--model",
          "ollama-cloud/deepseek-v4.1-flash:1017",
          "--thinking",
          "high",
          "--tools",
          "bash,read",
          buildTask(args.trim()),
        ]);
        child = spawn(invocation.command, invocation.args, {
          cwd: ctx.cwd,
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        finish(`commit-push failed to start: ${error instanceof Error ? error.message : String(error)}`, "error");
        return;
      }

      const timer = setTimeout(() => {
        finish("commit-push timed out after 120s; process stopped.", "error");
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
      }, TIMEOUT_MS);

      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("error", (error) => {
        clearTimeout(timer);
        finish(`commit-push failed to start: ${error.message}`, "error");
      });
      child.on("close", (code, signal) => {
        clearTimeout(timer);
        if (code === 0) {
          const report = tail(stdout);
          finish(report ? `commit-push done:\n${report}` : "commit-push done.", "info");
        } else {
          const report = tail(stderr || stdout);
          finish(
            `commit-push failed (exit ${code}${signal ? `, signal ${signal}` : ""})${report ? `:\n${report}` : "."}`,
            "error",
          );
        }
      });
    },
  });
}
