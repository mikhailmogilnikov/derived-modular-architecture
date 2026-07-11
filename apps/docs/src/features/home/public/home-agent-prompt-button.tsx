"use client";

import { Bot, Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TOOLTIP_VISIBLE_MS = 3500;
const TOOLTIP_EXIT_MS = 180;

interface HomeAgentPromptButtonProps {
  className?: string;
  label: string;
  prompt: string;
  tooltip: string;
  wrapperClassName?: string;
}

export function HomeAgentPromptButton({
  className = "",
  label,
  prompt,
  tooltip,
  wrapperClassName = "relative inline-flex",
}: HomeAgentPromptButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      clearTimers();
      setIsExiting(false);
      setCopied(true);

      exitTimerRef.current = window.setTimeout(() => {
        setIsExiting(true);
      }, TOOLTIP_VISIBLE_MS);

      hideTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        setIsExiting(false);
      }, TOOLTIP_VISIBLE_MS + TOOLTIP_EXIT_MS);
    } catch {
      clearTimers();
      setCopied(false);
      setIsExiting(false);
    }
  }, [clearTimers, prompt]);

  return (
    <div className={wrapperClassName}>
      <button className={className} onClick={handleClick} type="button">
        <Bot aria-hidden="true" className="size-5" />
        {label}
        <Copy aria-hidden="true" className="size-5" />
      </button>

      {copied ? (
        <div
          className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:left-1/2 sm:mt-3 sm:-translate-x-1/2"
          role="status"
        >
          <div
            className={`relative mx-auto w-full max-w-sm rounded-xl border border-fd-border/80 bg-fd-card px-4 py-3 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] sm:w-max ${isExiting ? "landing-copy-tooltip-exit" : "landing-copy-tooltip-in"}`}
          >
            <span
              aria-hidden="true"
              className="absolute -top-1.5 left-1/2 hidden size-3 -translate-x-1/2 rotate-45 border-fd-border/80 border-t border-l bg-fd-card sm:block"
            />
            <div className="flex items-start gap-2.5 text-left">
              <span className="landing-tone-success-badge mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                <Check aria-hidden="true" className="size-3.5" />
              </span>
              <p className="text-fd-foreground text-sm leading-relaxed">
                {tooltip}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
