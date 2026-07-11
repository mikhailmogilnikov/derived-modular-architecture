import { ArrowUp, Home } from "lucide-react";

interface LayerItem {
  description: string;
  name: string;
}

interface HomeLayersGridProps {
  className?: string;
  layers: readonly LayerItem[];
}

const islandClass =
  "overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]";

function treePrefix(index: number, total: number): string {
  if (total === 1) {
    return "└─ ";
  }
  if (index === total - 1) {
    return "└─ ";
  }
  return "├─ ";
}

function LayerBadge({ name }: { name: string }) {
  if (name === "app") {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-fd-primary text-fd-primary-foreground">
        <Home aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      </span>
    );
  }

  return (
    <span className="flex size-7 items-center justify-center rounded-full border border-fd-primary/40 bg-fd-primary/10 text-fd-primary">
      <ArrowUp aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
    </span>
  );
}

export function HomeLayersGrid({
  className = "",
  layers,
}: HomeLayersGridProps) {
  return (
    <div className={`mx-auto max-w-xl ${className}`}>
      <div className={islandClass}>
        <div className="flex items-center gap-1.5 border-fd-border/60 border-b px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff5f57]/90" />
          <span className="size-2 rounded-full bg-[#febc2e]/90" />
          <span className="size-2 rounded-full bg-[#28c840]/90" />
          <span className="ml-1 font-mono text-[10px] text-fd-muted-foreground md:text-[11px]">
            src/
          </span>
        </div>

        <div className="space-y-3 px-4 pt-3 pb-4 font-mono text-[11px] leading-relaxed md:text-xs">
          {layers.map((layer, index) => (
            <div className="flex items-start gap-3" key={layer.name}>
              <div className="flex w-7 shrink-0 justify-center">
                <LayerBadge name={layer.name} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-fd-foreground/90">
                  <span className="text-fd-muted-foreground/70">
                    {treePrefix(index, layers.length)}
                  </span>
                  <span className="text-fd-primary">{layer.name}/</span>
                </p>
                <p className="mt-1 pl-4 text-fd-muted-foreground leading-snug">
                  {layer.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
