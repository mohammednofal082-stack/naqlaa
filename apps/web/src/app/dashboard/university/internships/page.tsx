"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  submitWeeklyReport,
  useCompanies,
  useInternshipRequests,
  useUsers,
  useWeeklyReports,
} from "@/hooks/data";
import { Briefcase, Calendar, FileText } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { internshipStatusLabel } from "@/i18n/labels";

export default function UniversityInternshipsPage() {
  const { t } = useI18n();
  const { data: internshipRequests, loading: requestsLoading } = useInternshipRequests();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: reports, loading: reportsLoading, refetch: refetchReports } = useWeeklyReports();
  const loading = requestsLoading || companiesLoading || usersLoading || reportsLoading;
  const requests = internshipRequests ?? [];
  const [selectedInternship, setSelectedInternship] = useState<string | undefined>(undefined);
  const activeId = selectedInternship ?? requests[0]?.id;

  const [weekNumber, setWeekNumber] = useState("1");
  const [tasks, setTasks] = useState("");
  const [challenges, setChallenges] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getCompany = (id: string) => companies?.find((c) => c.id === id);
  const getUser = (id: string) => users?.find((u) => u.id === id);

  const activeReports = useMemo(
    () => (reports ?? []).filter((r) => r.internshipId === activeId),
    [reports, activeId],
  );

  const submitReport = async () => {
    if (!activeId) return;
    if (!tasks.trim()) {
      setError(t("اكتب المهام المنجزة", "Enter completed tasks"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await submitWeeklyReport({
        internshipRequestId: activeId,
        weekNumber: Number(weekNumber) || 1,
        tasksCompleted: tasks.trim(),
        challenges: challenges.trim() || undefined,
        summary: `Week ${weekNumber}`,
      });
      setTasks("");
      setChallenges("");
      await refetchReports();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل إرسال التقرير", "Failed to submit report"));
    } finally {
      setSaving(false);
    }
  };

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
                            : "border-border bg-surface-hover/40 hover:bg-surface-hover",
                        )}
                      >
                        <p className="font-medium text-sm text-text">
                          {student?.firstName} {student?.lastName}
                        </p>
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

            <div className="lg:col-span-2 space-y-4">
              <PanelCard title={t("التقارير الأسبوعية", "Weekly Reports")}>
                {!activeId ? (
                  <EmptyState
                    icon={FileText}
                    title={t("لا تقارير", "No Reports")}
                    description={t("اختر تدريباً لعرض تقاريره الأسبوعية.", "Select an internship to view its weekly reports.")}
                  />
                ) : activeReports.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={t("لا تقارير", "No Reports")}
                    description={t("لا توجد تقارير أسبوعية لهذا التدريب بعد.", "No weekly reports for this internship yet.")}
                  />
                ) : (
                  <div className="space-y-3">
                    {activeReports.map((report) => (
                      <div key={report.id} className="rounded-lg border border-border p-3 bg-surface-hover/40">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm text-text">
                            {t(`الأسبوع ${report.weekNumber}`, `Week ${report.weekNumber}`)}
                            {report.title ? ` — ${report.title}` : ""}
                          </p>
                          <span className="nq-chip">{report.status}</span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{report.tasksDone}</p>
                        {report.challenges ? (
                          <p className="text-xs text-text-muted mt-2">
                            {t("تحديات", "Challenges")}: {report.challenges}
                          </p>
                        ) : null}
                        <p className="text-[11px] text-text-muted mt-2">{formatDate(report.submittedAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </PanelCard>

              {activeId && (
                <PanelCard title={t("إرسال تقرير أسبوعي", "Submit weekly report")}>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1 block">{t("رقم الأسبوع", "Week number")}</label>
                      <Input type="number" min={1} value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-xs font-medium text-text-muted mb-1 block">{t("المهام المنجزة", "Tasks completed")}</label>
                      <Textarea rows={3} value={tasks} onChange={(e) => setTasks(e.target.value)} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-xs font-medium text-text-muted mb-1 block">{t("التحديات (اختياري)", "Challenges (optional)")}</label>
                      <Textarea rows={2} value={challenges} onChange={(e) => setChallenges(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
                  <Button className="mt-4" size="sm" onClick={submitReport} disabled={saving}>
                    {saving ? t("جاري الإرسال...", "Submitting...") : t("إرسال التقرير", "Submit report")}
                  </Button>
                </PanelCard>
              )}

              {activeId && (
                <PanelCard title={t("تقييم واعتماد التدريب", "Evaluate & approve internship")}>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await fetch("/api/data/internship-evaluations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              internshipRequestId: activeId,
                              evaluatorRole: "university",
                              score: 85,
                              comments: t("أداء جيد", "Good performance"),
                              approved: true,
                            }),
                          });
                          setError("");
                          alert(t("تم اعتماد التدريب", "Internship approved"));
                        } catch {
                          setError(t("فشل الاعتماد", "Approval failed"));
                        }
                      }}
                    >
                      {t("اعتماد المشرف الجامعي", "University supervisor approve")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await fetch("/api/data/internship-evaluations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              internshipRequestId: activeId,
                              evaluatorRole: "company",
                              score: 80,
                              comments: t("تقييم الشركة", "Company evaluation"),
                              approved: true,
                            }),
                          });
                          alert(t("تم حفظ تقييم الشركة", "Company evaluation saved"));
                        } catch {
                          setError(t("فشل التقييم", "Evaluation failed"));
                        }
                      }}
                    >
                      {t("تقييم الشركة", "Company evaluation")}
                    </Button>
                  </div>
                </PanelCard>
              )}
            </div>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
