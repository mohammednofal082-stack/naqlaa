"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeModeSwitch({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={cn("w-9 h-9 rounded-lg border border-border bg-surface", className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-2 p-2 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors text-text-secondary hover:text-text",
        showLabel && "px-3",
        className
      )}
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={isDark ? "وضع فاتح" : "وضع داكن"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {showLabel && (
        <span className="text-xs font-medium hidden sm:inline">
          {isDark ? "فاتح" : "داكن"}
        </span>
      )}
    </button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  return <ThemeModeSwitch className={className} />;
}

export function ThemeSegmented() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const options = [
    { id: "light", label: "فاتح", icon: Sun },
    { id: "dark", label: "داكن", icon: Moon },
    { id: "system", label: "تلقائي", icon: Monitor },
  ] as const;

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-cream-dark/60 dark:bg-white/[0.04] border border-border">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTheme(id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            theme === id
              ? "bg-surface text-text shadow-soft border border-border"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
