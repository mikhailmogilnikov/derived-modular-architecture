import type { FileTreeNode } from "@/features/home/public/home-file-tree";
import { agentPromptCopy } from "@/shared/model/agent-prompt-copy";

export const homeCopy = {
  en: {
    badge: "Latest update: release v1.2.1",
    ctaAgentPrompt: agentPromptCopy.en.label,
    ctaAgentPromptTooltip: agentPromptCopy.en.tooltip,
    ctaCommand:
      "npm i -D @derived-modular/cli && npx @derived-modular/cli init .",
    ctaCommandCopied: "Copied",
    ctaCommandCopy: "Copy command",
    ctaLead:
      "Install the CLI, create the folder structure with one command, and check the architecture automatically — the same rules in your editor, your agent, and CI.",
    ctaPrimary: "Quick start",
    ctaSecondaryLink: "What is DMA",
    ctaTitle: "Rules in code, not in chat",
    footerGitHubAria: "View on GitHub",
    footerNav: [
      {
        links: [
          { href: "/docs/start/what-is-dma", label: "What is DMA" },
          { href: "/docs/start/quick-start", label: "Quick start" },
          { href: "/docs/start/project-layout", label: "Project layout" },
        ],
        title: "Getting started",
      },
      {
        links: [
          { href: "/docs/concepts/layers", label: "Layers" },
          { href: "/docs/concepts/placement", label: "Placement" },
          { href: "/docs/concepts/modules", label: "Modules" },
        ],
        title: "Concepts",
      },
      {
        links: [
          { href: "/docs/tooling/overview", label: "Overview" },
          { href: "/docs/tooling/cli/check", label: "Check" },
          { href: "/docs/tooling/ci", label: "CI" },
        ],
        title: "Tooling",
      },
      {
        links: [
          { href: "/docs/guides/migration", label: "Migration" },
          { href: "/docs/guides/vite-react", label: "Vite + React" },
          { href: "/docs/guides/nextjs", label: "Next.js" },
          { href: "/docs/guides/monorepo", label: "Monorepo" },
        ],
        title: "Guides",
      },
      {
        links: [
          { href: "/docs/tooling/ai-agents", label: "AI agents" },
          { href: "/docs/guides", label: "All guides" },
          { href: "/docs/deep-dive", label: "Deep dive" },
        ],
        title: "More",
      },
    ],
    heroLead:
      "DMA tells people and agents where frontend code lives and verifies boundaries through the linter, CLI, and CI.",
    heroTitle: "A modular architecture for",
    heroTooling: {
      aiSkill: {
        diff: { added: 3, path: "features/checkout/public/api.ts", removed: 1 },
        label: "Agent",
        skillLines: ["layers", "imports", "public"],
        studying: "Reading derived-modular skill",
      },
      cli: {
        command: "npx @derived-modular/cli check .",
        signal: "1 signal · stage-growth · checkout",
        success: "12 modules scanned",
      },
      release: {
        check: "dma check",
        deploy: "Deploy",
        install: "Install",
        workflow: "ci.yml",
      },
    },
    layers: [
      {
        description: "Entry point: routes and pages where the app starts.",
        name: "app",
      },
      {
        description:
          "Product flows mounted from app: catalog, checkout. No inbound edges from other modules; may import services and shared.",
        name: "features",
      },
      {
        description:
          "Shared product scenarios other modules depend on. Promoted when a second module needs the same code — e.g. catalog and checkout import services/cart.",
        name: "services",
      },
      {
        description: "Portable helpers and UI: dates, buttons, HTTP client.",
        name: "shared",
      },
    ],
    layersLead:
      "No components/, utils/, or ad-hoc folders by taste. The folder tree is the rulebook; linter and CI enforce it. One-way imports: a lower layer never imports a higher one.",
    layersTitle: "Four boundaries in src/",
    moduleStages: [
      {
        change:
          "Start with a single file, checkout.tsx. This module also holds the cart logic.",
        stage: "0",
        title: "File module",
      },
      {
        change:
          "Code in the module keeps growing, and decomposition makes sense. Checkout moves into a folder. checkout-page goes to public/, because the app layer above imports it. Cart files stay as internal dependencies of checkout, with no public access.",
        stage: "1",
        title: "Folder + public/",
      },
      {
        change:
          "Code inside checkout keeps growing. Cart files are split by role: ui/ for components, model/ for state and logic, api/ for requests, lib/ for helpers. It is still one checkout module, just better organized.",
        stage: "2",
        title: "Segments",
      },
      {
        change:
          "Catalog appears, and cart is now needed in two places. Catalog cannot import cart from checkout: check and the linter will catch it. Move cart to services/cart/ first, then both catalog and checkout import it from there.",
        stage: "3",
        title: "Move to services",
      },
      {
        change:
          "If cart is reused across apps, it can become a package at packages/cart/ with the same import rules.",
        stage: "4",
        title: "Package",
      },
    ],
    moduleStagesExplorer: "Explorer",
    moduleStagesLead:
      "You do not need the full folder tree on day one. Start with one file and add structure as the code grows.",
    moduleStagesNextAria: "Next stage",
    moduleStagesStageAria: "Stage",
    moduleStagesTitle: "The layout grows with the product",
    violationDemo: {
      command: "npx @derived-modular/cli check .",
      detail: "checkout → catalog/public/api.ts",
      editorLabel: "Problems",
      error: "feature-to-feature",
      fileName: "features/checkout/model.ts",
      importLine: 'import { getCatalog } from "@/features/catalog/public/api";',
      note: "One import graph. The same result in the editor and in CI.",
      terminalLabel: "terminal",
    },
    violationLead:
      "Rich tooling won't let you slip: linter, agent, and CLI enforce the same rules.",
    violationTitle: "Boundaries are checked, not debated",
  },
  ru: {
    badge: "Последнее обновление: релиз v1.2.1",
    ctaAgentPrompt: agentPromptCopy.ru.label,
    ctaAgentPromptTooltip: agentPromptCopy.ru.tooltip,
    ctaCommand:
      "npm i -D @derived-modular/cli && npx @derived-modular/cli init .",
    ctaCommandCopied: "Скопировано",
    ctaCommandCopy: "Скопировать команду",
    ctaLead:
      "Установите CLI, создайте структуру папок одной командой и проверяйте архитектуру автоматически — одни и те же правила в редакторе, у агента и при сборке.",
    ctaPrimary: "Быстрый старт",
    ctaSecondaryLink: "Что такое DMA",
    ctaTitle: "Правила в коде, а не в чате",
    footerGitHubAria: "Открыть на GitHub",
    footerNav: [
      {
        links: [
          { href: "/docs/start/what-is-dma", label: "Что такое DMA" },
          { href: "/docs/start/quick-start", label: "Быстрый старт" },
          { href: "/docs/start/project-layout", label: "Структура проекта" },
        ],
        title: "Начало",
      },
      {
        links: [
          { href: "/docs/concepts/layers", label: "Слои" },
          { href: "/docs/concepts/placement", label: "Куда положить файл" },
          { href: "/docs/concepts/modules", label: "Модули" },
        ],
        title: "Концепции",
      },
      {
        links: [
          { href: "/docs/tooling/overview", label: "Обзор" },
          { href: "/docs/tooling/cli/check", label: "Check" },
          { href: "/docs/tooling/ci", label: "CI" },
        ],
        title: "Инструменты",
      },
      {
        links: [
          { href: "/docs/guides/migration", label: "Миграция" },
          { href: "/docs/guides/vite-react", label: "Vite + React" },
          { href: "/docs/guides/nextjs", label: "Next.js" },
          { href: "/docs/guides/monorepo", label: "Монорепо" },
        ],
        title: "Гайды",
      },
      {
        links: [
          { href: "/docs/tooling/ai-agents", label: "AI-агенты" },
          { href: "/docs/guides", label: "Все гайды" },
          { href: "/docs/deep-dive", label: "Deep dive" },
        ],
        title: "Ещё",
      },
    ],
    heroLead:
      "DMA говорит людям и агентам, где живёт фронтенд-код, и проверяет границы через линтер, CLI и CI.",
    heroTitle: "Модульная архитектура для",
    heroTooling: {
      aiSkill: {
        diff: { added: 3, path: "features/checkout/public/api.ts", removed: 1 },
        label: "Agent",
        skillLines: ["layers", "imports", "public"],
        studying: "Изучаю skill derived-modular",
      },
      cli: {
        command: "npx @derived-modular/cli check .",
        signal: "1 сигнал · stage-growth · checkout",
        success: "12 модулей проверено",
      },
      release: {
        check: "dma check",
        deploy: "Deploy",
        install: "Install",
        workflow: "ci.yml",
      },
    },
    layers: [
      {
        description:
          "Точка входа: маршруты и страницы, с чего начинается приложение.",
        name: "app",
      },
      {
        description:
          "Продуктовые потоки, которые монтирует app: catalog, checkout. Нет входящих рёбер от других модулей; могут импортировать services и shared.",
        name: "features",
      },
      {
        description:
          "Общие продуктовые сценарии, от которых зависят другие модули. Появляются при promotion — например, catalog и checkout импортируют services/cart.",
        name: "services",
      },
      {
        description: "Переносимые хелперы и UI: даты, кнопки, HTTP-клиент.",
        name: "shared",
      },
    ],
    layersLead:
      "Без components, utils и прочего «на глаз». Дерево папок задаёт правила, линтер и CI проверяют. Импорты однонаправленные: нижестоящий слой не импортирует вышестоящий.",
    layersTitle: "Четыре границы в src/",
    moduleStages: [
      {
        change:
          "Начинаем с одного файла checkout.tsx. Этот модуль также содержит в себе логику корзины.",
        stage: "0",
        title: "Файл-модуль",
      },
      {
        change:
          "Кода в модуле становится больше, напрашивается декомпозиция. Checkout переезжает в папку. checkout-page кладём в public/, так как её импортирует вышестоящий слой app. Файлы корзины остаются внутренней зависимостью checkout, без публичного доступа.",
        stage: "1",
        title: "Папка + public/",
      },
      {
        change:
          "Кода внутри checkout становится ещё больше. Файлы корзины разносим по роли: ui/ для компонентов, model/ для состояния и логики, api/ для запросов, lib/ для хелперов. Это всё ещё один модуль checkout, просто аккуратнее разложенный.",
        stage: "2",
        title: "Сегменты",
      },
      {
        change:
          "Появляется catalog, и корзина нужна уже двум модулям. Из checkout в catalog её не перетащишь: check и линтер это не пропустят. Сначала выносим cart в services/cart/, потом оба подключают её оттуда.",
        stage: "3",
        title: "Вынос в services",
      },
      {
        change:
          "Если корзина нужна в нескольких приложениях, её можно оформить как пакет packages/cart/ с теми же правилами импортов.",
        stage: "4",
        title: "Пакет",
      },
    ],
    moduleStagesExplorer: "Explorer",
    moduleStagesLead:
      "Не нужно проектировать всю структуру заранее. Начните с одного файла и добавляйте папки по мере роста кода.",
    moduleStagesNextAria: "Следующая стадия",
    moduleStagesStageAria: "Стадия",
    moduleStagesTitle: "Структура растёт вместе с продуктом",
    violationDemo: {
      command: "npx @derived-modular/cli check .",
      detail: "checkout → catalog/public/api.ts",
      editorLabel: "Problems",
      error: "feature-to-feature",
      fileName: "features/checkout/model.ts",
      importLine: 'import { getCatalog } from "@/features/catalog/public/api";',
      note: "Один граф импортов. Один результат в редакторе и в CI.",
      terminalLabel: "terminal",
    },
    violationLead:
      "Ошибиться не даст богатый tooling: линтер, агент и CLI держат одни и те же правила.",
    violationTitle: "Границы проверяются, а не обсуждаются",
  },
  zh: {
    badge: "最新更新：release v1.2.1",
    ctaAgentPrompt: agentPromptCopy.zh.label,
    ctaAgentPromptTooltip: agentPromptCopy.zh.tooltip,
    ctaCommand:
      "npm i -D @derived-modular/cli && npx @derived-modular/cli init .",
    ctaCommandCopied: "已复制",
    ctaCommandCopy: "复制命令",
    ctaLead:
      "安装 CLI，用一条命令创建目录结构，并自动校验架构——在编辑器、智能体和 CI 中都是同一套规则。",
    ctaPrimary: "快速开始",
    ctaSecondaryLink: "什么是 DMA",
    ctaTitle: "规则写在代码里，而不是聊天里",
    footerGitHubAria: "在 GitHub 上查看",
    footerNav: [
      {
        links: [
          { href: "/docs/start/what-is-dma", label: "什么是 DMA" },
          { href: "/docs/start/quick-start", label: "快速开始" },
          { href: "/docs/start/project-layout", label: "项目布局" },
        ],
        title: "入门",
      },
      {
        links: [
          { href: "/docs/concepts/layers", label: "分层" },
          { href: "/docs/concepts/placement", label: "文件放置" },
          { href: "/docs/concepts/modules", label: "模块" },
        ],
        title: "概念",
      },
      {
        links: [
          { href: "/docs/tooling/overview", label: "概览" },
          { href: "/docs/tooling/cli/check", label: "Check" },
          { href: "/docs/tooling/ci", label: "CI" },
        ],
        title: "工具",
      },
      {
        links: [
          { href: "/docs/guides/migration", label: "迁移" },
          { href: "/docs/guides/vite-react", label: "Vite + React" },
          { href: "/docs/guides/nextjs", label: "Next.js" },
          { href: "/docs/guides/monorepo", label: "Monorepo" },
        ],
        title: "指南",
      },
      {
        links: [
          { href: "/docs/tooling/ai-agents", label: "AI 智能体" },
          { href: "/docs/guides", label: "全部指南" },
          { href: "/docs/deep-dive", label: "深入理解" },
        ],
        title: "更多",
      },
    ],
    heroLead:
      "DMA 告诉开发者和智能体前端代码应放在哪里，并通过 linter、CLI 和 CI 校验模块边界。",
    heroTitle: "模块化架构，面向",
    heroTooling: {
      aiSkill: {
        diff: { added: 3, path: "features/checkout/public/api.ts", removed: 1 },
        label: "Agent",
        skillLines: ["layers", "imports", "public"],
        studying: "正在阅读 derived-modular skill",
      },
      cli: {
        command: "npx @derived-modular/cli check .",
        signal: "1 个信号 · stage-growth · checkout",
        success: "已扫描 12 个模块",
      },
      release: {
        check: "dma check",
        deploy: "Deploy",
        install: "Install",
        workflow: "ci.yml",
      },
    },
    layers: [
      {
        description: "入口：应用启动的路由和页面。",
        name: "app",
      },
      {
        description:
          "由 app 挂载的产品流程：catalog、checkout。没有来自其他模块的入边；可以导入 services 和 shared。",
        name: "features",
      },
      {
        description:
          "其他模块依赖的共享产品场景。当第二个模块需要相同代码时通过 promotion 出现——例如 catalog 和 checkout 都导入 services/cart。",
        name: "services",
      },
      {
        description: "可移植的辅助代码和 UI：日期、按钮、HTTP 客户端。",
        name: "shared",
      },
    ],
    layersLead:
      "没有凭感觉建的 components、utils 之类的目录。目录树就是规则手册，linter 和 CI 负责执行。导入是单向的：下层永远不导入上层。",
    layersTitle: "src/ 中的四条边界",
    moduleStages: [
      {
        change: "从单个文件 checkout.tsx 开始。这个模块同时也包含购物车逻辑。",
        stage: "0",
        title: "文件模块",
      },
      {
        change:
          "模块里的代码越来越多，需要拆分。checkout 移入一个文件夹。checkout-page 放到 public/，因为上层的 app 会导入它。购物车文件作为 checkout 的内部依赖保留，不对外公开。",
        stage: "1",
        title: "文件夹 + public/",
      },
      {
        change:
          "checkout 内部的代码继续增长。购物车文件按角色拆分：ui/ 放组件，model/ 放状态和逻辑，api/ 放请求，lib/ 放辅助函数。它仍然是一个 checkout 模块，只是组织得更清晰。",
        stage: "2",
        title: "段（segments）",
      },
      {
        change:
          "出现了 catalog，购物车现在被两处需要。catalog 不能从 checkout 导入 cart：check 和 linter 会拦下它。先把 cart 移到 services/cart/，然后 catalog 和 checkout 都从那里导入。",
        stage: "3",
        title: "移入 services",
      },
      {
        change:
          "如果 cart 要跨多个应用复用，可以按同样的导入规则把它做成 packages/cart/ 包。",
        stage: "4",
        title: "包（package）",
      },
    ],
    moduleStagesExplorer: "Explorer",
    moduleStagesLead:
      "第一天不需要完整的目录树。从一个文件开始，随着代码增长再添加结构。",
    moduleStagesNextAria: "下一阶段",
    moduleStagesStageAria: "阶段",
    moduleStagesTitle: "布局随产品一起成长",
    violationDemo: {
      command: "npx @derived-modular/cli check .",
      detail: "checkout → catalog/public/api.ts",
      editorLabel: "Problems",
      error: "feature-to-feature",
      fileName: "features/checkout/model.ts",
      importLine: 'import { getCatalog } from "@/features/catalog/public/api";',
      note: "同一张导入图。编辑器和 CI 里的结果一致。",
      terminalLabel: "terminal",
    },
    violationLead:
      "丰富的工具链不会让你出错：linter、智能体和 CLI 执行的是同一套规则。",
    violationTitle: "边界是被校验的，而不是被争论的",
  },
} as const;

