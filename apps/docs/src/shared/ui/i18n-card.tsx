"use client";

import type { ReactNode } from "react";
import { toDynamicDocHref } from "@/shared/lib/to-dynamic-doc-href";
import { I18nDocLink } from "@/shared/ui/i18n-doc-link";

interface I18nCardProps {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  href?: string;
  icon?: ReactNode;
  title?: ReactNode;
}

const cardClassName =
  "block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full";

const cardLinkClassName = `${cardClassName} hover:bg-fd-accent/80`;

function CardContent({
  icon,
  title,
  description,
  children,
}: Omit<I18nCardProps, "href" | "className">) {
  return (
    <>
      {icon ? (
        <div className="not-prose mb-2 w-fit rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground shadow-md [&_svg]:size-4">
          {icon}
        </div>
      ) : null}
      <h3 className="not-prose mb-1 font-medium text-sm">{title}</h3>
      {description ? (
        <p className="my-0! text-fd-muted-foreground text-sm">{description}</p>
      ) : null}
      <div className="prose-no-margin text-fd-muted-foreground text-sm empty:hidden">
        {children}
      </div>
    </>
  );
}

export function I18nCard({
  icon,
  title,
  description,
  href,
  className,
  children,
}: I18nCardProps) {
  const dynamicHref = toDynamicDocHref(href);
  const classes = [dynamicHref ? cardLinkClassName : cardClassName, className]
    .filter(Boolean)
    .join(" ");

  if (dynamicHref) {
    return (
      <I18nDocLink className={classes} data-card href={dynamicHref}>
        <CardContent description={description} icon={icon} title={title}>
          {children}
        </CardContent>
      </I18nDocLink>
    );
  }

  return (
    <div className={classes} data-card>
      <CardContent description={description} icon={icon} title={title}>
        {children}
      </CardContent>
    </div>
  );
}
