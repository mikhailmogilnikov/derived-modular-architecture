import Link from "next/link";

const copy = {
  en: {
    cta: "Open Docs",
    title: "Architecture rules derived from the filesystem and import graph.",
  },
  ru: {
    cta: "Открыть документацию",
    title:
      "Правила архитектуры, выведенные из файловой системы и графа импортов.",
  },
} as const;

export function HomePage({ lang }: { lang: string }) {
  const locale = lang in copy ? (lang as keyof typeof copy) : "en";
  const content = copy[locale];

  return (
    <div className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 font-medium text-xl">{content.title}</h1>
      <Link
        className="mx-auto rounded-lg bg-fd-primary px-3 py-2 font-medium text-fd-primary-foreground text-sm"
        href={`/${lang}/docs`}
      >
        {content.cta}
      </Link>
    </div>
  );
}
