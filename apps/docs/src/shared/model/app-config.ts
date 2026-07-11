export const appName = "Derived Modular Architecture";
export const navBrandName = "Derived Modular Arch";
export const docsRoute = "/docs";
export const docsImageRoute = "/og/docs";
export const docsContentRoute = "/llms.mdx/docs";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://derived-modular.vercel.app";

export const siteMeta = {
  en: {
    description:
      "DMA tells people and agents where frontend code lives and verifies boundaries through the linter, CLI, and CI.",
    tagline: "A modular architecture for frontend",
  },
  ru: {
    description:
      "DMA говорит людям и агентам, где живёт фронтенд-код, и проверяет границы через линтер, CLI и CI.",
    tagline: "Модульная архитектура для фронтенда",
  },
  zh: {
    description:
      "DMA 告诉开发者和 AI 智能体前端代码应放在哪里，并通过 linter、CLI 和 CI 校验模块边界。",
    tagline: "面向前端的模块化架构",
  },
} as const;

export const ogLocale: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  zh: "zh_CN",
};

export function getSiteMeta(locale: string) {
  return siteMeta[locale as keyof typeof siteMeta] ?? siteMeta.en;
}

export const gitConfig = {
  branch: "main",
  repo: "derived-modular-architecture",
  user: "mikhailmogilnikov",
} as const;

export const twitterHandle = "@mikemogilnikov";
export const twitterUrl = "https://x.com/mikemogilnikov";
