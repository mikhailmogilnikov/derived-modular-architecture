import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/services/docs-content/public/source";
import { baseOptions } from "@/shared/ui/layout-options";

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;

  return (
    <DocsLayout tree={source.getPageTree(lang)} {...baseOptions(lang)}>
      {children}
    </DocsLayout>
  );
}
