export const agentPromptEn = `Apply Derived Modular Architecture (DMA) to this workspace. Rules come from the filesystem + import graph — not taste.

1. Install the dma agent skill if it is not available yet, then READ the full SKILL.md before acting:
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
   Follow its placement algorithm and onboarding checklist end-to-end — don't stop halfway.

2. Inspect the actual tree and imports. Check for dma.config.* first (srcRoot, compositionRoots, monorepo roots). Do not assume or invent extra module layers or barrels.

3. Onboard to completion — init only scaffolds, YOU finish the no-ops it leaves:
   npx @derived-modular/cli init .
   Run inside the app package in a monorepo (not the workspace root unless intentional). Creates missing src layout, an empty dma.config.ts, scripts.dma, and appends a DMA block to AGENTS.md only if markers are absent. Then:
   - Reflect the real layout in dma.config.*: only set fields that differ from defaults (srcRoot "src", compositionRoots ["app","pages","routes"]). e.g. src/routes matches defaults → leave empty; a non-src root or a single custom composition root → set srcRoot / compositionRoots.
   - Wire the linter the repo ALREADY uses (detect, do not add a new one): biome.json(c)/ultracite → @derived-modular/biome-plugin; eslint.config.*/.eslintrc* → @derived-modular/eslint-plugin; .oxlintrc.json → @derived-modular/oxlint-plugin. Install that one and add it to the existing config. No linter present → skip.
   - Ensure dma check . runs in CI (file-scoped linters are not a substitute for dma check).

4. Propose concrete next steps for this repo:
   - greenfield vs incremental migration
   - first files to move or fix (direct */public/* imports, no barrels, no feature→feature)

5. Verify:
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json
   In a monorepo without src/ at the root: dma check . discovers apps, or use --roots apps/web,apps/admin.

Start with a short summary of the current layout and whether this is greenfield integration or incremental migration.`;

export const agentPromptRu = `Примени Derived Modular Architecture (DMA) в этом workspace. Правила выводятся из файловой системы и графа импортов — не из вкуса.

1. Установи agent skill dma, если его ещё нет, и ПРОЧИТАЙ SKILL.md целиком перед действиями:
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
   Следуй его placement algorithm и onboarding-чеклисту до конца — не останавливайся на половине.

2. Изучи реальное дерево и импорты. Сначала проверь dma.config.* (srcRoot, compositionRoots, monorepo roots). Не предполагай и не выдумывай лишние слои модулей или barrels.

3. Доведи onboarding до конца — init только создаёт каркас, остальное завершаешь ТЫ:
   npx @derived-modular/cli init .
   В monorepo запускай внутри app-пакета (не в корне workspace, если это не задумано). Создаёт недостающий layout в src, пустой dma.config.ts, scripts.dma и дописывает блок DMA в AGENTS.md только если маркеров ещё нет. Затем:
   - Отрази реальный layout в dma.config.*: пиши только то, что отличается от дефолтов (srcRoot "src", compositionRoots ["app","pages","routes"]). Напр. src/routes совпадает с дефолтом → оставь пустым; не-src корень или единственный кастомный composition root → задай srcRoot / compositionRoots.
   - Подключи тот линтер, что УЖЕ стоит в репо (детект, не добавляй новый): biome.json(c)/ultracite → @derived-modular/biome-plugin; eslint.config.*/.eslintrc* → @derived-modular/eslint-plugin; .oxlintrc.json → @derived-modular/oxlint-plugin. Установи именно его и впиши в существующий конфиг. Линтера нет → пропусти.
   - Убедись, что dma check . запускается в CI (file-scoped линтеры не заменяют dma check).

4. Предложи конкретные шаги для этого репозитория:
   - greenfield или постепенная миграция
   - первые файлы для переноса или исправления (прямые */public/*, без barrels, без feature→feature)

5. Проверь:
   npx @derived-modular/cli check . --format json
   npx @derived-modular/cli doctor . --format json
   В monorepo без src/ в корне: dma check . находит apps, или --roots apps/web,apps/admin.

Начни с краткого обзора текущего layout и оцени: greenfield или incremental migration.`;

export const agentPromptZh = `在这个 workspace 中应用 Derived Modular Architecture（DMA）。规则来自文件系统 + 导入图（import graph），而非主观喜好。

1. 如果 dma agent skill 还没装，先安装，并在动手前完整阅读 SKILL.md：
   npx skills add mikhailmogilnikov/derived-modular-architecture --skill dma
   完整走完它的 placement 算法与 onboarding 清单——不要中途停下。

2. 检查真实的目录树和导入关系。先查看是否有 dma.config.*（srcRoot、compositionRoots、monorepo roots）。不要假设或发明额外的模块层或 barrels。

3. 把 onboarding 做完整——init 只搭骨架，剩下的空操作由你补齐：
   npx @derived-modular/cli init .
   在 monorepo 中要在具体的应用包内运行（除非有意为之，否则不要在 workspace 根目录运行）。它会创建缺失的 src 布局、空的 dma.config.ts、scripts.dma，并且仅在没有标记时才向 AGENTS.md 追加 DMA 段落。然后：
   - 让 dma.config.* 反映真实布局：只写与默认值不同的字段（srcRoot "src"、compositionRoots ["app","pages","routes"]）。例如 src/routes 与默认一致 → 留空；非 src 根目录或单一自定义 composition root → 设置 srcRoot / compositionRoots。
   - 接入仓库已在用的那个 linter（检测，不要新增）：biome.json(c)/ultracite → @derived-modular/biome-plugin；eslint.config.*/.eslintrc* → @derived-modular/eslint-plugin；.oxlintrc.json → @derived-modular/oxlint-plugin。只安装那一个并写入现有配置。没有 linter → 跳过。
   - 确保 CI 中运行 dma check .（文件级 linter 不能替代 dma check）。

4. 针对这个仓库给出具体的下一步：
   - 全新项目（greenfield）还是渐进式迁移
   - 最先要移动或修复的文件（直接的 */public/* 导入、无 barrels、无 feature→feature）

5. 验证：
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
