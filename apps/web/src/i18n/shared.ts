export type Locale = "ar" | "en";

export const LOCALE_COOKIE = "naqla-locale";
export const LOCALE_STORAGE = "naqla-locale";

export function dirForLocale(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
