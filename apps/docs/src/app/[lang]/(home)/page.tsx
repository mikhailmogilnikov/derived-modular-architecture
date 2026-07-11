import type { Metadata } from "next";
import { HomePage } from "@/features/home/public/home-page";
import { appName, getSiteMeta, twitterHandle } from "@/shared/model/app-config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const meta = getSiteMeta(lang);
  const title = `${appName} — ${meta.tagline}`;
  const image = `/og?lang=${lang}`;

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ru: "/ru", "x-default": "/en", zh: "/zh" },
    },
    openGraph: { images: [image], title, url: `/${lang}` },
    twitter: { creator: twitterHandle, images: [image], title },
  };
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  return <HomePage lang={lang} />;
}
