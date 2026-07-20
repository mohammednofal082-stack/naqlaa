"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { KanbanBoard } from "@/components/role/kanban-board";
import { useAllApplications } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function HRPipelinePage() {
  const { t } = useI18n();
  const { data: applications, loading } = useAllApplications();
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

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("قمع التوظيف", "Recruitment Funnel")}
        subtitle={t("اسحب القرار — راجع، اختصر، جدول، اقبل", "Drag to decide — review, shortlist, schedule, accept")}
      >
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
                  {app.student?.firstName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-text truncate">{app.student?.firstName} {app.student?.lastName}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{app.job?.title}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                <span className="text-[11px] text-text-muted">{applicationStatusLabel(app.status, t)}</span>
                <span className={(app.matchScore ?? 0) >= 80 ? "nq-chip nq-chip-emerald" : "nq-chip"}>{t("تطابق", "Match")} {app.matchScore}%</span>
              </div>
            </>
          )}
          actionLabel={t("نقل للمرحلة التالية", "Move to Next Stage")}
        />
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
