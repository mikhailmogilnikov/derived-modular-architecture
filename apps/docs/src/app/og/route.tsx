import { generate as DefaultImage } from "fumadocs-ui/og";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { appName, getSiteMeta } from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";

export const revalidate = false;

export function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") ?? i18n.defaultLanguage;
  const meta = getSiteMeta(lang);

  return new ImageResponse(
    <DefaultImage
      description={meta.description}
      site={appName}
      title={meta.tagline}
    />,
    {
      height: 630,
      width: 1200,
    }
  );
}
