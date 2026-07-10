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
    heroLead:
      "DMA tells you where frontend code lives — and stops features from quietly importing each other.",
    heroTitle: "A modular architecture for",
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
    heroLead:
      "DMA говорит, где живёт фронтенд-код — и не даёт фичам тихо импортировать друг друга.",
    heroTitle: "Модульная архитектура для",
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

export const heroTree: FileTreeNode[] = [
  {
    children: [
      {
        children: [{ kind: "file", name: "page.tsx" }],
        comment: "screens",
        kind: "folder",
        name: "app",
        open: true,
      },
      {
        children: [
          {
            children: [
              {
                children: [{ kind: "file", name: "catalog-page.tsx" }],
                kind: "folder",
                name: "public",
              },
            ],
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
      {
        children: [
          {
            children: [{ kind: "file", name: "button.tsx" }],
            kind: "folder",
            name: "ui",
          },
          {
            children: [{ kind: "file", name: "format-price.ts" }],
            kind: "folder",
            name: "lib",
          },
        ],
        kind: "folder",
        name: "shared",
        open: true,
      },
    ],
    kind: "folder",
    name: "src",
    open: true,
  },
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
