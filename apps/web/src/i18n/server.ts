import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./shared";

/**
 * Resolves the active locale for server rendering.
 * Priority: explicit cookie choice -> browser Accept-Language (auto) -> Arabic.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE)?.value;
  if (saved === "ar" || saved === "en") return saved;

  const headerStore = await headers();
  const accept = headerStore.get("accept-language")?.toLowerCase() ?? "";
  // If Arabic is preferred anywhere in the list, use Arabic; otherwise fall back
  // to English when an English preference is present, else default to Arabic.
  const firstLang = accept.split(",")[0]?.trim() ?? "";
  if (firstLang.startsWith("en")) return "en";
  if (firstLang.startsWith("ar")) return "ar";
  if (accept.includes("ar")) return "ar";
  if (accept.includes("en")) return "en";
  return "ar";
}
