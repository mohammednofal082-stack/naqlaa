"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { globalSearch } from "@careerlink/shared";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function GlobalSearch({ className, variant = "default" }: { className?: string; variant?: "default" | "nav" }) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => (query.trim().length >= 2 ? globalSearch(query) : null), [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submit = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={ref} className={cn("relative flex-1 max-w-xl", className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={t("ابحث عن وظائف، شركات، أشخاص...", "Search jobs, companies, people...")}
          className={cn(
            "w-full h-9 pr-10 pl-3 rounded-md text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20",
            variant === "nav"
              ? "li-input border-transparent"
              : "border border-border bg-surface focus:border-brand/40"
          )}
        />
      </div>

      {open && results && results.total > 0 && (
        <div className="absolute top-full mt-2 inset-x-0 z-50 rounded-xl border border-border bg-surface-elevated shadow-elevated overflow-hidden max-h-80 overflow-y-auto">
          {results.jobs.slice(0, 3).map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-surface-hover border-b border-border text-sm"
            >
              <span className="text-xs text-brand font-medium">{t("وظيفة", "Job")}</span>
              <p className="font-medium text-text">{j.title}</p>
              <p className="text-xs text-text-muted">{j.company.name}</p>
            </Link>
          ))}
          {results.companies.slice(0, 2).map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-surface-hover border-b border-border text-sm"
            >
              <span className="text-xs text-brand font-medium">{t("شركة", "Company")}</span>
              <p className="font-medium text-text">{c.name}</p>
            </Link>
          ))}
          {results.people.slice(0, 2).map((p) => (
            <Link
              key={p.id}
              href={`/messages?user=${p.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-surface-hover border-b border-border text-sm"
            >
              <span className="text-xs text-brand font-medium">{t("شخص", "Person")}</span>
              <p className="font-medium text-text">{p.firstName} {p.lastName}</p>
            </Link>
          ))}
          <button
            type="button"
            onClick={submit}
            className="w-full px-4 py-3 text-sm font-semibold text-brand hover:bg-surface-hover text-right"
          >
            {t(`عرض كل النتائج (${results.total})`, `View all results (${results.total})`)}
          </button>
        </div>
      )}
    </div>
  );
}