export type HomeLocale = keyof typeof homeCopy;

export function getHomeLocale(lang: string): HomeLocale {
  return lang in homeCopy ? (lang as HomeLocale) : "en";
}

export const moduleStageTrees = {
  "0": {
    nodes: [
      {
        children: [{ highlight: "good", kind: "file", name: "checkout.tsx" }],
        kind: "folder",
        name: "features",
        open: true,
      },
    ],
    window: "features/",
  },
  "1": {
    nodes: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    highlight: "good",
                    kind: "file",
                    name: "checkout-page.tsx",
                  },
                ],
                kind: "folder",
                name: "public",
                open: true,
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "file",
                name: "cart.store.ts",
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "file",
                name: "cart-row.tsx",
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "file",
                name: "use-cart-total.ts",
              },
            ],
            kind: "folder",
            name: "checkout",
            open: true,
          },
        ],
        kind: "folder",
        name: "features",
        open: true,
      },
    ],
    window: "features/checkout/",
  },
  "2": {
    nodes: [
      {
        children: [
          {
            children: [
              {
                children: [{ kind: "file", name: "checkout-page.tsx" }],
                kind: "folder",
                name: "public",
                open: true,
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "folder",
                name: "ui",
                open: true,
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "folder",
                name: "model",
                open: true,
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "folder",
                name: "api",
                open: true,
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "folder",
                name: "lib",
                open: true,
              },
            ],
            kind: "folder",
            name: "checkout",
            open: true,
          },
        ],
        kind: "folder",
        name: "features",
        open: true,
      },
    ],
    window: "features/checkout/",
  },
  "3": {
    nodes: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    gitStatus: "added",
                    highlight: "good",
                    kind: "file",
                    name: "catalog-page.tsx",
                  },
                ],
                kind: "folder",
                name: "public",
                open: true,
              },
            ],
            gitStatus: "added",
            highlight: "good",
            kind: "folder",
            name: "catalog",
            open: true,
          },
          {
            children: [
              {
                children: [{ kind: "file", name: "checkout-page.tsx" }],
                kind: "folder",
                name: "public",
                open: true,
              },
              { kind: "file", name: "checkout.store.ts" },
            ],
            kind: "folder",
            name: "checkout",
            open: true,
          },
        ],
        kind: "folder",
        name: "features",
        open: true,
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    gitStatus: "added",
                    highlight: "good",
                    kind: "file",
                    name: "cart.ts",
                  },
                ],
                kind: "folder",
                name: "public",
                open: true,
              },
            ],
            gitStatus: "added",
            highlight: "good",
            kind: "folder",
            name: "cart",
            open: true,
          },
        ],
        gitStatus: "added",
        highlight: "good",
        kind: "folder",
        name: "services",
        open: true,
      },
    ],
    window: "src/",
  },
  "4": {
    nodes: [
      {
        children: [
          {
            children: [
              {
                gitStatus: "added",
                highlight: "good",
                kind: "file",
                name: "package.json",
              },
              {
                children: [
                  {
                    children: [
                      {
                        gitStatus: "added",
                        highlight: "good",
                        kind: "file",
                        name: "cart.ts",
                      },
                    ],
                    kind: "folder",
                    name: "public",
                    open: true,
                  },
                ],
                kind: "folder",
                name: "src",
                open: true,
              },
            ],
            gitStatus: "added",
            highlight: "good",
            kind: "folder",
            name: "cart",
            open: true,
          },
        ],
        kind: "folder",
        name: "packages",
        open: true,
      },
    ],
    window: "packages/cart/",
  },
} as const satisfies Record<
  string,
  { nodes: readonly FileTreeNode[]; window: string }
>;

export const heroLayersTree: FileTreeNode[] = [
  { kind: "folder", name: "app" },
  {
    children: [
      { kind: "folder", name: "catalog" },
      {
        children: [
          {
            children: [{ gitStatus: "modified", kind: "file", name: "api.ts" }],
            kind: "folder",
            name: "public",
            open: true,
          },
        ],
        gitStatus: "modified",
        kind: "folder",
        name: "checkout",
        open: true,
      },
    ],
    kind: "folder",
    name: "features",
    open: true,
  },
  { kind: "folder", name: "services" },
  { kind: "folder", name: "shared" },
];
