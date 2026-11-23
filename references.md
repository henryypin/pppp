# Skill sources

Skills copied from upstream projects, so they can be re-synced later. Skills not listed here are written locally.

| Local path | Upstream | Pinned at | Copied | Notes |
| --- | --- | --- | --- | --- |
| `skills/technical-writing` | https://github.com/cursor/plugins/tree/main/pstack/skills/technical-writing | `35a9094` | 2026-06-10 | Unmodified. |
| `skills/unslop` | https://github.com/cursor/plugins/tree/main/pstack/skills/unslop | `35a9094` | 2026-06-10 | Unmodified. `technical-writing` refers to this skill by name. |
| `skills/in-your-own-words` | https://github.com/cursor/plugins/tree/main/pstack/skills/in-your-own-words | `dbf49813` | 2026-11-23 | Unmodified. |

All three upstream skills are MIT licensed, Copyright (c) 2026 Lauren Tan. The notice is in `LICENSE`.

To refresh a skill:

```bash
git clone --depth 1 https://github.com/cursor/plugins.git /tmp/cursor-plugins
cp /tmp/cursor-plugins/pstack/skills/<name>/SKILL.md skills/<name>/SKILL.md
```

Then update the pinned commit and the copied date in this table.
