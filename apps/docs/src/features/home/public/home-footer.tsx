import { Layers } from "lucide-react";
import Link from "next/link";
import { siGithub } from "simple-icons";
import { getHomeLocale, homeCopy } from "@/features/home/public/home-copy";
import { gitConfig, navBrandName } from "@/shared/model/app-config";

interface HomeFooterProps {
  lang: string;
}

export function HomeFooter({ lang }: HomeFooterProps) {
  const content = homeCopy[getHomeLocale(lang)];
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

  return (
    <footer className="mx-auto mb-24 flex max-w-6xl flex-col gap-6 px-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          href={`/${lang}`}
        >
          <Layers aria-hidden className="size-5 shrink-0" />
          <span className="font-semibold text-lg tracking-tight">
            {navBrandName}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            className="text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            href={githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="sr-only">{content.footerGitHubAria}</span>
            <svg
              aria-hidden="true"
              className="size-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={siGithub.path} fill="currentColor" />
            </svg>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
        {content.footerNav.map((section) => (
          <div className="flex flex-col gap-3" key={section.title}>
            <p className="font-medium text-sm">{section.title}</p>
            <ul className="flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-fd-muted-foreground text-sm transition-colors hover:text-fd-foreground"
                    href={`/${lang}${link.href}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
