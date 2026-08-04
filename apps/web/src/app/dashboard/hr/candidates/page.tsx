"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllApplications, updateApplicationStatus } from "@/hooks/data";
import { Filter, Search, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";
import type { ApplicationStatus } from "@careerlink/shared";

const FILTERS: Array<ApplicationStatus | "all"> = [
  "all",
  "applied",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "accepted",
  "rejected",
];

export default function HRCandidatesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data: applications, loading, refetch } = useAllApplications();
  const apps = applications ?? [];

  const candidates = useMemo(
    () =>
      apps.filter((c) => {
        const matchesSearch =
          !search ||
          c.student?.firstName.includes(search) ||
          c.student?.lastName.includes(search) ||
          c.job?.title.includes(search);
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [apps, search, statusFilter],
  );

  const schedule = async (id: string) => {
    setBusyId(id);
    try {
      await updateApplicationStatus(id, "interview_scheduled");
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

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
          <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="w-4 h-4" />
            {t("فلترة", "Filter")}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((f) => (
              <Button key={f} size="sm" variant={statusFilter === f ? "primary" : "outline"} onClick={() => setStatusFilter(f)}>
                {f === "all" ? t("الكل", "All") : applicationStatusLabel(f, t)}
              </Button>
            ))}
          </div>
        )}

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
              action={search || statusFilter !== "all" ? <Button size="sm" variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); }}>{t("مسح البحث", "Clear Search")}</Button> : undefined}
            />
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                  <ActivityRow
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {candidate.student?.firstName?.[0]}
                      </div>
                    }
                    title={`${candidate.student?.firstName} ${candidate.student?.lastName}`}
                    subtitle={candidate.job?.title}
                    badge={
                      <div className="flex items-center gap-2">
                        <span className={(candidate.matchScore ?? 0) >= 80 ? "nq-chip nq-chip-emerald" : "nq-chip"}>{t("تطابق", "Match")} {candidate.matchScore}%</span>
                        <span className="text-xs text-text-muted hidden sm:inline">{applicationStatusLabel(candidate.status, t)}</span>
                        <Link href={`/dashboard/hr/candidates/${candidate.id}`}>
                          <Button size="sm">{t("عرض الملف", "View Profile")}</Button>
                        </Link>
                        <Button size="sm" variant="outline" disabled={busyId === candidate.id} onClick={() => void schedule(candidate.id)}>
                          {t("جدولة", "Schedule")}
                        </Button>
                      </div>
                    }
                  />
                  <p className="text-xs text-text-muted mt-2 mr-12">
                    {candidate.student?.email} · {formatDate(candidate.appliedAt)}
                    {candidate.company?.name ? ` · ${candidate.company.name}` : ""}
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
