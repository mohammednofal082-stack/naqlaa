"use client";

import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { CompanyCard } from "@/components/jobs/job-card";
import { Input } from "@/components/ui/input";
import { FilterChip, FilterBar, EmptyState } from "@/components/layout/page-header";
import { INDUSTRIES, matchIndustryFilter } from "@careerlink/shared";
import { useCompanies } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { Search, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const { data: companies, loading } = useCompanies();
  const list = companies ?? [];

  const filtered = useMemo(() => {
    return list.filter((c) => {
      const matchSearch =
        !search || c.name.includes(search) || c.industry.includes(search) || c.location.includes(search);
      const matchIndustry = matchIndustryFilter(c.industry, industry);
      return matchSearch && matchIndustry;
    });
  }, [list, search, industry]);

  if (loading) {
    return (
      <PageLayout title={t("الشركات الشريكة", "Partner companies")} subtitle={t("جهات في تقنية، صحة، مالية، تعليم، وأكثر", "Organizations in technology, healthcare, finance, education, and more")}>
        <div className="space-y-4">
          <div className="nq-skeleton h-10 max-w-md rounded-xl" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-28 rounded-xl" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("الشركات الشريكة", "Partner companies")}
      subtitle={t("جهات في تقنية، صحة، مالية، تعليم، وأكثر", "Organizations in technology, healthcare, finance, education, and more")}
      meta={t(`${filtered.length} جهة`, `${filtered.length} organizations`)}
    >
      <div className="nq-page-enter">
      <FilterBar>
        <FilterChip label={t("الكل", "All")} active={industry === "all"} onClick={() => setIndustry("all")} />
        {INDUSTRIES.map((ind) => (
          <FilterChip key={ind.id} label={ind.label} active={industry === ind.id} onClick={() => setIndustry(ind.id)} />
        ))}
      </FilterBar>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <Input
          placeholder={t("ابحث عن شركة أو قطاع...", "Search for a company or sector...")}
          className="pr-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("لا توجد شركات مطابقة", "No matching companies")}
          description={t("جرّب تغيير القطاع أو كلمات البحث", "Try changing the sector or search terms")}
          action={
            <button type="button" onClick={() => { setSearch(""); setIndustry("all"); }} className="btn-ghost">
              {t("إعادة تعيين الفلاتر", "Reset filters")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
      </div>
    </PageLayout>
  );
}
