import { notFound } from "next/navigation";
import { getPageImage, source } from "@/services/docs-content/public/source";
import { renderOgImage } from "@/shared/lib/og-image";
import { appName } from "@/shared/model/app-config";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">
) {
  const { slug } = await params;
  const [locale, ...pageSlug] = slug.slice(0, -1);
  const page = source.getPage(pageSlug, locale);
  if (!page) {
    notFound();
  }

  return renderOgImage({
    description: page.data.description ?? "",
    eyebrow: appName,
    title: page.data.title,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
