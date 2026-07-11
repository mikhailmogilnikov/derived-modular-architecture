import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/features/docs-page/public/mdx-components";
import {
  getPageImage,
  getPageMarkdownUrl,
  source,
} from "@/services/docs-content/public/source";
import {
  appName,
  docsRoute,
  gitConfig,
  ogLocale,
  twitterHandle,
} from "@/shared/model/app-config";
import { I18nDocLink } from "@/shared/ui/i18n-doc-link";

export function DocsContentPage({
  lang,
  slug,
}: {
  lang: string;
  slug?: string[];
}) {
  const page = source.getPage(slug, lang);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
          markdownUrl={markdownUrl}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page, I18nDocLink),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateDocsParams() {
  return source.generateParams("slug", "lang");
}

export function generateDocsMetadata({
  lang,
  slug,
}: {
  lang: string;
  slug?: string[];
}): Metadata {
  const page = source.getPage(slug, lang);
  if (!page) {
    notFound();
  }

  const slugPath = page.slugs.join("/");
  const image = getPageImage(page).url;
  const { description, title } = page.data;

  return {
    alternates: {
      canonical: `/${lang}${docsRoute}/${slugPath}`,
      languages: {
        en: `/en${docsRoute}/${slugPath}`,
        ru: `/ru${docsRoute}/${slugPath}`,
        "x-default": `/en${docsRoute}/${slugPath}`,
        zh: `/zh${docsRoute}/${slugPath}`,
      },
    },
    description,
    openGraph: {
      description,
      images: image,
      locale: ogLocale[lang] ?? ogLocale.en,
      siteName: appName,
      title,
      type: "article",
      url: `/${lang}${docsRoute}/${slugPath}`,
    },
    title,
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      description,
      images: image,
      title,
    },
  };
}
