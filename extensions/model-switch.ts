import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// /pro and /flash switch the session model and pin thinking to xhigh.
const SWITCHES: Record<string, { provider: string; id: string }> = {
  pro: { provider: "ollama-cloud", id: "deepseek-v4-pro:0813" },
  flash: { provider: "ollama-cloud", id: "deepseek-v4.1-flash:1017" },
};

export default function (pi: ExtensionAPI) {
  for (const [name, { provider, id }] of Object.entries(SWITCHES)) {
    pi.registerCommand(name, {
      description: `Switch to ${id} with xhigh thinking`,
      handler: async (_args, ctx) => {
        const model = ctx.modelRegistry.find(provider, id);
        if (!model) {
          ctx.ui.notify(`Model not found: ${provider}/${id}`, "error");
          return;
        }
        const ok = await pi.setModel(model);
        if (!ok) {
          ctx.ui.notify(`No auth configured for ${provider}`, "error");
          return;
        }
        pi.setThinkingLevel("xhigh");
        ctx.ui.notify(`Switched to ${id} · thinking xhigh`, "info");
      },
    });
  }
}
