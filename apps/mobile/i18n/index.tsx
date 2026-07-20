import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

export type Locale = "ar" | "en";

const STORAGE_KEY = "naqla-locale";

export function dirForLocale(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (ar: string, en: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

let sessionLocale: Locale | null = null;

function deviceLocale(): Locale {
  try {
    const code = Localization.getLocales()?.[0]?.languageCode?.toLowerCase();
    return code === "ar" ? "ar" : "en";
  } catch {
    return "ar";
  }
}

function detectInitialLocale(): Locale {
  if (sessionLocale) return sessionLocale;
  return deviceLocale();
}

function applyDirection(locale: Locale) {
  const shouldRTL = locale === "ar";
  if (I18nManager.isRTL !== shouldRTL) {
    I18nManager.allowRTL(shouldRTL);
    I18nManager.forceRTL(shouldRTL);
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const applyLocale = useCallback((next: Locale) => {
    sessionLocale = next;
    setLocaleState(next);
    applyDirection(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  // On first mount, prefer the user's saved choice over device auto-detection.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && (saved === "ar" || saved === "en") && saved !== locale) {
          sessionLocale = saved;
          setLocaleState(saved);
          applyDirection(saved);
        } else {
          applyDirection(locale);
        }
      })
      .catch(() => applyDirection(locale));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
