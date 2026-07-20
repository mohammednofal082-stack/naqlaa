"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE,
  dirForLocale,
  type Locale,
} from "./shared";

export { LOCALE_COOKIE, LOCALE_STORAGE, dirForLocale };
export type { Locale };

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Returns the string matching the active locale. */
  t: (ar: string, en: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE, locale);
  } catch {
    /* ignore */
  }
  // 1 year cookie so the server can render the correct dir on next load.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const applyLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    if (typeof document !== "undefined") {
      const el = document.documentElement;
      el.lang = next;
      el.dir = dirForLocale(next);
    }
  }, []);

  // Keep <html> in sync on mount (covers storage that differs from the cookie).
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = dirForLocale(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const dir = dirForLocale(locale);
    return {
      locale,
      dir,
      isRTL: dir === "rtl",
      setLocale: applyLocale,
      toggleLocale: () => applyLocale(locale === "ar" ? "en" : "ar"),
      t: (ar: string, en: string) => (locale === "ar" ? ar : en),
    };
  }, [locale, applyLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a LocaleProvider");
  }
  return ctx;
}
