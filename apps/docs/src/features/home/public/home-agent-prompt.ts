export const agentPromptEn = `Install and use the DMA (Derived Modular Architecture) agent skill for this workspace.

1. Install the skill if it is not available yet:
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma

2. Inspect the actual src/ tree (app, pages, or routes, features, services if any, shared) and the import graph. Do not assume FSD-style layers.

3. Based on this repository, propose concrete next steps to integrate DMA or migrate toward it: folder layout, linter plugin, dma check, CI, and the first files to move or fix.

4. Follow the dma skill placement algorithm. Verify with:
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json

Start with a short summary of the current src/ layout and say whether this looks like greenfield integration or incremental migration.`;
