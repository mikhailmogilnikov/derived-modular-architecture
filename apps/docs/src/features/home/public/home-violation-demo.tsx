import { Check, X } from "lucide-react";

interface HomeViolationDemoProps {
  className?: string;
  command: string;
  detail: string;
  editorLabel: string;
  error: string;
  fileName: string;
  importLine: string;
  note: string;
  terminalLabel: string;
}

const islandClass =
  "overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]";

function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1.5 border-fd-border/60 border-b bg-fd-muted/30 px-3 py-2">
      <span className="size-2 rounded-full bg-[#ff5f57]/90" />
      <span className="size-2 rounded-full bg-[#febc2e]/90" />
      <span className="size-2 rounded-full bg-[#28c840]/90" />
      <span className="ml-1 truncate font-mono text-[10px] text-fd-muted-foreground md:text-[11px]">
        {title}
      </span>
    </div>
  );
}

export function HomeViolationDemo({
  className = "",
  command,
  detail,
  editorLabel,
  error,
  fileName,
  importLine,
  note,
  terminalLabel,
}: HomeViolationDemoProps) {
  return (
    <div className={`mx-auto max-w-xl ${className}`}>
      <div className={islandClass}>
        <WindowChrome title={fileName} />
        <div className="border-fd-border/60 border-b px-4 py-3">
          <p className="mb-2 font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wide">
            {editorLabel}
          </p>
          <p className="font-mono text-[11px] leading-relaxed md:text-xs">
            <span className="rounded bg-red-500/10 px-1 py-0.5 text-red-400">
              {importLine}
            </span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-fd-border/60">
          <div className="border-fd-border/60 border-b px-4 py-3 sm:border-b-0">
            <p className="mb-2 flex items-center gap-1.5 font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wide">
              <X aria-hidden="true" className="size-3 text-red-400" />
              ESLint
            </p>
            <p className="font-mono text-[11px] text-red-400 leading-relaxed md:text-xs">
              {error}
            </p>
            <p className="mt-1 font-mono text-[11px] text-fd-muted-foreground md:text-xs">
              {detail}
            </p>
          </div>

          <div className="px-4 py-3">
            <p className="mb-2 font-medium text-[11px] text-fd-muted-foreground uppercase tracking-wide">
              {terminalLabel}
            </p>
            <div className="space-y-1.5 font-mono text-[11px] leading-relaxed md:text-xs">
              <p className="text-fd-foreground/90">
                <span className="text-fd-primary">$</span> {command}
              </p>
              <p className="text-red-400">{error}</p>
              <p className="text-fd-muted-foreground">{detail}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-fd-muted-foreground text-sm leading-relaxed">
        <span className="inline-flex items-start gap-1.5 text-left">
          <Check
            aria-hidden="true"
            className="landing-tone-success mt-1 size-3.5 shrink-0"
          />
          <span>{note}</span>
        </span>
      </p>
    </div>
  );
}
