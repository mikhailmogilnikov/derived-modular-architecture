"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useState } from "react";
import type { FileTreeNode } from "@/features/home/public/home-file-tree";
import { HomeFileTree } from "@/features/home/public/home-file-tree";

interface ModuleStageItem {
  change: string;
  stage: string;
  title: string;
}

interface ModuleStageTree {
  nodes: readonly FileTreeNode[];
  window: string;
}

interface HomeModuleStagesProps {
  className?: string;
  explorerTitle: string;
  nextAriaLabel: string;
  stageAriaLabel: string;
  stages: readonly ModuleStageItem[];
  trees: Record<string, ModuleStageTree>;
}

const islandClass =
  "overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]";

export function HomeModuleStages({
  className = "",
  explorerTitle,
  nextAriaLabel,
  stageAriaLabel,
  stages,
  trees,
}: HomeModuleStagesProps) {
  const [active, setActive] = useState(stages[0]?.stage ?? "0");
  const activeIndex = stages.findIndex((item) => item.stage === active);
  const activeStage = stages[activeIndex] ?? stages[0];
  const activeTree = trees[active] ?? trees[stages[0]?.stage ?? "0"];
  const isLastStage = activeIndex >= stages.length - 1;

  const handleTabClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { stage } = event.currentTarget.dataset;
      if (stage) {
        setActive(stage);
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    if (activeIndex < stages.length - 1) {
      setActive(stages[activeIndex + 1]?.stage ?? active);
    }
  }, [active, activeIndex, stages]);

  if (!(activeStage && activeTree)) {
    return null;
  }

  return (
    <div className={`mx-auto max-w-xl ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          aria-label={explorerTitle}
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
        >
          {stages.map((item, index) => (
            <button
              aria-label={`${stageAriaLabel} ${index + 1}`}
              aria-selected={active === item.stage}
              className={`flex size-8 items-center justify-center rounded-full border font-medium font-mono text-sm transition-colors ${
                active === item.stage
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border/80 bg-fd-background text-fd-muted-foreground hover:border-fd-border hover:text-fd-foreground"
              }`}
              data-stage={item.stage}
              key={item.stage}
              onClick={handleTabClick}
              role="tab"
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          aria-label={nextAriaLabel}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fd-primary text-fd-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:bg-fd-muted disabled:text-fd-muted-foreground disabled:opacity-100"
          disabled={isLastStage}
          onClick={handleNext}
          type="button"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className={islandClass}>
        <div className="flex items-center gap-1.5 border-fd-border/60 border-b px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]/90" />
          <span className="size-2 rounded-full bg-[#febc2e]/90" />
          <span className="size-2 rounded-full bg-[#28c840]/90" />
          <span className="ml-1 font-mono text-[10px] text-fd-muted-foreground md:text-[11px]">
            {activeTree.window}
          </span>
        </div>

        <div className="px-3 py-3">
          <HomeFileTree
            className="text-[11px] md:text-xs"
            nodes={activeTree.nodes}
          />
        </div>

        <div className="border-fd-border/60 border-t bg-fd-muted/20 px-4 py-3">
          <p className="font-medium text-fd-foreground text-sm">
            {activeStage.title}
          </p>
          <p className="mt-1 text-fd-muted-foreground text-sm leading-relaxed">
            {activeStage.change}
          </p>
        </div>
      </div>
    </div>
  );
}
