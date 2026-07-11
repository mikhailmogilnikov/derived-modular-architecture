import type { MetadataRoute } from "next";
import { siteUrl } from "@/shared/model/app-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/og/"],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
