import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { InitAction } from "./init-types";

export const DMA_BEGIN = "<!-- dma:begin -->";
export const DMA_END = "<!-- dma:end -->";

const DMA_HEADING_RE = /^##\s+.*\bDMA\b/im;

export const DMA_AGENTS_BLOCK = `${DMA_BEGIN}
## Derived Modular Architecture (DMA)

Rules come from the filesystem + import graph — not taste.

- Composition root: \`src/app/\` (or \`pages/\` / \`routes/\`) — thin mounts of \`*/public/*\`
- \`features/\` — leaf modules (no inbound edges from other modules)
- \`services/\` — only after a module is imported by another module
- \`shared/\` — portable helpers on second use
- Cross-module imports: direct \`*/public/*\` paths — no barrel \`index.ts\`
- \`feature → feature\` is forbidden; \`import type\` counts as an edge

Verify: \`npx @derived-modular/cli check .\` (always in CI).

Agent skill:

\`\`\`bash
npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
\`\`\`

${DMA_END}
`;

export const ensureAgentsMd = (projectRoot: string): InitAction[] => {
  const agentsPath = join(resolve(projectRoot), "AGENTS.md");

  if (!existsSync(agentsPath)) {
    writeFileSync(agentsPath, `${DMA_AGENTS_BLOCK}\n`);
    return [{ action: "created", path: agentsPath }];
  }

  let content: string;
  try {
    content = readFileSync(agentsPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      {
        action: "warned",
        note: `unreadable — ${message}`,
        path: agentsPath,
      },
    ];
  }

  if (content.includes(DMA_BEGIN) || content.includes(DMA_END)) {
    return [
      {
        action: "skipped",
        note: "DMA markers already present",
        path: agentsPath,
      },
    ];
  }

  if (DMA_HEADING_RE.test(content)) {
    return [
      {
        action: "warned",
        note: "DMA-like heading found without markers — skipped append",
        path: agentsPath,
      },
    ];
  }

  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  writeFileSync(agentsPath, `${content}${separator}${DMA_AGENTS_BLOCK}\n`);
  return [{ action: "appended", path: agentsPath }];
};
