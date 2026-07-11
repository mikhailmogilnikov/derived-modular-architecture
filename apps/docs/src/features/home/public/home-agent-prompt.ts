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

export const agentPromptZh = `在这个 workspace 中应用 Derived Modular Architecture（DMA）。规则来自文件系统 + 导入图（import graph），而非主观喜好。

1. 如果 dma agent skill 还没装，先安装：
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma

2. 检查真实的目录树和导入关系。先查看是否有 dma.config.*（srcRoot、compositionRoots、monorepo roots）。不要假设 FSD 风格的分层（widgets、entities、barrels）。

3. 安全地初始化（绝不覆盖已有文件）：
   npx @derived-modular/cli init .
   在 monorepo 中要在具体的应用包内运行（除非有意为之，否则不要在 workspace 根目录运行）。它会创建缺失的 src 布局、dma.config.ts、scripts.dma，并且仅在没有标记时才向 AGENTS.md 追加 DMA 段落。

4. 针对这个仓库给出具体的下一步：
   - 全新项目（greenfield）还是渐进式迁移
   - 目录布局（app/pages/routes + features + shared；services 仅在 promotion 时出现）
   - 在 CI 中运行 dma check；可选的 ESLint / Oxlint / Biome 插件（文件级——不能替代 dma check）
   - 最先要移动或修复的文件（直接的 */public/* 导入、无 barrels、无 feature→feature）

5. 遵循 dma skill 的 placement 算法。用以下命令验证：
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json
   在根目录没有 src/ 的 monorepo 中：dma check . 会发现各个 app，或使用 --roots apps/web,apps/admin。

先简要概述当前布局，并判断这是全新项目集成还是渐进式迁移。`;

export function getAgentPrompt(lang: string): string {
  if (lang === "ru") {
    return agentPromptRu;
  }
  if (lang === "zh") {
    return agentPromptZh;
  }
  return agentPromptEn;
}
