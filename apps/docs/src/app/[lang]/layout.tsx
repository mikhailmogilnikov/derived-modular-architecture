import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { getI18nProvider } from "@/shared/ui/layout-options";
import "../global.css";

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
      </body>
    </html>
  );
}
