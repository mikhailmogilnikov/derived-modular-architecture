import { notFound } from "next/navigation";
import {
  getLLMText,
  getPageMarkdownUrl,
  source,
} from "@/services/docs-content/public/source";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms.mdx/docs/[[...slug]]">
) {
  const { slug } = await params;
  const [locale, ...pageSlug] = slug?.slice(0, -1) ?? [];
  const page = source.getPage(pageSlug, locale);
  if (!page) {
    notFound();
  }

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
