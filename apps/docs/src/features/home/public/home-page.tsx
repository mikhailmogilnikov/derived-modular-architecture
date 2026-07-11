import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { HomeAgentPromptButton } from "@/features/home/public/home-agent-prompt-button";
import {
  getHomeLocale,
  homeCopy,
  moduleStageTrees,
} from "@/features/home/public/home-copy";
import { HomeFooter } from "@/features/home/public/home-footer";
import { HomeFrameworkIcons } from "@/features/home/public/home-framework-icons";
import { HomeLayersGrid } from "@/features/home/public/home-layers-grid";
import { HomeModuleStages } from "@/features/home/public/home-module-stages";
import { HomeToolingPipeline } from "@/features/home/public/home-tooling-pipeline";
import { HomeViolationDemo } from "@/features/home/public/home-violation-demo";
import { gitConfig } from "@/shared/model/app-config";

const heroBadgeClass =
  "inline-flex items-center gap-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground";

const ctaPrimaryClass =
  "inline-flex items-center gap-2.5 rounded-full bg-fd-primary px-7 py-3.5 font-medium text-base text-fd-primary-foreground transition-opacity hover:opacity-90";
const ctaSecondaryClass =
  "inline-flex items-center gap-2.5 rounded-full border border-fd-border px-7 py-3.5 font-medium text-base text-fd-foreground transition-colors hover:bg-fd-accent/50";

export function HomePage({ lang }: { lang: string }) {
  const locale = getHomeLocale(lang);
  const content = homeCopy[locale];
  const releaseHref = `https://github.com/${gitConfig.user}/${gitConfig.repo}/releases`;

  return (
    <div className="landing-page w-full">
      <section className="landing-hero relative">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pt-12 pb-20 text-center md:gap-14 md:py-28">
          <div className="max-w-4xl space-y-5">
            <Link
              className={heroBadgeClass}
              href={releaseHref}
              rel="noopener"
              target="_blank"
            >
              {content.badge}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
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
              <HomeAgentPromptButton
                className={ctaSecondaryClass}
                label={content.ctaAgentPrompt}
                tooltip={content.ctaAgentPromptTooltip}
              />
            </div>
          </div>

          <HomeToolingPipeline
            className="w-full max-w-5xl"
            copy={content.heroTooling}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.layersTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.layersLead}
          </p>
        </div>
        <HomeLayersGrid layers={content.layers} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.moduleStagesTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.moduleStagesLead}
          </p>
        </div>
        <HomeModuleStages
          explorerTitle={content.moduleStagesExplorer}
          nextAriaLabel={content.moduleStagesNextAria}
          stageAriaLabel={content.moduleStagesStageAria}
          stages={content.moduleStages}
          trees={moduleStageTrees}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
            {content.violationTitle}
          </h2>
          <p className="text-fd-muted-foreground leading-relaxed">
            {content.violationLead}
          </p>
        </div>
        <HomeViolationDemo
          command={content.violationDemo.command}
          detail={content.violationDemo.detail}
          editorLabel={content.violationDemo.editorLabel}
          error={content.violationDemo.error}
          fileName={content.violationDemo.fileName}
          importLine={content.violationDemo.importLine}
          note={content.violationDemo.note}
          terminalLabel={content.violationDemo.terminalLabel}
        />
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
            <HomeAgentPromptButton
              className={ctaSecondaryClass}
              label={content.ctaAgentPrompt}
              tooltip={content.ctaAgentPromptTooltip}
            />
          </div>
        </div>
      </section>

      <HomeFooter lang={lang} />
    </div>
  );
}
