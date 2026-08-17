"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import {
  useInternshipRequests,
  usePartnerships,
  useUniversityTraineeReports,
  useUsers,
} from "@/hooks/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Briefcase, FileText, Handshake, Target, TrendingUp } from "lucide-react";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/utils";

export default function UniversityReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: partnerships, loading: partnershipsLoading } = usePartnerships();
  const { data: internshipRequests, loading: requestsLoading } = useInternshipRequests();
  const { data: traineeReports, loading: traineeReportsLoading, error: traineeReportsError } = useUniversityTraineeReports();
  const loading = usersLoading || partnershipsLoading || requestsLoading || traineeReportsLoading;

  const students = users?.filter((u) => u.role === "student") ?? [];
  const graduates = users?.filter((u) => u.role === "graduate") ?? [];
  const requests = internshipRequests ?? [];
  const activeInternships = requests.filter((i) => i.status === "in_progress");
  const employmentRate = students.length + graduates.length
    ? Math.round((graduates.length / (students.length + graduates.length)) * 100)
    : 0;

  const roleBars = useMemo(
    () => [
      { dept: t("طلاب", "Students"), count: students.length },
      { dept: t("خريجون", "Graduates"), count: graduates.length },
      { dept: t("طلبات تدريب", "Internship requests"), count: requests.length },
      { dept: t("تدريب نشط", "Active internships"), count: activeInternships.length },
    ],
    [students.length, graduates.length, requests.length, activeInternships.length, t]
  );

  const requestTrend = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const r of requests) {
      const raw = (r as { createdAt?: string; submittedAt?: string }).createdAt
        ?? (r as { submittedAt?: string }).submittedAt
        ?? "";
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.keys()]
      .sort()
      .slice(-6)
      .map((k) => ({ period: k, rate: buckets.get(k) ?? 0 }));
  }, [requests]);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("التقارير", "Reports")}
        subtitle={t("تقارير الجامعة من البيانات الحية", "Live university reports")}
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="nq-skeleton h-80" />
              <div className="nq-skeleton h-80" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard title={t("نسبة الخريجين", "Graduate share")} value={`${employmentRate}%`} icon={TrendingUp} />
              <StatCard title={t("تدريبات نشطة", "Active Internships")} value={activeInternships.length} icon={Briefcase} />
              <StatCard title={t("الشراكات", "Partnerships")} value={(partnerships ?? []).length} icon={Handshake} />
              <StatCard title={t("طلبات تدريب", "Internship Requests")} value={requests.length} icon={Target} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("توزيع الأدوار والطلبات", "Roles & Requests")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roleBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="dept" tick={{ fill: chart.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="count" fill={chart.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("اتجاه طلبات التدريب", "Internship Request Trend")}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestTrend.length ? requestTrend : [{ period: "—", rate: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="period" tick={{ fill: chart.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Line type="monotone" dataKey="rate" stroke={chart.emerald} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </PanelCard>
            </div>

            <PanelCard
              className="mt-6"
              title={t("تقارير المتدربين", "Trainee Reports")}
            >
              <p className="text-sm text-text-muted -mt-2 mb-4">
                {traineeReports?.universityName
                  ? t(`متدربو ${traineeReports.universityName} في الشركات الشريكة`, `${traineeReports.universityName} trainees at partner companies`)
                  : t("حالة التقارير والتقييمات لكل متدرب", "Report and evaluation status for every trainee")}
              </p>
              {traineeReportsError ? (
                <p className="text-sm text-red-500">{t("تعذر تحميل تقارير المتدربين", "Could not load trainee reports")}</p>
              ) : !(traineeReports?.trainees.length) ? (
                <EmptyState
                  icon={FileText}
                  title={t("لا توجد تقارير متدربين", "No trainee reports")}
                  description={t("ستظهر تقارير المتدربين هنا عند بدء التدريب في الشركات.", "Trainee reports will appear here when company internships begin.")}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="border-b border-border text-text-muted">
                      <tr className="text-right">
                        <th className="p-3 font-medium">{t("المتدرب", "Trainee")}</th>
                        <th className="p-3 font-medium">{t("الشركة", "Company")}</th>
                        <th className="p-3 font-medium">{t("حالة التدريب", "Internship")}</th>
                        <th className="p-3 font-medium">{t("التقارير", "Reports")}</th>
                        <th className="p-3 font-medium">{t("آخر تقرير", "Latest report")}</th>
                        <th className="p-3 font-medium">{t("التقييم", "Score")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traineeReports.trainees.map((trainee) => (
                        <tr key={trainee.internshipId} className="border-b border-border/70 align-top">
                          <td className="p-3">
                            <p className="font-semibold text-text">{trainee.studentName}</p>
                            <p className="text-xs text-text-muted">{trainee.studentEmail}</p>
                          </td>
                          <td className="p-3 text-text-secondary">{trainee.companyName}</td>
                          <td className="p-3">
                            <span className="nq-chip">{trainee.status}</span>
                            <p className="text-[11px] text-text-muted mt-1">
                              {formatDate(trainee.startDate)} — {formatDate(trainee.endDate)}
                            </p>
                          </td>
                          <td className="p-3 font-medium text-text">{trainee.reportsCount}</td>
                          <td className="p-3 max-w-sm">
                            {trainee.latestReport ? (
                              <>
                                <p className="font-medium text-text">
                                  {t(`الأسبوع ${trainee.latestReport.weekNumber}`, `Week ${trainee.latestReport.weekNumber}`)}
                                  {trainee.latestReport.title ? ` — ${trainee.latestReport.title}` : ""}
                                </p>
                                <p className="text-xs text-text-secondary line-clamp-2 mt-1">{trainee.latestReport.tasksDone}</p>
                                <p className="text-[11px] text-text-muted mt-1">{formatDate(trainee.latestReport.submittedAt)}</p>
                              </>
                            ) : (
                              <span className="text-text-muted">{t("لم يُرسل بعد", "Not submitted yet")}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {trainee.averageScore === null ? (
                              <span className="text-text-muted">—</span>
                            ) : (
                              <span className="font-semibold text-emerald-600">{trainee.averageScore}/100</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </PanelCard>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
