"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function LanguageSwitch({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { locale, toggleLocale } = useI18n();
  // Label shows the language you switch TO.
  const target = locale === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={cn(
        "inline-flex items-center gap-2 p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-text-secondary hover:text-text",
        showLabel && "px-3",
        className
      )}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      title={target}
    >
      <Languages className="w-4 h-4" />
      {showLabel && (
        <span className="text-xs font-medium hidden sm:inline">{target}</span>
      )}
    </button>
  );
}
