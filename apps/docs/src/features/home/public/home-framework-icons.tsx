import Link from "next/link";
import {
  siAstro,
  siJavascript,
  siNextdotjs,
  siNuxt,
  siReact,
  siSvelte,
  siTurborepo,
  siVite,
  siVuedotjs,
} from "simple-icons";

const frameworks = [
  {
    background:
      "linear-gradient(145deg, #FFEB3B 0%, #F7DF1E 50%, #E6C619 100%)",
    fill: "#000000",
    href: "/docs/guides",
    icon: siJavascript,
    label: "Vanilla JS",
  },
  {
    background: "#20232A",
    fill: "#61DAFB",
    href: "/docs/guides/vite-react",
    icon: siReact,
    label: "React",
  },
  {
    background:
      "linear-gradient(135deg, #41D1FF 0%, #BD34FE 55%, #FFCE21 100%)",
    fill: "#ffffff",
    href: "/docs/guides/vite-react",
    icon: siVite,
    label: "Vite",
  },
  {
    background: "linear-gradient(145deg, #252525 0%, #0F0F0F 100%)",
    fill: "#ffffff",
    href: "/docs/guides/nextjs",
    icon: siNextdotjs,
    label: "Next.js",
  },
  {
    background: "linear-gradient(145deg, #42B883 0%, #35495E 100%)",
    fill: "#ffffff",
    href: "/docs/guides/vue",
    icon: siVuedotjs,
    label: "Vue",
  },
  {
    background: "linear-gradient(145deg, #00DC82 0%, #108775 100%)",
    fill: "#ffffff",
    href: "/docs/guides/vue",
    icon: siNuxt,
    label: "Nuxt",
  },
  {
    background: "linear-gradient(135deg, #BC52EE 0%, #FF5D01 100%)",
    fill: "#ffffff",
    href: "/docs/guides/astro",
    icon: siAstro,
    label: "Astro",
  },
  {
    background: "linear-gradient(145deg, #FF7A45 0%, #FF3E00 100%)",
    fill: "#ffffff",
    href: "/docs/guides/sveltekit",
    icon: siSvelte,
    label: "Svelte",
  },
  {
    background: "linear-gradient(145deg, #FF6B9D 0%, #FF1E56 100%)",
    fill: "#ffffff",
    href: "/docs/guides/monorepo",
    icon: siTurborepo,
    label: "Monorepo",
  },
] as const;

const iconMarginFirstClass =
  "group relative ml-0 size-14 rounded-full bg-fd-background p-0.5 transition-all duration-200 hover:z-50 hover:scale-110 md:size-24 md:p-1";
const iconMarginRowStartClass =
  "group relative ml-0 size-14 rounded-full bg-fd-background p-0.5 transition-all duration-200 hover:z-50 hover:scale-110 md:-ml-6 md:size-24 md:p-1";
const iconMarginDefaultClass =
  "group relative -ml-3 size-14 rounded-full bg-fd-background p-0.5 transition-all duration-200 hover:z-50 hover:scale-110 md:-ml-6 md:size-24 md:p-1";

const rowWrapperFirstClass = "flex items-center justify-center md:contents";
const rowWrapperSecondClass =
  "flex items-center justify-center md:contents -mt-3 md:mt-0";

type Framework = (typeof frameworks)[number];

function BrandIcon({ fill, icon }: { fill: string; icon: Framework["icon"] }) {
  return (
    <svg
      aria-hidden="true"
      className="size-7 md:size-10"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} fill={fill} />
    </svg>
  );
}

interface FrameworkIconStackProps {
  items: readonly Framework[];
  lang: string;
  startIndex: number;
}

function FrameworkIconStack({
  items,
  lang,
  startIndex,
}: FrameworkIconStackProps) {
  return (
    <>
      {items.map((item, index) => {
        const globalIndex = startIndex + index;
        const isFirstInRow = index === 0;

        let iconClass = iconMarginDefaultClass;
        if (globalIndex === 0) {
          iconClass = iconMarginFirstClass;
        } else if (isFirstInRow) {
          iconClass = iconMarginRowStartClass;
        }

        return (
          <Link
            className={iconClass}
            href={`/${lang}${item.href}`}
            key={item.label}
            style={{
              zIndex: globalIndex + 1,
            }}
            title={item.label}
          >
            <span
              className="flex size-full items-center justify-center rounded-full"
              style={{ background: item.background }}
            >
              <BrandIcon fill={item.fill} icon={item.icon} />
            </span>
          </Link>
        );
      })}
    </>
  );
}

interface HomeFrameworkIconsProps {
  lang: string;
}

const mobileRows = [frameworks.slice(0, 5), frameworks.slice(5)] as const;
const rowStartIndexes = [0, 5] as const;
const rowWrapperClasses = [
  rowWrapperFirstClass,
  rowWrapperSecondClass,
] as const;

export function HomeFrameworkIcons({ lang }: HomeFrameworkIconsProps) {
  return (
    <div className="flex flex-col items-center gap-0 md:flex-row md:justify-center md:gap-0">
      {mobileRows.map((row, rowIndex) => (
        <div className={rowWrapperClasses[rowIndex]} key={row[0].label}>
          <FrameworkIconStack
            items={row}
            lang={lang}
            startIndex={rowStartIndexes[rowIndex]}
          />
        </div>
      ))}
    </div>
  );
}
