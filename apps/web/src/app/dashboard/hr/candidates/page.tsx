"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { studentProfile } from "@careerlink/shared";
import { useAllApplications } from "@/hooks/data";
import { Filter, Search, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function HRCandidatesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { data: applications, loading } = useAllApplications();
  const apps = applications ?? [];

  const candidates = apps.filter((c) =>
    !search ||
    c.student?.firstName.includes(search) ||
    c.job?.title.includes(search)
  );

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("المرشحين", "Candidates")}
        subtitle={t(`${candidates.length} مرشح`, `${candidates.length} candidates`)}
      >
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={t("بحث...", "Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
            {t("فلترة", "Filter")}
          </Button>
        </div>

        <PanelCard title={t("قائمة المرشحين", "Candidate List")}>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-24" />
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("لا يوجد مرشحون مطابقون", "No Matching Candidates")}
              description={t("جرّب تعديل كلمات البحث أو إزالة الفلاتر.", "Try adjusting your search terms or removing filters.")}
              action={search ? <Button size="sm" variant="outline" onClick={() => setSearch("")}>{t("مسح البحث", "Clear Search")}</Button> : undefined}
            />
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                  <ActivityRow
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {candidate.student?.firstName[0]}
                      </div>
                    }
                    title={`${candidate.student?.firstName} ${candidate.student?.lastName}`}
                    subtitle={candidate.job?.title}
                    badge={
                      <div className="flex items-center gap-2">
                        <span className={(candidate.matchScore ?? 0) >= 80 ? "nq-chip nq-chip-emerald" : "nq-chip"}>{t("تطابق", "Match")} {candidate.matchScore}%</span>
                        <span className="text-xs text-text-muted hidden sm:inline">{applicationStatusLabel(candidate.status, t)}</span>
                        <Button size="sm">{t("عرض الملف", "View Profile")}</Button>
                        <Button size="sm" variant="outline">{t("جدولة", "Schedule")}</Button>
                      </div>
                    }
                  />
                  <p className="text-xs text-text-muted mt-2 mr-12">
                    {studentProfile.headline} · {formatDate(candidate.appliedAt)} · {studentProfile.skills.slice(0, 5).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
