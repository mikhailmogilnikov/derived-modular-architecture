import type { NextRequest } from "next/server";
import { renderOgImage } from "@/shared/lib/og-image";
import { appName, getSiteMeta } from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";

export const revalidate = false;

export function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? i18n.defaultLanguage;
  const meta = getSiteMeta(lang);

  return renderOgImage({
    description: meta.description,
    eyebrow: appName,
    title: meta.tagline,
  });
}
