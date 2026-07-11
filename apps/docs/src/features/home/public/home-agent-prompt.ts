export const agentPromptEn = `Apply Derived Modular Architecture (DMA) to this workspace. Rules come from the filesystem + import graph — not taste.

1. Install the dma agent skill if it is not available yet:
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma

2. Inspect the actual tree and imports. Check for dma.config.* first (srcRoot, compositionRoots, monorepo roots). Do not assume FSD-style layers (widgets, entities, barrels).

3. Bootstrap safely (never overwrites existing files):
   npx @derived-modular/cli init .
   Run inside the app package in a monorepo (not the workspace root unless intentional). Creates missing src layout, dma.config.ts, scripts.dma, and appends a DMA block to AGENTS.md only if markers are absent.

4. Propose concrete next steps for this repo:
   - greenfield vs incremental migration
   - folder layout (app/pages/routes + features + shared; services only on promotion)
   - dma check in CI; optional ESLint / Oxlint / Biome plugin (file-scoped — not a substitute for dma check)
   - first files to move or fix (direct */public/* imports, no barrels, no feature→feature)

5. Follow the dma skill placement algorithm. Verify with:
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json
   In a monorepo without src/ at the root: dma check . discovers apps, or use --roots apps/web,apps/admin.

Start with a short summary of the current layout and whether this is greenfield integration or incremental migration.`;

export const agentPromptRu = `Примени Derived Modular Architecture (DMA) в этом workspace. Правила выводятся из файловой системы и графа импортов — не из вкуса.

1. Установи agent skill dma, если его ещё нет:
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma

2. Изучи реальное дерево и импорты. Сначала проверь dma.config.* (srcRoot, compositionRoots, monorepo roots). Не предполагай FSD-слои (widgets, entities, barrels).

3. Безопасный bootstrap (не перезаписывает существующие файлы):
   npx @derived-modular/cli init .
   В monorepo запускай внутри app-пакета (не в корне workspace, если это не задумано). Создаёт недостающий layout в src, dma.config.ts, scripts.dma и дописывает блок DMA в AGENTS.md только если маркеров ещё нет.

4. Предложи конкретные шаги для этого репозитория:
   - greenfield или постепенная миграция
   - layout (app/pages/routes + features + shared; services только при promotion)
   - dma check в CI; опционально ESLint / Oxlint / Biome (file-scoped — не замена dma check)
   - первые файлы для переноса или исправления (прямые */public/*, без barrels, без feature→feature)

5. Следуй placement algorithm из skill dma. Проверь:
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json
   В monorepo без src/ в корне: dma check . находит apps, или --roots apps/web,apps/admin.

Начни с краткого обзора текущего layout и оцени: greenfield или incremental migration.`;

export function getAgentPrompt(lang: string): string {
  return lang === "ru" ? agentPromptRu : agentPromptEn;
}
