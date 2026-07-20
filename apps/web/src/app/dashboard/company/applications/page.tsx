"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { CandidateReviewStack } from "@/components/role/candidate-review";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { useAllApplications } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function CompanyApplicationsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: applications, loading } = useAllApplications();
  const enriched = (applications ?? []).filter(
    (a) => a.company?.id === companyId || a.job?.companyId === companyId
  );

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("مركز المراجعة", "Review Center")}
        subtitle={t("راجع المرشحين بسرعة — قرار واضح في ثوانٍ", "Review candidates quickly — a clear decision in seconds")}
      >
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="nq-skeleton h-6 w-32" />
              <div className="nq-skeleton h-80" />
            </div>
            <div className="nq-skeleton h-96" />
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold text-text mb-4">{t("المراجعة السريعة", "Quick Review")}</p>
            <CandidateReviewStack candidates={enriched} />
          </div>

          <PanelCard title={t("كل المتقدمين", "All Applicants")}>
            {enriched.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("لا متقدمين بعد", "No Applicants Yet")}
                description={t("عند تقديم المرشحين على وظائفك ستظهر ملفاتهم هنا.", "When candidates apply to your jobs, their profiles will appear here.")}
              />
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {enriched.map((app) => (
                  <ActivityRow
                    key={app.id}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {app.student?.firstName[0]}
                      </div>
                    }
                    title={`${app.student?.firstName} ${app.student?.lastName}`}
                    subtitle={app.job?.title}
                    badge={
                      <div className="flex items-center gap-2">
                        <span className={(app.matchScore ?? 0) >= 80 ? "nq-chip nq-chip-emerald" : "nq-chip"}>{app.matchScore}%</span>
                        <span className="text-xs text-text-muted hidden sm:inline">{applicationStatusLabel(app.status, t)}</span>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </PanelCard>
        </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
