import type { ReactNode } from "react";

interface HomePanelProps {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  title: string;
}

export function HomePanel({
  children,
  title,
  className = "",
  footer,
}: HomePanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] ${className}`}
    >
      <div className="flex items-center gap-2 border-fd-border/60 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]/90" />
        <span className="size-2.5 rounded-full bg-[#febc2e]/90" />
        <span className="size-2.5 rounded-full bg-[#28c840]/90" />
        <span className="ml-2 truncate font-mono text-fd-muted-foreground text-xs">
          {title}
        </span>
      </div>
      <div className="p-4 font-mono text-[13px] leading-relaxed">
        {children}
      </div>
      {footer ? (
        <div className="border-fd-border/60 border-t px-4 py-3">{footer}</div>
      ) : null}
    </div>
  );
}
