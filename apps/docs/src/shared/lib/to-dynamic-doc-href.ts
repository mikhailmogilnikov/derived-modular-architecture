import { docsRoute } from "@/shared/model/app-config";

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(\/|$)/;

/** Turn doc-internal hrefs into `/[lang]/docs/...` for DynamicLink. */
export function toDynamicDocHref(href: string | undefined): string | undefined {
  if (!href) {
    return href;
  }

  if (
    href.startsWith("http") ||
    href.startsWith("#") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  if (href.includes("[lang]")) {
    return href;
  }

  if (LOCALE_PREFIX_RE.test(href)) {
    return href;
  }

  if (href.startsWith(`${docsRoute}/`) || href === docsRoute) {
    return `/[lang]${href}`;
  }

  if (href.startsWith("/")) {
    return `/[lang]${docsRoute}${href}`;
  }

  return href;
}
