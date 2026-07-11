import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  Loader2,
  Rocket,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { heroLayersTree } from "@/features/home/public/home-copy";
import { HomeFileTree } from "@/features/home/public/home-file-tree";

interface HeroToolingCopy {
  aiSkill: {
    diff: { added: number; path: string; removed: number };
    label: string;
    skillLines: readonly string[];
    studying: string;
  };
  cli: { command: string; signal: string; success: string };
  release: {
    deploy: string;
    check: string;
    install: string;
    workflow: string;
  };
}

interface HomeToolingPipelineProps {
  className?: string;
  copy: HeroToolingCopy;
}

const islandClass =
  "rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]";

function PipelineConnector() {
  return (
    <>
      <div
        aria-hidden="true"
        className="flex pipeline:hidden flex-col items-center"
      >
        <div className="h-5 w-px bg-fd-border" />
        <span className="flex size-6 items-center justify-center rounded-full border border-fd-border/80 bg-fd-background text-fd-primary/70">
          <ArrowDown className="size-3.5" />
        </span>
        <div className="h-5 w-px bg-fd-border" />
      </div>
      <div
        aria-hidden="true"
        className="pipeline:flex hidden pipeline:w-14 w-10 shrink-0 items-center"
      >
        <div className="h-px flex-1 bg-fd-border" />
        <span className="mx-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-fd-border/80 bg-fd-background text-fd-primary/70">
          <ArrowRight className="size-3.5" />
        </span>
        <div className="h-px flex-1 bg-fd-border" />
      </div>
    </>
  );
}

function PipelineIsland({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${islandClass} ${className}`}>{children}</div>;
}

function AiSkillIsland({
  diff,
  label,
  skillLines,
  studying,
}: HeroToolingCopy["aiSkill"]) {
  return (
    <div className="flex w-max max-w-xs pipeline:max-w-sm items-start gap-2.5 text-left">
      <span className="landing-tone-agent-badge mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
        <Bot aria-hidden="true" className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="mb-1 font-medium text-[11px] text-fd-muted-foreground">
          {label}
        </p>
        <div className="space-y-2 rounded-2xl rounded-tl-md border border-fd-border/70 bg-fd-muted/35 px-2.5 py-2">
          <p className="landing-shimmer-text text-xs leading-snug">
            {studying}
          </p>

          <p className="font-mono text-[11px] text-fd-muted-foreground leading-snug">
            {skillLines.join(" · ")}
          </p>

          <p className="border-fd-border/40 border-t pt-2 font-mono text-[11px] leading-snug">
            <span className="landing-tone-success">+{diff.added}</span>{" "}
            <span className="text-red-400">−{diff.removed}</span>{" "}
            <span className="text-fd-foreground/85">{diff.path}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LayersExplorerIsland() {
  return (
    <PipelineIsland className="overflow-hidden">
      <div className="flex items-center gap-1.5 border-fd-border/60 border-b px-3 py-2">
        <span className="size-2 rounded-full bg-[#ff5f57]/90" />
        <span className="size-2 rounded-full bg-[#febc2e]/90" />
        <span className="size-2 rounded-full bg-[#28c840]/90" />
        <span className="ml-1 font-mono text-[10px] text-fd-muted-foreground md:text-[11px]">
          src/
        </span>
      </div>
      <div className="px-3 py-2.5">
        <HomeFileTree
          className="text-[11px] md:text-xs"
          nodes={heroLayersTree}
        />
      </div>
    </PipelineIsland>
  );
}

function CliIsland({ command, signal, success }: HeroToolingCopy["cli"]) {
  return (
    <PipelineIsland className="overflow-hidden">
      <div className="border-fd-border/60 border-b bg-fd-muted/40 px-3 py-1.5 font-mono text-[11px] text-fd-muted-foreground">
        terminal
      </div>
      <div className="space-y-1.5 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
        <p className="flex items-start gap-1.5 text-fd-foreground/90">
          <span className="flex w-3 shrink-0 justify-center text-fd-primary">
            $
          </span>
          <span className="min-w-0">{command}</span>
        </p>
        <p className="landing-tone-success flex items-center gap-1.5">
          <span className="flex w-3 shrink-0 items-center justify-center">
            <Check aria-hidden="true" className="size-3" />
          </span>
          <span className="min-w-0">{success}</span>
        </p>
        <p className="landing-tone-warning flex items-center gap-1.5">
          <span className="flex w-3 shrink-0 items-center justify-center">
            <TriangleAlert aria-hidden="true" className="size-3" />
          </span>
          <span className="min-w-0">{signal}</span>
        </p>
      </div>
    </PipelineIsland>
  );
}

function ReleaseIsland({
  check,
  deploy,
  install,
  workflow,
}: HeroToolingCopy["release"]) {
  const jobs = [
    { done: true, label: install },
    { done: true, label: check },
    { done: false, label: deploy },
  ] as const;

  return (
    <PipelineIsland className="overflow-hidden">
      <div className="flex items-center gap-1.5 border-fd-border/60 border-b bg-fd-muted/40 px-3 py-1.5">
        <Workflow
          aria-hidden="true"
          className="size-3 shrink-0 text-fd-muted-foreground"
        />
        <span className="font-mono text-[11px] text-fd-muted-foreground">
          {workflow}
        </span>
      </div>
      <ul className="space-y-1 px-3 py-2">
        {jobs.map((job, index) => (
          <li
            className="flex items-center gap-2 font-mono text-[11px]"
            key={job.label}
          >
            {job.done ? (
              <span className="landing-tone-success-badge flex size-4 shrink-0 items-center justify-center rounded-full">
                <Check aria-hidden="true" className="size-2.5" />
              </span>
            ) : (
              <Loader2
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin text-fd-primary/80"
              />
            )}
            <span
              className={
                job.done ? "text-fd-foreground/85" : "text-fd-muted-foreground"
              }
            >
              {job.label}
            </span>
            {index === jobs.length - 1 ? (
              <Rocket
                aria-hidden="true"
                className="ml-auto size-3 shrink-0 text-fd-primary/80"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </PipelineIsland>
  );
}

export function HomeToolingPipeline({
  className = "",
  copy,
}: HomeToolingPipelineProps) {
  return (
    <div
      className={`flex w-full pipeline:flex-row flex-col pipeline:items-center items-stretch pipeline:justify-center ${className}`}
    >
      <div className="flex pipeline:w-auto w-full pipeline:shrink-0 pipeline:justify-start justify-center">
        <AiSkillIsland
          diff={copy.aiSkill.diff}
          label={copy.aiSkill.label}
          skillLines={copy.aiSkill.skillLines}
          studying={copy.aiSkill.studying}
        />
      </div>
      <div className="flex pipeline:contents flex-col items-center">
        <PipelineConnector />
        <LayersExplorerIsland />
        <PipelineConnector />
        <CliIsland
          command={copy.cli.command}
          signal={copy.cli.signal}
          success={copy.cli.success}
        />
        <PipelineConnector />
        <ReleaseIsland
          check={copy.release.check}
          deploy={copy.release.deploy}
          install={copy.release.install}
          workflow={copy.release.workflow}
        />
      </div>
    </div>
  );
}
