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
