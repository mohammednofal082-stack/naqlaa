"use client";

import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { JobCard } from "@/components/jobs/job-card";
import { Input, Select } from "@/components/ui/input";
import { FilterChip, EmptyState, FilterBar } from "@/components/layout/page-header";
import { INDUSTRIES, matchIndustryFilter } from "@careerlink/shared";
import { useJobs } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { Search, Briefcase } from "lucide-react";

export default function JobsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("all");
  const [industry, setIndustry] = useState("all");
  const { data: jobs, loading } = useJobs();
  const list = jobs ?? [];

  const filtered = useMemo(() => {
    return list.filter((job) => {
      const matchSearch =
        !search ||
        job.title.includes(search) ||
        job.company.name.includes(search) ||
        job.company.industry.includes(search) ||
        job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchType = workType === "all" || job.workType === workType;
      const matchIndustry = matchIndustryFilter(job.company.industry, industry);
      return matchSearch && matchType && matchIndustry;
    });
  }, [list, search, workType, industry]);

  if (loading) {
    return (
      <PageLayout title={t("الوظائف", "Jobs")} subtitle={t("تقنية، صحة، مالية، تعليم، هندسة — تصفّح حسب القطاع", "Technology, healthcare, finance, education, engineering — browse by sector")}>
        <div className="space-y-4">
          <div className="nq-skeleton h-10 rounded-xl" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-40 rounded-xl" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("الوظائف", "Jobs")}
      subtitle={t("تقنية، صحة، مالية، تعليم، هندسة — تصفّح حسب القطاع", "Technology, healthcare, finance, education, engineering — browse by sector")}
      meta={t(`${filtered.length} نتيجة`, `${filtered.length} results`)}
    >
      <div className="nq-page-enter">
      <FilterBar>
        <FilterChip label={t("كل القطاعات", "All sectors")} active={industry === "all"} onClick={() => setIndustry("all")} />
        {INDUSTRIES.map((ind) => (
          <FilterChip
            key={ind.id}
            label={ind.label}
            active={industry === ind.id}
            onClick={() => setIndustry(ind.id)}
          />
        ))}
      </FilterBar>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <Input
            placeholder={t("ابحث عن وظيفة، شركة، قطاع...", "Search for a job, company, or sector...")}
            className="pr-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={workType} onChange={(e) => setWorkType(e.target.value)} className="w-40 bg-white">
          <option value="all">{t("كل الأنواع", "All types")}</option>
          <option value="remote">{t("عن بُعد", "Remote")}</option>
          <option value="hybrid">{t("هجين", "Hybrid")}</option>
          <option value="on-site">{t("في المكتب", "On-site")}</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("لا توجد وظائف مطابقة", "No matching jobs")}
          description={t("جرّب تغيير القطاع أو كلمات البحث للعثور على فرص أكثر", "Try changing the sector or search terms to find more opportunities")}
          action={
            <button type="button" onClick={() => { setSearch(""); setIndustry("all"); setWorkType("all"); }} className="btn-ghost">
              {t("إعادة تعيين الفلاتر", "Reset filters")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} company={job.company} />
          ))}
        </div>
      )}
      </div>
    </PageLayout>
  );
}
