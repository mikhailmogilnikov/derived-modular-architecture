"use client";

import { DynamicLink } from "fumadocs-core/dynamic-link";
import type { ComponentProps } from "react";
import { toDynamicDocHref } from "@/shared/lib/to-dynamic-doc-href";

export function I18nDocLink({
  href,
  ...props
}: ComponentProps<typeof DynamicLink>) {
  return <DynamicLink href={toDynamicDocHref(href)} {...props} />;
}
