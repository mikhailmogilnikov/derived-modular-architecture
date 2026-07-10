import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { type ComponentProps, type ComponentType, Suspense } from "react";
import { useMDXComponents } from "@/components/mdx";
import { baseOptions } from "@/lib/layout.shared";
import { gitConfig } from "@/lib/shared";
import { slugsToMarkdownPath, source } from "@/lib/source";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const serverLoader = createServerFn({
  method: "GET",
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      throw notFound();
    }

    return {
      markdownUrl: slugsToMarkdownPath(page.slugs).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
      path: page.path,
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    }
  ) {
    return (
      <MdxDocPage
        frontmatter={frontmatter}
        MDX={MDX}
        markdownUrl={markdownUrl}
        path={path}
        toc={toc}
      />
    );
  },
});

function MdxDocPage({
  MDX,
  frontmatter,
  markdownUrl,
  path,
  toc,
}: {
  MDX: ComponentType<{ components: ReturnType<typeof useMDXComponents> }>;
  frontmatter: { title?: string; description?: string };
  markdownUrl: string;
  path: string;
  toc: ComponentProps<typeof DocsPage>["toc"];
}) {
  const components = useMDXComponents();

  return (
    <DocsPage toc={toc}>
      <DocsTitle>{frontmatter.title}</DocsTitle>
      <DocsDescription>{frontmatter.description}</DocsDescription>
      <div className="-mt-4 flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          markdownUrl={markdownUrl}
        />
      </div>
      <DocsBody>
        <MDX components={components} />
      </DocsBody>
    </DocsPage>
  );
}

function Page() {
  const { path, pageTree, markdownUrl } = useFumadocsLoader(
    Route.useLoaderData()
  );

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Suspense>
        {clientLoader.useContent(path, { markdownUrl, path })}
      </Suspense>
    </DocsLayout>
  );
}
