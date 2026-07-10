import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { I18nCard } from "@/shared/ui/i18n-card";
import { I18nDocLink } from "@/shared/ui/i18n-doc-link";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    a: I18nDocLink,
    Card: I18nCard,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
