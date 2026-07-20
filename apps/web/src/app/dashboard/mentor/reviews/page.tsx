"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare } from "lucide-react";
import { useI18n } from "@/i18n";

export default function MentorReviewsPage() {
  const { t } = useI18n();
  const reviews = [
    { id: "r1", student: t("سارة محمد", "Sara Mohamed"), type: t("مراجعة CV", "CV Review"), date: "2025-06-22", status: "بانتظار" },
    { id: "r2", student: t("ليلى أحمد", "Layla Ahmed"), type: t("مراجعة Portfolio", "Portfolio Review"), date: "2025-06-21", status: "مكتمل" },
    { id: "r3", student: t("محمد عمر", "Mohamed Omar"), type: t("ملاحظات المقابلة", "Interview Feedback"), date: "2025-06-20", status: "مكتمل" },
  ];
  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("مراجعة الملفات", "Document Reviews")}
        subtitle={t("السيرة، المعرض، وملاحظات المقابلات", "Résumés, portfolios, and interview feedback")}
      >
        <PanelCard title={t("طلبات المراجعة", "Review Requests")}>
          {reviews.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("لا طلبات مراجعة", "No Review Requests")}
              description={t("طلبات مراجعة الملفات من المتدربين ستظهر هنا.", "Document review requests from mentees will appear here.")}
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center font-bold text-purple">{r.student[0]}</div>
                    <div>
                      <p className="font-semibold text-text">{r.student}</p>
                      <p className="text-sm text-text-muted">{r.type} · {r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={r.status === "مكتمل" ? "nq-chip nq-chip-emerald" : "nq-chip"}>{t(r.status, r.status === "مكتمل" ? "Completed" : "Pending")}</span>
                    <Button variant="outline" size="sm">
                      {r.status === "بانتظار" ? <><FileText className="w-4 h-4" /> {t("مراجعة", "Review")}</> : <><MessageSquare className="w-4 h-4" /> {t("عرض", "View")}</>}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
