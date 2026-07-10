import {
  Bot,
  CheckCircle2,
  Layers,
  Rocket,
  Shield,
  Terminal,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { HomeCodeTabs } from "@/features/home/public/home-code-tabs";
import { getHomeLocale, homeCopy } from "@/features/home/public/home-copy";
import { HomeRotatingText } from "@/features/home/public/home-rotating-text";
import { HomeTerminal } from "@/features/home/public/home-terminal";

const frameworks = [
  { href: "/docs/guides/nextjs", label: "Next.js" },
  { href: "/docs/guides/vite-react", label: "React" },
  { href: "/docs/guides/vue", label: "Vue" },
  { href: "/docs/guides/astro", label: "Astro" },
  { href: "/docs/guides/sveltekit", label: "SvelteKit" },
  { href: "/docs/guides/monorepo", label: "Monorepo" },
] as const;

const tooling = [
  { href: "/docs/tooling/cli/check", label: "CLI check" },
  { href: "/docs/tooling/eslint", label: "ESLint" },
  { href: "/docs/tooling/oxlint", label: "Oxlint" },
  { href: "/docs/tooling/biome", label: "Biome" },
  { href: "/docs/tooling/ai-agents", label: "AI agents" },
  { href: "/docs/tooling/ci", label: "CI" },
] as const;

const aiIcons = [Bot, Wrench, Shield] as const;

export function HomePage({ lang }: { lang: string }) {
  const locale = getHomeLocale(lang);
  const content = homeCopy[locale];

  return (
    <div className="landing-page w-full">
      <section className="landing-hero relative overflow-hidden">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 text-center md:py-28">
          <span className="rounded-full border border-fd-border/80 bg-fd-card/80 px-3 py-1 font-medium text-fd-muted-foreground text-xs backdrop-blur-sm">
            {content.badge}
          </span>

          <div className="max-w-4xl space-y-5">
            <h1 className="font-semibold text-4xl tracking-tight md:text-6xl md:leading-[1.15]">
              <span className="block text-balance">{content.heroTitle}</span>
              <HomeRotatingText />
            </h1>
            <p className="mx-auto max-w-2xl text-fd-muted-foreground text-lg leading-relaxed">
              {content.heroLead}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground text-sm transition-opacity hover:opacity-90"
              href={`/${lang}/docs/start/what-is-dma`}
            >
              <Layers className="size-4" />
              {content.ctaDocs}
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card/50 px-5 py-2.5 font-medium text-fd-foreground text-sm transition-colors hover:bg-fd-accent/50"
              href={`/${lang}/docs/start/quick-start`}
            >
              <Rocket className="size-4" />
              {content.ctaStart}
            </Link>
          </div>

          <div className="w-full max-w-2xl text-left">
            <HomeTerminal
              lines={[
                "$ npm install -D @derived-modular/cli",
                "$ npx @derived-modular/cli check .",
                "",
                "✓ 12 modules scanned",
                "✓ 0 errors · 0 warnings",
              ]}
            />
          </div>
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
            {content.aiTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.aiLead}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card">
            <div className="border-fd-border/60 border-b px-4 py-3 font-medium text-fd-muted-foreground text-sm">
              src/
            </div>
            <div className="grid gap-0 font-mono text-[13px] md:grid-cols-2">
              <div className="space-y-1 border-fd-border/40 border-b p-4 md:border-r md:border-b-0">
                <p className="text-fd-muted-foreground">.cursor/</p>
                <p className="pl-3 text-fd-muted-foreground">hooks.json</p>
                <p className="text-fd-muted-foreground">AGENTS.md</p>
                <p className="text-fd-muted-foreground">src/</p>
                <p className="pl-3">features/</p>
                <p className="pl-6 text-fd-primary">catalog/</p>
                <p className="pl-6 text-fd-primary">checkout/</p>
                <p className="pl-3">shared/ui/</p>
              </div>
              <div className="p-4">
                <pre className="overflow-x-auto leading-relaxed">{`// features/checkout/model.ts
import { getCatalog } from
  "@/features/catalog/public/api";

// ✗ feature-to-feature`}</pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {content.aiFeatures.map((feature, index) => {
              const Icon = aiIcons[index] ?? Bot;
              return (
                <div
                  className="rounded-xl border border-fd-border/80 bg-fd-card p-5"
                  key={feature.title}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="font-medium">{feature.title}</h3>
                  </div>
                  <p className="text-fd-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}

            <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card">
              <div className="flex items-center gap-2 border-fd-border/60 border-b px-4 py-2.5 font-medium text-sm">
                <CheckCircle2 className="size-4 text-fd-primary" />
                {content.problems}
              </div>
              <div className="space-y-2 p-4 font-mono text-[13px]">
                <p className="text-red-400">error</p>
                <p className="text-fd-muted-foreground leading-relaxed">
                  {content.violation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.frameworksTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.frameworksLead}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {frameworks.map((item) => (
            <Link
              className="flex items-center justify-center rounded-xl border border-fd-border/80 bg-fd-card px-4 py-6 font-medium text-sm transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/30"
              href={`/${lang}${item.href}`}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.toolingTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.toolingLead}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tooling.map((item) => (
            <Link
              className="rounded-xl border border-fd-border/80 bg-fd-card px-4 py-5 text-center font-medium text-sm transition-colors hover:border-fd-primary/40 hover:bg-fd-accent/30"
              href={`/${lang}${item.href}`}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <Terminal className="size-8 text-fd-primary" />
          </div>
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.ctaTitle}
          </h2>
          <p className="mb-10 text-fd-muted-foreground leading-relaxed">
            {content.ctaLead}
          </p>
          <HomeTerminal
            lines={[
              "$ npm install -D @derived-modular/cli",
              "$ npx @derived-modular/cli check .",
            ]}
          />
        </div>
      </section>
    </div>
  );
}
