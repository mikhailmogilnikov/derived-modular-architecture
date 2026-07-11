"use client";

import { useParams } from "next/navigation";
import { getAgentPrompt } from "@/features/home/public/home-agent-prompt";
import { HomeAgentPromptButton } from "@/features/home/public/home-agent-prompt-button";
import { getAgentPromptCopy } from "@/shared/model/agent-prompt-copy";

const buttonClassName =
  "inline-flex items-center gap-2 rounded-full border border-fd-border px-5 py-2.5 font-medium text-fd-foreground text-sm transition-colors hover:bg-fd-accent/50";

export function DocsAgentPromptButton() {
  const params = useParams<{ lang: string }>();
  const copy = getAgentPromptCopy(params.lang);

  return (
    <div className="not-prose my-6">
      <HomeAgentPromptButton
        className={buttonClassName}
        label={copy.label}
        prompt={getAgentPrompt(params.lang)}
        tooltip={copy.tooltip}
      />
    </div>
  );
}
