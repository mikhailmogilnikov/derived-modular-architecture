import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { docsContentRoute, docsRoute } from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";

type Locale = (typeof i18n.languages)[number];

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`
);

const i18nMiddleware = createI18nMiddleware(i18n);

function isLocale(value: string): value is Locale {
  return (i18n.languages as readonly string[]).includes(value);
}

function getTargetPath(request: NextRequest) {
  let locale: Locale = i18n.defaultLanguage;
  let pathNameWithoutLocale = request.nextUrl.pathname;

  const [detectedLocale, ...restPathSlugs] = request.nextUrl.pathname
    .split("/")
    .filter(Boolean);

  if (detectedLocale && isLocale(detectedLocale)) {
    locale = detectedLocale;
    pathNameWithoutLocale = restPathSlugs.length
      ? `/${restPathSlugs.join("/")}`
      : "/";
  }

  return { locale, pathNameWithoutLocale };
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { locale, pathNameWithoutLocale } = getTargetPath(request);

  const suffixResult = rewriteSuffix(pathNameWithoutLocale);
  if (suffixResult) {
    return NextResponse.rewrite(
      new URL(`/${locale}${suffixResult}`, request.nextUrl)
    );
  }

  if (isMarkdownPreferred(request)) {
    const docsResult = rewriteDocs(pathNameWithoutLocale);

    if (docsResult) {
      return NextResponse.rewrite(
        new URL(`/${locale}${docsResult}`, request.nextUrl)
      );
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
