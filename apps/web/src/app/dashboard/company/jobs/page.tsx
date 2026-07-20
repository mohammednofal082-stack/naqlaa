"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Plus, Briefcase } from "lucide-react";
import { useI18n } from "@/i18n";

export default function CompanyJobsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: jobs, loading } = useJobs();
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === companyId);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("إدارة الوظائف", "Job Management")}
        subtitle={t("نشر وتعديل وإغلاق الفرص الوظيفية", "Post, edit, and close job opportunities")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("نشر وظيفة", "Post a Job")}
          </Button>
        }
      >
        <PanelCard title={`${companyJobs.length} ${t("وظائف نشطة", "active jobs")}`}>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
          ) : companyJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("لا وظائف منشورة بعد", "No Jobs Posted Yet")}
              description={t("انشر أول وظيفة لتبدأ باستقبال المتقدمين.", "Post your first job to start receiving applicants.")}
              action={<Button size="sm"><Plus className="w-4 h-4" /> {t("نشر وظيفة", "Post a Job")}</Button>}
            />
          ) : (
            <div className="space-y-3">
              {companyJobs.map((job) => (
                <div
                  key={job.id}
                  className="nq-lift flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-surface-hover/40"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-text truncate">{job.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{job.applicants} {t("متقدم", "applicants")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm">{t("تعديل", "Edit")}</Button>
                    <Button variant="ghost" size="sm">{t("إغلاق", "Close")}</Button>
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
