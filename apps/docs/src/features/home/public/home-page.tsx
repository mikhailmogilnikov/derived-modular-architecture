import Link from "next/link";

const copy = {
  en: {
    ctaDocs: "What is DMA",
    ctaStart: "Quick start",
    lead: "Frontend architecture that stays honest as the project grows — with a check you can run in CI.",
    title: "Derived Modular Architecture",
  },
  ru: {
    ctaDocs: "Что такое DMA",
    ctaStart: "Быстрый старт",
    lead: "Фронтенд-архитектура, которая не размывается сама собой — и проверка, которую можно поставить в CI.",
    title: "Derived Modular Architecture",
  },
} as const;

export function HomePage({ lang }: { lang: string }) {
  const locale = lang in copy ? (lang as keyof typeof copy) : "en";
  const content = copy[locale];

  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        <h1 className="font-semibold text-2xl tracking-tight">
          {content.title}
        </h1>
        <p className="text-fd-muted-foreground text-sm leading-relaxed">
          {content.lead}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          className="rounded-lg bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground text-sm"
          href={`/${lang}/docs/start/what-is-dma`}
        >
          {content.ctaDocs}
        </Link>
        <Link
          className="rounded-lg border px-4 py-2 font-medium text-fd-foreground text-sm hover:bg-fd-accent/50"
          href={`/${lang}/docs/start/quick-start`}
        >
          {content.ctaStart}
        </Link>
      </div>
    </div>
  );
}
