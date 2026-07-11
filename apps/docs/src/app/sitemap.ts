import type { MetadataRoute } from "next";
import { source } from "@/services/docs-content/public/source";
import { docsRoute, siteUrl } from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";

const url = (path: string) => new URL(path, siteUrl).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of i18n.languages) {
    entries.push({
      changeFrequency: "weekly",
      priority: 1,
      url: url(`/${lang}`),
    });

    for (const page of source.getPages(lang)) {
      entries.push({
        changeFrequency: "weekly",
        priority: 0.7,
        url: url(`/${lang}${docsRoute}/${page.slugs.join("/")}`),
      });
    }
  }

  return entries;
}
