"use client";

import { useCallback, useState } from "react";

const tabs = ["layout", "imports", "check"] as const;

type TabId = (typeof tabs)[number];

const codeSamples: Record<TabId, string> = {
  check: `$ npx @derived-modular/cli check .

✓ layer-direction     0 issues
✓ feature-to-feature  0 issues
✓ public-api          0 issues
✓ no-barrel           0 issues
✓ no-cycle            0 issues

12 modules · 0 errors · 0 warnings`,
  imports: `// src/app/page.tsx
import { CatalogPage } from "@/features/catalog/public/catalog-page";
import { CheckoutPage } from "@/features/checkout/public/checkout-page";

export default function Page() {
  return (
  <>
    <CatalogPage />
    <CheckoutPage />
  </>
  );
}`,
  layout: `src/
├── app/          # routes, layout, wiring
├── features/     # separate user flows
├── services/     # appears on promotion
└── shared/
    ├── ui/
    └── lib/`,
};

interface HomeCodeTabsProps {
  labels: Record<TabId, string>;
}

export function HomeCodeTabs({ labels }: HomeCodeTabsProps) {
  const [active, setActive] = useState<TabId>("layout");
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
    <div className="overflow-hidden rounded-xl border border-fd-border/80 bg-fd-card">
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
      <pre className="overflow-x-auto p-4 font-mono text-[13px] text-fd-foreground/90 leading-relaxed">
        {codeSamples[active]}
      </pre>
    </div>
  );
}
