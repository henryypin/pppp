import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const AGENT = "commit-push";
const RPC_REQUEST = "subagents:rpc:v1:request";
const RPC_REPLY_PREFIX = "subagents:rpc:v1:reply:";

interface SpawnReply {
  version?: number;
  requestId?: string;
  success?: boolean;
  data?: { text?: string };
  error?: { code?: string; message?: string };
}

function spawnCommitPush(pi: ExtensionAPI, task: string, cwd: string): Promise<string> {
  const requestId = randomUUID();
  const replyEvent = `${RPC_REPLY_PREFIX}${requestId}`;

  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      reject(new Error("commit-push launch timed out; is pi-subagents loaded?"));
    }, 30_000);

    const off = pi.events.on(replyEvent, (raw: unknown) => {
      clearTimeout(timer);
      off();
      const reply = raw as SpawnReply;
      if (reply?.success && reply.data) {
        resolve(reply.data.text || "commit-push run started.");
      } else {
        reject(new Error(reply?.error?.message || "Failed to start the commit-push run."));
      }
    });

    pi.events.emit(RPC_REQUEST, {
      version: 1,
      requestId,
      method: "spawn",
      params: { agent: AGENT, task, context: "fresh", cwd },
    });
  });
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("commit-push", {
    description: "Commit and push current changes in a background subagent",
    async handler(args, ctx) {
      const message = args.trim();
      const task = `Commit and push the current working-tree changes. Commit message: ${message || "auto-generate from the diff."}`;
      try {
        const text = await spawnCommitPush(pi, task, ctx.cwd);
        ctx.ui.notify(text, "info");
      } catch (error) {
        ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
      }
    },
  });
}
