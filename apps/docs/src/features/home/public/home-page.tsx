import { Layers, Rocket } from "lucide-react";
import Link from "next/link";
import { HomeCodeTabs } from "@/features/home/public/home-code-tabs";
import {
  getHomeLocale,
  homeCopy,
  teamTree,
} from "@/features/home/public/home-copy";
import { HomeExplorer } from "@/features/home/public/home-explorer";
import { HomeFooter } from "@/features/home/public/home-footer";
import { HomeFrameworkIcons } from "@/features/home/public/home-framework-icons";

const ctaPrimaryClass =
  "inline-flex items-center gap-2.5 rounded-full bg-fd-primary px-7 py-3.5 font-medium text-base text-fd-primary-foreground transition-opacity hover:opacity-90";
const ctaSecondaryClass =
  "inline-flex items-center gap-2.5 rounded-full border border-fd-border px-7 py-3.5 font-medium text-base text-fd-foreground transition-colors hover:bg-fd-accent/50";

export function HomePage({ lang }: { lang: string }) {
  const locale = getHomeLocale(lang);
  const content = homeCopy[locale];

  return (
    <div className="landing-page w-full">
      <section className="landing-hero relative overflow-hidden">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-20 text-center md:gap-14 md:py-28">
          <div className="max-w-4xl space-y-5">
            <span className="inline-flex rounded-full border border-fd-border/80 bg-fd-card/80 px-3 py-1 font-medium text-fd-muted-foreground text-xs">
              {content.badge}
            </span>
            <h1 className="font-semibold text-4xl tracking-tight md:text-6xl md:leading-[1.12]">
              <span className="block text-balance">{content.heroTitle}</span>
              <span className="mt-5 flex w-full justify-center md:mt-6">
                <HomeFrameworkIcons lang={lang} />
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-fd-muted-foreground text-lg leading-relaxed">
              {content.heroLead}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <Link
                className={ctaPrimaryClass}
                href={`/${lang}/docs/start/what-is-dma`}
              >
                <Layers className="size-5" />
                {content.ctaDocs}
              </Link>
              <Link
                className={ctaSecondaryClass}
                href={`/${lang}/docs/start/quick-start`}
              >
                <Rocket className="size-5" />
                {content.ctaStart}
              </Link>
            </div>
          </div>

          <HomeExplorer
            className="w-full max-w-sm text-left"
            nodes={content.heroTree}
            title={content.explorerTitle}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.structureTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.structureLead}
          </p>
        </div>
        <HomeCodeTabs labels={content.structureTabs} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.teamTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.teamLead}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <HomeExplorer nodes={teamTree} title={content.explorerTitle} />
            <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card">
              <div className="border-fd-border/60 border-b px-4 py-2.5 font-medium text-sm">
                {content.problemsTitle}
              </div>
              <div className="space-y-2 p-4 font-mono text-[13px]">
                <p className="text-red-400">error</p>
                <p className="text-fd-muted-foreground leading-relaxed">
                  {content.violation}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8">
            {content.teamPoints.map((point, index) => (
              <div className="space-y-2" key={point.title}>
                <p className="font-mono text-fd-muted-foreground text-xs">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-medium text-lg tracking-tight">
                  {point.title}
                </h3>
                <p className="text-fd-muted-foreground text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.ctaTitle}
          </h2>
          <p className="mb-8 text-fd-muted-foreground leading-relaxed">
            {content.ctaLead}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              className={ctaPrimaryClass}
              href={`/${lang}/docs/start/what-is-dma`}
            >
              <Layers className="size-5" />
              {content.ctaDocs}
            </Link>
            <Link
              className={ctaSecondaryClass}
              href={`/${lang}/docs/start/quick-start`}
            >
              <Rocket className="size-5" />
              {content.ctaStart}
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter lang={lang} />
    </div>
  );
}
