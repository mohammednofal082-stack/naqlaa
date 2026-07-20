"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  weeklyReports,
} from "@careerlink/shared";
import { useCompanies, useInternshipRequests, useUsers } from "@/hooks/data";
import { Briefcase, Calendar, FileText } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { internshipStatusLabel } from "@/i18n/labels";

export default function UniversityInternshipsPage() {
  const { t } = useI18n();
  const reportStatusLabels: Record<string, string> = {
    approved: t("معتمد", "Approved"),
    pending: t("بانتظار المراجعة", "Awaiting Review"),
    rejected: t("مرفوض", "Rejected"),
  };
  const { data: internshipRequests, loading: requestsLoading } = useInternshipRequests();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = requestsLoading || companiesLoading || usersLoading;
  const requests = internshipRequests ?? [];
  const [selectedInternship, setSelectedInternship] = useState<string | undefined>(undefined);
  const activeId = selectedInternship ?? requests[0]?.id;
  const reports = weeklyReports.filter((r) => r.internshipId === activeId);

  const getCompany = (id: string) => companies?.find((c) => c.id === id);
  const getUser = (id: string) => users?.find((u) => u.id === id);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("تتبع التدريب", "Internship Tracking")}
        subtitle={t("إدارة التدريبات والتقارير الأسبوعية", "Manage internships and weekly reports")}
      >
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-24" />
              ))}
            </div>
            <div className="lg:col-span-2 nq-skeleton h-96" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <PanelCard title={t("طلبات التدريب", "Internship Requests")}>
              {requests.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t("لا طلبات", "No Requests")}
                  description={t("عند تقديم طلبات تدريب ستظهر هنا.", "Internship requests will appear here once submitted.")}
                />
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => {
                    const company = getCompany(req.companyId);
                    const student = getUser(req.studentId);
                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => setSelectedInternship(req.id)}
                        className={cn(
                          "nq-lift w-full text-right p-3 rounded-lg border transition-colors",
                          activeId === req.id
                            ? "border-brand/30 bg-brand-muted"
                            : "border-border bg-surface-hover/40 hover:bg-surface-hover"
                        )}
                      >
                        <p className="font-medium text-sm text-text">{student?.firstName} {student?.lastName}</p>
                        <p className="text-xs text-text-muted">{company?.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="nq-chip">{internshipStatusLabel(req.status, t)}</span>
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(req.startDate)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </PanelCard>

            <div className="lg:col-span-2">
              <PanelCard title={t("التقارير الأسبوعية", "Weekly Reports")}>
                {reports.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={t("لا تقارير", "No Reports")}
                    description={t("اختر تدريباً لعرض تقاريره الأسبوعية.", "Select an internship to view its weekly reports.")}
                  />
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                              <FileText className="w-4 h-4 text-brand" />
                            </div>
                            <p className="font-medium text-sm text-text">{t("الأسبوع", "Week")} {report.weekNumber}: {report.title}</p>
                          </div>
                          <span className={report.status === "approved" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                            {reportStatusLabels[report.status]}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-text-secondary font-medium">{t("المهام المنجزة", "Completed Tasks")}</p>
                            <p className="text-text">{report.tasksDone}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary font-medium">{t("المهارات المستخدمة", "Skills Used")}</p>
                            <p className="text-xs text-text-muted mt-1">{report.skillsUsed.join(" · ")}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary font-medium">{t("التحديات", "Challenges")}</p>
                            <p className="text-text">{report.challenges}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-text-muted">{t("أُرسل", "Submitted")} {formatDate(report.submittedAt)}</span>
                          {report.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm">{t("اعتماد", "Approve")}</Button>
                              <Button size="sm" variant="outline">{t("طلب تعديل", "Request Revision")}</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PanelCard>
            </div>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
