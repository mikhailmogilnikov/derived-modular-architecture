"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const RESET_MS = 2000;

interface HomeCopyCommandProps {
  command: string;
  copiedLabel: string;
  copyLabel: string;
}

export function HomeCopyCommand({
  command,
  copyLabel,
  copiedLabel,
}: HomeCopyCommandProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      clearTimer();
      setCopied(true);
      timerRef.current = window.setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      clearTimer();
      setCopied(false);
    }
  }, [clearTimer, command]);

  return (
    <div className="mx-auto mb-8 flex w-fit max-w-full items-center gap-3 rounded-full border border-fd-border/80 bg-fd-card/40 py-2.5 pr-2.5 pl-5 font-mono text-sm">
      <span className="overflow-x-auto whitespace-nowrap text-left text-fd-muted-foreground">
        <span className="select-none text-fd-muted-foreground/60">$ </span>
        {command}
      </span>
      <button
        aria-label={copied ? copiedLabel : copyLabel}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-fd-muted-foreground transition-colors hover:bg-fd-accent/60 hover:text-fd-foreground"
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <Check aria-hidden="true" className="landing-tone-success size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}
