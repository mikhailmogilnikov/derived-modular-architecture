import { Analytics } from "@vercel/analytics/react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import {
  appName,
  getSiteMeta,
  ogLocale,
  siteUrl,
  twitterHandle,
  twitterUrl,
} from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";
import { getI18nProvider } from "@/shared/ui/layout-options";
import "../global.css";

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const meta = getSiteMeta(lang);
  const title = `${appName} — ${meta.tagline}`;

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        ru: "/ru",
        "x-default": "/en",
      },
    },
    applicationName: appName,
    authors: [{ name: "Mikhail Mogilnikov", url: twitterUrl }],
    description: meta.description,
    keywords: [
      "frontend architecture",
      "modular architecture",
      "DMA",
      "feature-sliced",
      "code organization",
      "eslint",
      "CLI",
    ],
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: meta.description,
      locale: ogLocale[lang] ?? ogLocale.en,
      siteName: appName,
      title,
      type: "website",
      url: `/${lang}`,
    },
    title: {
      default: title,
      template: `%s — ${appName}`,
    },
    twitter: {
      card: "summary_large_image",
      creator: twitterHandle,
      description: meta.description,
      title,
    },
  };
}

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      lang={lang}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <RootProvider
          i18n={getI18nProvider(lang)}
          theme={{ defaultTheme: "system", enableSystem: true }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
