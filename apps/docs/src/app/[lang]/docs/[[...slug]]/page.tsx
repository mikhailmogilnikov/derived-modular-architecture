import {
  DocsContentPage,
  generateDocsMetadata,
  generateDocsParams,
} from "@/features/docs-page/public/docs-page";

export default async function Page(
  props: PageProps<"/[lang]/docs/[[...slug]]">
) {
  const params = await props.params;

  return <DocsContentPage lang={params.lang} slug={params.slug} />;
}

export function generateStaticParams() {
  return generateDocsParams();
}

export async function generateMetadata(
  props: PageProps<"/[lang]/docs/[[...slug]]">
) {
  const params = await props.params;

  return generateDocsMetadata({ lang: params.lang, slug: params.slug });
}
