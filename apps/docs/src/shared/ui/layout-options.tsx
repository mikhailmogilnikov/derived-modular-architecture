import { i18nProvider, uiTranslations } from "fumadocs-ui/i18n";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "@/shared/model/app-config";
import { i18n } from "@/shared/model/i18n";

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    en: {
      displayName: "English",
    },
    ru: {
      displayName: "Русский",
    },
  });

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    i18n: true,
    nav: {
      title: appName,
      url: `/${locale}`,
    },
    themeSwitch: {
      enabled: true,
      mode: "light-dark-system",
    },
  };
}

export function getI18nProvider(locale: string) {
  return i18nProvider(translations, locale);
}
