# Agent skills

Installable skills for [skills.sh](https://skills.sh/) / `npx skills`.

## `dma`

Derived Modular Architecture — agent-oriented placement checklist (normative rules live in [`spec/`](../spec/)).

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
```

List skills in this repo:

```bash
npx skills add mikhailmogilnikov/derived-modular-architecture --list
```

## Related tooling (npm)

| Package | Role |
| --- | --- |
| `@derived-modular/cli` | `dma check` / `dma doctor` — full audit |
| `@derived-modular/eslint-plugin` | File-scoped ESLint rules |
| `@derived-modular/oxlint-plugin` | Same rules for Oxlint |
| `@derived-modular/biome-plugin` | Best-effort Biome GritQL |

Spec: [spec/README.md](../spec/README.md) · Skill source: [dma/SKILL.md](./dma/SKILL.md)
