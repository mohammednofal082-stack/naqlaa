"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { useInternshipRequests, usePartnerships, useUsers } from "@/hooks/data";
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
import { Briefcase, Handshake, Target, TrendingUp } from "lucide-react";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

export default function UniversityReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: partnerships, loading: partnershipsLoading } = usePartnerships();
  const { data: internshipRequests, loading: requestsLoading } = useInternshipRequests();
  const loading = usersLoading || partnershipsLoading || requestsLoading;

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
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
