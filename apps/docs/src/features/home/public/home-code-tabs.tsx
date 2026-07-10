"use client";

import { useCallback, useState } from "react";

const tabs = ["tree", "import", "check"] as const;

type TabId = (typeof tabs)[number];

const samples: Record<TabId, string> = {
  check: `$ npx @derived-modular/cli check .

✓ 12 modules scanned
✗ feature-to-feature
  checkout → catalog`,
  import: `// ✓ screens assemble flows
import { CatalogPage } from
  "@/features/catalog/public/catalog-page";

// ✗ features don't import each other
import { getCatalog } from
  "@/features/catalog/public/api";`,
  tree: `src/
├── app/           # screens only
├── features/      # one folder per user flow
│   ├── catalog/
│   └── checkout/
└── shared/        # reusable pieces`,
};

interface HomeCodeTabsProps {
  labels: Record<TabId, string>;
}

export function HomeCodeTabs({ labels }: HomeCodeTabsProps) {
  const [active, setActive] = useState<TabId>("tree");
  const handleTabClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const tab = event.currentTarget.dataset.tab as TabId | undefined;
      if (tab) {
        setActive(tab);
      }
    },
    []
  );

  return (
    <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)]">
      <div className="flex flex-wrap gap-1 border-fd-border/60 border-b p-2">
        {tabs.map((tab) => (
          <button
            className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${
              active === tab
                ? "bg-fd-accent text-fd-accent-foreground"
                : "text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-foreground"
            }`}
            data-tab={tab}
            key={tab}
            onClick={handleTabClick}
            type="button"
          >
            {labels[tab]}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] text-fd-foreground/90 leading-relaxed">
        {samples[active]}
      </pre>
    </div>
  );
}
