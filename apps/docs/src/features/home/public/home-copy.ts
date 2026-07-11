import type { FileTreeNode } from "@/features/home/public/home-file-tree";

export const homeCopy = {
  en: {
    badge: "Frontend architecture with CI checks",
    ctaDocs: "What is DMA",
    ctaLead:
      "Two minutes to understand the idea. Then wire the check when you’re ready.",
    ctaStart: "Quick start",

    ctaTitle: "Start here",
    explorerTitle: "Explorer",
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
      "DMA tells you where frontend code lives — and stops features from quietly importing each other.",
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
    problemsTitle: "Problems",
    structureLead:
      "Screens on top. User flows in features. Shared pieces only when needed. That’s the whole idea.",
    structureTabs: {
      check: "Check",
      import: "Imports",
      tree: "Folders",
    },

    structureTitle: "One clear layout",
    teamLead:
      "If checkout imports catalog, you see it in the editor — and CI fails before merge.",
    teamPoints: [
      {
        description:
          "Boundaries come from folders, not from a wiki nobody reads.",
        title: "Structure first",
      },
      {
        description: "Linter plugins catch bad imports while you type.",
        title: "Fast feedback",
      },
      {
        description: "dma check runs the full graph in CI.",
        title: "Hard gate",
      },
    ],

    teamTitle: "Same rules for the team and the pipeline",
    violation: "feature-to-feature: checkout must not import catalog",
  },
  ru: {
    badge: "Фронтенд-архитектура с проверкой в CI",
    ctaDocs: "Что такое DMA",
    ctaLead: "Две минуты на идею. Проверку подключите, когда будете готовы.",
    ctaStart: "Быстрый старт",

    ctaTitle: "Начните здесь",
    explorerTitle: "Explorer",
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
      "DMA говорит, где живёт фронтенд-код — и не даёт фичам тихо импортировать друг друга.",
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
    problemsTitle: "Problems",
    structureLead:
      "Экраны сверху. Пользовательские потоки в features. Общее — только когда нужно. Вся идея в этом.",
    structureTabs: {
      check: "Проверка",
      import: "Импорты",
      tree: "Папки",
    },

    structureTitle: "Одна понятная раскладка",
    teamLead:
      "Если checkout импортирует catalog — это видно в редакторе, а CI падает до merge.",
    teamPoints: [
      {
        description: "Границы из папок, а не из вики, которую никто не читает.",
        title: "Сначала структура",
      },
      {
        description: "Плагины ловят плохие импорты прямо при наборе.",
        title: "Быстрый фидбек",
      },
      {
        description: "dma check гоняет полный граф в CI.",
        title: "Жёсткий gate",
      },
    ],

    teamTitle: "Одни правила для команды и пайплайна",
    violation: "feature-to-feature: checkout не должен импортировать catalog",
  },
} as const;

export type HomeLocale = keyof typeof homeCopy;

export function getHomeLocale(lang: string): HomeLocale {
  return lang in homeCopy ? (lang as HomeLocale) : "en";
}

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

export const teamTree: FileTreeNode[] = [
  {
    children: [
      {
        children: [
          {
            children: [{ highlight: "bad", kind: "file", name: "api.ts" }],
            kind: "folder",
            name: "public",
          },
        ],
        kind: "folder",
        name: "catalog",
        open: true,
      },
      {
        children: [{ highlight: "selected", kind: "file", name: "model.ts" }],
        kind: "folder",
        name: "checkout",
        open: true,
      },
    ],
    kind: "folder",
    name: "src/features",
    open: true,
  },
];
