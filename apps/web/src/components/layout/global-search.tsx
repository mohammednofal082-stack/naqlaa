"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function GlobalSearch({ className, variant = "default" }: { className?: string; variant?: "default" | "nav" }) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trimmed = query.trim();
  const { data: searchData, loading } = useSearch(trimmed.length >= 2 ? trimmed : "");
  const results =
    trimmed.length >= 2 && searchData
      ? {
          jobs: searchData.jobs,
          companies: searchData.companies,
          total: searchData.jobs.length + searchData.companies.length,
        }
      : null;

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

      {open && trimmed.length >= 2 && (
        <div className="absolute top-full mt-2 inset-x-0 z-50 rounded-xl border border-border bg-surface-elevated shadow-elevated overflow-hidden max-h-80 overflow-y-auto">
          {loading && (
            <p className="px-4 py-3 text-sm text-text-muted">{t("جاري البحث...", "Searching...")}</p>
          )}
          {!loading && results && results.total > 0 && (
            <>
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
              <button
                type="button"
                onClick={submit}
                className="w-full px-4 py-3 text-sm font-semibold text-brand hover:bg-surface-hover text-right"
              >
                {t(`عرض كل النتائج (${results.total})`, `View all results (${results.total})`)}
              </button>
            </>
          )}
          {!loading && results && results.total === 0 && (
            <p className="px-4 py-3 text-sm text-text-muted">{t("لا نتائج", "No results")}</p>
          )}
        </div>
      )}
    </div>
  );
}
