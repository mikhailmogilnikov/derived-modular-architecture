import type { FileTreeNode } from "@/features/home/public/home-file-tree";
import { agentPromptCopy } from "@/shared/model/agent-prompt-copy";

export const homeCopy = {
  en: {
    badge: "Latest update — release v1.0.1",
    ctaAgentPrompt: agentPromptCopy.en.label,
    ctaAgentPromptTooltip: agentPromptCopy.en.tooltip,
    ctaDocs: "What is DMA",
    ctaLead:
      "The docs explain the idea. The agent prompt suggests steps to integrate the architecture into your codebase.",

    ctaTitle: "Next — your project",
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
      "DMA tells people and agents where frontend code lives — and verifies boundaries through the linter, CLI, and CI.",
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
        description: "Entry point — routes and pages where the app starts.",
        name: "app",
      },
      {
        description:
          "Product modules other flows import. For example: catalog service imports product and cart features.",
        name: "services",
      },
      {
        description:
          "Product flow: cart, checkout. Imports between features are forbidden.",
        name: "features",
      },
      {
        description: "Portable helpers and UI — dates, buttons, HTTP client.",
        name: "shared",
      },
    ],
    layersLead:
      "No components/, utils/, or ad-hoc folders by taste. The folder tree is the rulebook — linter and CI enforce it. One-way imports: a lower layer never imports a higher one.",
    layersTitle: "Four boundaries in src/",
    moduleStages: [
      {
        change: "Whole file is the public API — import checkout.tsx directly.",
        stage: "0",
        title: "File module",
      },
      {
        change:
          "Module grew — public/ holds what app and other modules import. cart-row.tsx and hooks stay inside, only entrypoints go in public/.",
        stage: "1",
        title: "Folder + public/",
      },
      {
        change:
          "Too many files inside — split by role: ui/ for components, model/ for state and business logic, api/ for requests, lib/ for helpers used across segments.",
        stage: "2",
        title: "Segments",
      },
      {
        change:
          "checkout-form imports checkout — checkout moves to services/, the new flow stays in features/.",
        stage: "3",
        title: "Promotion",
      },
      {
        change:
          "Extracted to packages/checkout/ — same rules, shared across apps.",
        stage: "4",
        title: "Package",
      },
    ],
    moduleStagesExplorer: "Explorer",
    moduleStagesLead:
      "Start with a single file. Folders appear when the code needs them — each step builds on the last, no rewrite.",
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
      note: "One import graph — the same result in the editor and in CI.",
      terminalLabel: "terminal",
    },
    violationLead:
      "Rich tooling won't let you slip — linter, agent, and CLI enforce the same rules.",
    violationTitle: "Boundaries are checked, not debated",
  },
  ru: {
    badge: "Последнее обновление — релиз v1.0.1",
    ctaAgentPrompt: agentPromptCopy.ru.label,
    ctaAgentPromptTooltip: agentPromptCopy.ru.tooltip,
    ctaDocs: "Что такое DMA",
    ctaLead:
      "Документация объяснит идею. Промпт для агента — предложит шаги по интеграции архитектуры в ваш код.",

    ctaTitle: "Следующий шаг — ваш проект",
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
      "DMA говорит людям и агентам, где живёт фронтенд-код — и проверяет границы через линтер, CLI и CI.",
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
          "Точка входа — маршруты и страницы, с чего начинается приложение.",
        name: "app",
      },
      {
        description:
          "Продуктовые модули, которые импортируют другие потоки. Например: сервис catalog импортирует фичи product и cart.",
        name: "services",
      },
      {
        description:
          "Продуктовый поток: cart, checkout. Импорты между фичами запрещены.",
        name: "features",
      },
      {
        description: "Переносимые хелперы и UI — даты, кнопки, HTTP-клиент.",
        name: "shared",
      },
    ],
    layersLead:
      "Без components, utils и прочего «на глаз». Дерево папок задаёт правила — линтер и CI проверяют. Импорты однонаправленные: нижестоящий слой не импортирует вышестоящий.",
    layersTitle: "Четыре границы в src/",
    moduleStages: [
      {
        change: "Весь файл публичный — импортируйте checkout.tsx напрямую.",
        stage: "0",
        title: "Файл-модуль",
      },
      {
        change:
          "Модуль разросся — в public/ лежит то, что импортируют app и другие модули. cart-row.tsx и хуки остаются внутри checkout/, наружу — только entrypoint'ы.",
        stage: "1",
        title: "Папка + public/",
      },
      {
        change:
          "Файлов внутри модуля стало много — делим по ролям: ui/ для компонентов, model/ для состояния и бизнес-логики, api/ для запросов, lib/ для хелперов между сегментами.",
        stage: "2",
        title: "Сегменты",
      },
      {
        change:
          "checkout-form импортирует checkout — checkout переезжает в services/, новый поток остаётся в features/.",
        stage: "3",
        title: "Promotion",
      },
      {
        change:
          "Вынесли в packages/checkout/ — те же правила, общий модуль для приложений.",
        stage: "4",
        title: "Пакет",
      },
    ],
    moduleStagesExplorer: "Explorer",
    moduleStagesLead:
      "Начните с одного файла. Папки появляются, когда код этого требует — каждый шаг наследует предыдущий, без переписывания.",
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
      note: "Один граф импортов — один результат в редакторе и в CI.",
      terminalLabel: "terminal",
    },
    violationLead:
      "Ошибиться не даст богатый tooling — линтер, агент и CLI держат одни и те же правила.",
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
                name: "use-cart-total.ts",
              },
              {
                gitStatus: "added",
                highlight: "good",
                kind: "file",
                name: "cart-row.tsx",
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
                    name: "checkout-form.tsx",
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
            name: "checkout-form",
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
                children: [{ kind: "file", name: "checkout-page.tsx" }],
                kind: "folder",
                name: "public",
                open: true,
              },
              { kind: "folder", name: "ui", open: true },
              { kind: "folder", name: "model", open: true },
            ],
            gitStatus: "added",
            highlight: "good",
            kind: "folder",
            name: "checkout",
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
                        name: "checkout-page.tsx",
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
            name: "checkout",
            open: true,
          },
        ],
        kind: "folder",
        name: "packages",
        open: true,
      },
    ],
    window: "packages/checkout/",
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
