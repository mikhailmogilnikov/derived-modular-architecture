interface HomeTerminalProps {
  lines: string[];
  title?: string;
}

export function HomeTerminal({ lines, title = "Terminal" }: HomeTerminalProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 border-fd-border/60 border-b px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-fd-muted-foreground text-xs">
          {title}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line) => (
          <span className="block" key={line}>
            {line}
          </span>
        ))}
      </pre>
    </div>
  );
}
