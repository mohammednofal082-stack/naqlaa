"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { KanbanBoard } from "@/components/role/kanban-board";
import { updateApplicationStatus, useAllApplications } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";
import type { ApplicationStatus } from "@careerlink/shared";
import { useState } from "react";

const NEXT_STATUS: Record<string, ApplicationStatus | null> = {
  applied: "under_review",
  under_review: "shortlisted",
  shortlisted: "interview_scheduled",
  interview_scheduled: "accepted",
  assessment_required: "interview_scheduled",
  accepted: null,
  rejected: null,
  withdrawn: null,
};

export default function HRPipelinePage() {
  const { t } = useI18n();
  const { data: applications, loading, refetch } = useAllApplications();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const apps = applications ?? [];

  const stages = [
    { key: "applied", label: t("تم التقديم", "Applied"), color: "bg-slate-400" },
    { key: "under_review", label: t("قيد المراجعة", "Under Review"), color: "bg-amber" },
    { key: "shortlisted", label: t("قائمة مختصرة", "Shortlisted"), color: "bg-purple" },
    { key: "interview_scheduled", label: t("مقابلة", "Interview"), color: "bg-cyan" },
    { key: "accepted", label: t("مقبول", "Accepted"), color: "bg-emerald" },
    { key: "rejected", label: t("مرفوض", "Rejected"), color: "bg-red-500" },
  ];

  const columns = stages.map((stage) => ({
    id: stage.key,
    label: stage.label,
    color: stage.color,
    items: apps.filter((a) => a.status === stage.key),
  }));

  const moveNext = async (app: (typeof apps)[number], columnId: string) => {
    const next = NEXT_STATUS[columnId];
    if (!next || busyId) return;
    setBusyId(app.id);
    setError("");
    try {
      await updateApplicationStatus(app.id, next);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل تحديث الحالة", "Failed to update status"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("قمع التوظيف", "Recruitment Funnel")}
        subtitle={t("انقل المرشح للمرحلة التالية — يُحفظ في قاعدة البيانات", "Move candidates to the next stage — saved to the database")}
      >
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {stages.map((stage) => (
              <div key={stage.key} className="flex-shrink-0 w-80 space-y-3">
                <div className="nq-skeleton h-6 w-28" />
                <div className="nq-skeleton h-[420px]" />
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard
            columns={columns}
            renderCard={(app) => (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-muted border border-brand/15 flex items-center justify-center text-sm font-bold text-brand">
                    {app.student?.firstName?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm text-text truncate">
                      {app.student?.firstName} {app.student?.lastName}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">{app.job?.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] text-text-muted">{applicationStatusLabel(app.status, t)}</span>
                  <span className={(app.matchScore ?? 0) >= 80 ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                    {t("تطابق", "Match")} {app.matchScore ?? 0}%
                  </span>
                </div>
                {busyId === app.id && (
                  <p className="text-[11px] text-brand mt-2">{t("جاري الحفظ...", "Saving...")}</p>
                )}
              </>
            )}
            actionLabel={t("نقل للمرحلة التالية", "Move to Next Stage")}
            onAction={(item, columnId) => {
              if (NEXT_STATUS[columnId]) void moveNext(item, columnId);
            }}
          />
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
