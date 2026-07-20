"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { JobCard, CompanyCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/layout/page-header";
import { useSearch } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { Search, SearchX } from "lucide-react";

const tabs = ["الكل", "وظائف", "شركات", "أشخاص", "منشورات"] as const;

function SearchContent() {
  const { t } = useI18n();
  const params = useSearchParams();
  const initial = params.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]>("الكل");
  const { data: searchResults } = useSearch(query);

  const tabLabels: Record<(typeof tabs)[number], string> = {
    "الكل": t("الكل", "All"),
    "وظائف": t("وظائف", "Jobs"),
    "شركات": t("شركات", "Companies"),
    "أشخاص": t("أشخاص", "People"),
    "منشورات": t("منشورات", "Posts"),
  };

  useEffect(() => {
    if (initial) setQuery(initial);
  }, [initial]);

  const jobs = searchResults?.jobs ?? [];
  const companies = searchResults?.companies ?? [];
  const total = jobs.length + companies.length;

  const showJobs = tab === "الكل" || tab === "وظائف";
  const showCompanies = tab === "الكل" || tab === "شركات";

  return (
    <>
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <Input
          placeholder={t("ابحث عن وظائف، شركات، مهارات، منشورات...", "Search for jobs, companies, skills, and posts...")}
          className="pr-12 py-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-border pb-1">
        {tabs.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`px-2 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === tabKey ? "border-brand text-brand" : "border-transparent text-text-secondary hover:text-text"
            }`}
          >
            {tabLabels[tabKey]}
          </button>
        ))}
      </div>

      {!query.trim() ? (
        <EmptyState
          icon={Search}
          title={t("ابحث في المنصة بالكامل", "Search the entire platform")}
          description={t("اكتب كلمة للبحث عن وظائف، شركات، مهارات، ومنشورات", "Type a keyword to search for jobs, companies, skills, and posts")}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t(`لا توجد نتائج لـ «${query}»`, `No results for “${query}”`)}
          description={t("جرّب كلمات مختلفة أو أكثر عمومية", "Try different or more general terms")}
          action={
            <button type="button" onClick={() => setQuery("")} className="btn-ghost">
              {t("مسح البحث", "Clear search")}
            </button>
          }
        />
      ) : (
        <div className="space-y-8 pb-20 lg:pb-0">
          {showJobs && jobs.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-text mb-3">{t(`وظائف (${jobs.length})`, `Jobs (${jobs.length})`)}</h2>
              <div className="grid gap-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} company={job.company} compact />
                ))}
              </div>
            </section>
          )}

          {showCompanies && companies.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-text mb-3">{t(`شركات (${companies.length})`, `Companies (${companies.length})`)}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {companies.map((c) => (
                  <CompanyCard key={c.id} company={c} />
                ))}
              </div>
            </section>
          )}

          {(tab === "الكل" || tab === "أشخاص" || tab === "منشورات") && (
            <p className="text-text-muted text-sm text-center py-6">
              {tab === "أشخاص" || tab === "منشورات"
                ? t("البحث في الأشخاص والمنشورات غير متاح حالياً عبر واجهة البيانات.", "Searching people and posts is not available yet through the data interface.")
                : null}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  const { t } = useI18n();
  return (
    <DashboardLayout>
      <Header title={t("البحث", "Search")} subtitle={t("وظائف، شركات، أشخاص، ومنشورات في مكان واحد", "Jobs, companies, people, and posts in one place")} />
      <Suspense
        fallback={
          <div className="space-y-4 mt-6">
            <div className="nq-skeleton h-12 rounded-xl" />
            <div className="nq-skeleton h-10 rounded-xl" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-24 rounded-xl" />
            ))}
          </div>
        }
      >
        <div className="nq-page-enter mt-6">
          <SearchContent />
        </div>
      </Suspense>
    </DashboardLayout>
  );
}
