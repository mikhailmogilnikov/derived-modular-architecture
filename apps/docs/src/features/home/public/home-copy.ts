export const homeCopy = {
  en: {
    aiFeatures: [
      {
        description:
          "Placement algorithm and prohibitions for Cursor, Claude Code, and 40+ agents.",
        title: "Agent skill",
      },
      {
        description:
          "ESLint, Oxlint, and Biome catch obvious imports while you type.",
        title: "Editor plugins",
      },
      {
        description:
          "Cycles, inbound predicates, and layer direction — only in dma check.",
        title: "CI gate",
      },
    ],
    aiLead:
      "Consistent placement rules for the team and for agents — editor plugins for speed, CLI for the full graph in CI.",
    aiTitle: "Designed for humans and AI",
    badge: "Architecture you can verify in CI",
    ctaDocs: "What is DMA",
    ctaLead: "One install. Run check locally, gate merges in CI.",
    ctaStart: "Quick start",
    ctaTitle: "Try it in your terminal",
    frameworksLead:
      "Same invariants, different composition roots — guides and runnable examples for every framework below.",
    frameworksTitle: "Works with your stack",
    heroLead:
      "DMA keeps frontend boundaries honest as the project grows — with a graph check you run in CI and fast feedback in the editor.",
    heroTitle: "A production-grade modular architecture for",
    problems: "Problems",
    structureLead:
      "Layers, public APIs, and import rules follow from the folder tree — not from verbal agreements that fade after six months.",
    structureTabs: {
      check: "dma check",
      imports: "Composition root",
      layout: "Project layout",
    },
    structureTitle: "Structure by design",
    toolingLead:
      "Heavy graph audit in the CLI. Lightweight per-file hints in linters. Not one or the other — both.",
    toolingTitle: "Hybrid enforcement",
    violation:
      "feature-to-feature: features/checkout must not import features/catalog",
  },
  ru: {
    aiFeatures: [
      {
        description:
          "Алгоритм размещения и запреты для Cursor, Claude Code и 40+ агентов.",
        title: "Agent skill",
      },
      {
        description:
          "ESLint, Oxlint и Biome ловят очевидные импорты прямо при наборе.",
        title: "Плагины редактора",
      },
      {
        description:
          "Циклы, inbound-предикаты и направление слоёв — только в dma check.",
        title: "Ворота CI",
      },
    ],
    aiLead:
      "Единые правила размещения для команды и агентов — плагины в редакторе для скорости, CLI для полного графа в CI.",
    aiTitle: "Для людей и для AI",
    badge: "Архитектура, которую можно проверить в CI",
    ctaDocs: "Что такое DMA",
    ctaLead: "Одна установка. Проверка локально, ворота в CI перед merge.",
    ctaStart: "Быстрый старт",
    ctaTitle: "Попробуйте в терминале",
    frameworksLead:
      "Те же инварианты, разные корни композиции — гайды и runnable-примеры для каждого фреймворка ниже.",
    frameworksTitle: "Работает с вашим стеком",
    heroLead:
      "DMA не даёт границам фронтенда размываться по мере роста проекта — граф проверяется в CI, быстрый фидбек в редакторе.",
    heroTitle: "Продакшен-модульная архитектура для",
    problems: "Проблемы",
    structureLead:
      "Слои, public API и правила импортов вытекают из дерева папок — а не из устных договорённостей, которые забываются через полгода.",
    structureTabs: {
      check: "dma check",
      imports: "Корень композиции",
      layout: "Дерево проекта",
    },
    structureTitle: "Структура по замыслу",
    toolingLead:
      "Тяжёлый аудит графа в CLI. Лёгкие подсказки по файлам в линтерах. Не или-или — оба слоя.",
    toolingTitle: "Гибридное enforcement",
    violation:
      "feature-to-feature: features/checkout не должен импортировать features/catalog",
  },
} as const;

export type HomeLocale = keyof typeof homeCopy;

export function getHomeLocale(lang: string): HomeLocale {
  return lang in homeCopy ? (lang as HomeLocale) : "en";
}
