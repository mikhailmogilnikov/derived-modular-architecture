import { redirect } from "next/navigation";
import {
  DocsContentPage,
  generateDocsMetadata,
  generateDocsParams,
} from "@/features/docs-page/public/docs-page";

const docsEntryPath = "start/what-is-dma";

export default async function Page(
  props: PageProps<"/[lang]/docs/[[...slug]]">
) {
  const params = await props.params;

  if (!params.slug?.length) {
    redirect(`/${params.lang}/docs/${docsEntryPath}`);
  }

  return <DocsContentPage lang={params.lang} slug={params.slug} />;
}

export function generateStaticParams() {
  return generateDocsParams();
}

export async function generateMetadata(
  props: PageProps<"/[lang]/docs/[[...slug]]">
) {
  const params = await props.params;

  if (!params.slug?.length) {
    redirect(`/${params.lang}/docs/${docsEntryPath}`);
  }

  return generateDocsMetadata({ lang: params.lang, slug: params.slug });
}
