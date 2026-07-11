import { ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";
import { getAgentPrompt } from "@/features/home/public/home-agent-prompt";
import { HomeAgentPromptButton } from "@/features/home/public/home-agent-prompt-button";
import type { HomeLocale } from "@/features/home/public/home-copy";
import { HomeCopyCommand } from "@/features/home/public/home-copy-command";

const ctaPrimaryClass =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-fd-primary px-7 py-3.5 font-medium text-base text-fd-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition-opacity hover:opacity-90";
const ctaSecondaryClass =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-fd-border bg-fd-card/50 px-7 py-3.5 font-medium text-base text-fd-foreground transition-colors hover:bg-fd-accent/50";
const ctaTertiaryClass =
  "inline-flex items-center gap-1.5 font-medium text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground";

export interface HomeCtaContent {
  ctaAgentPrompt: string;
  ctaAgentPromptTooltip: string;
  ctaCommand: string;
  ctaCommandCopied: string;
  ctaCommandCopy: string;
  ctaLead: string;
  ctaPrimary: string;
  ctaSecondaryLink: string;
  ctaTitle: string;
}

interface HomeCtaBlockProps {
  content: HomeCtaContent;
  lang: string;
  locale: HomeLocale;
  variant: "hero" | "closing";
}

export function HomeCtaBlock({
  content,
  lang,
  locale,
  variant,
}: HomeCtaBlockProps) {
  const quickStartHref = `/${lang}/docs/start/quick-start`;
  const whatIsDmaHref = `/${lang}/docs/start/what-is-dma`;

  const actions = (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Link className={ctaPrimaryClass} href={quickStartHref}>
          <Rocket aria-hidden="true" className="size-5" />
          {content.ctaPrimary}
        </Link>
        <HomeAgentPromptButton
          className={`${ctaSecondaryClass} w-full sm:w-auto`}
          label={content.ctaAgentPrompt}
          prompt={getAgentPrompt(locale)}
          tooltip={content.ctaAgentPromptTooltip}
          wrapperClassName="relative flex w-full sm:inline-flex sm:w-auto"
        />
      </div>
      <Link className={`${ctaTertiaryClass} mt-2`} href={whatIsDmaHref}>
        {content.ctaSecondaryLink}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </div>
  );

  if (variant === "hero") {
    return actions;
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="mb-4 font-semibold text-3xl tracking-tight md:text-4xl">
        {content.ctaTitle}
      </h2>
      <p className="mx-auto mb-8 max-w-xl text-fd-muted-foreground leading-relaxed">
        {content.ctaLead}
      </p>

      <HomeCopyCommand
        command={content.ctaCommand}
        copiedLabel={content.ctaCommandCopied}
        copyLabel={content.ctaCommandCopy}
      />

      {actions}
    </div>
  );
}
