import type { InjectionKey } from "vue";

export type ShopTheme = {
	accentColor: string;
};

export const shopThemeKey: InjectionKey<ShopTheme> = Symbol("shop-theme");
