"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { useAllApplications, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, Eye, UserCheck, Users } from "lucide-react";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

function monthKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CompanyReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "";
  const { data: applications, loading: appsLoading } = useAllApplications();
  const { data: jobs, loading: jobsLoading } = useJobs();
  const loading = appsLoading || jobsLoading;

  const companyApps = (applications ?? []).filter(
    (a) => a.company?.id === companyId || a.job?.companyId === companyId || (!companyId && true)
  );
  const companyJobs = companyId
    ? (jobs ?? []).filter((j) => j.companyId === companyId)
    : (jobs ?? []);

  const stats = {
    totalApplications: companyApps.length,
    interviewsScheduled: companyApps.filter((a) => a.status === "interview_scheduled" || a.interviewDate).length,
    hired: companyApps.filter((a) => a.status === "accepted").length,
    views: companyJobs.reduce((sum, j) => sum + j.applicants, 0),
  };

  const monthlyHiring = useMemo(() => {
    const buckets = new Map<string, { applications: number; hires: number }>();
    for (const a of companyApps) {
      const key = monthKey(a.appliedAt);
      if (!key) continue;
      const cur = buckets.get(key) ?? { applications: 0, hires: 0 };
      cur.applications += 1;
      if (a.status === "accepted") cur.hires += 1;
      buckets.set(key, cur);
    }
    return [...buckets.keys()]
      .sort()
      .slice(-6)
      .map((k) => {
        const [, m] = k.split("-");
        const v = buckets.get(k)!;
        return { month: m, applications: v.applications, hires: v.hires };
      });
  }, [companyApps]);

  const sourceData = [
    { name: t("نقلة", "Naqla"), value: Math.max(companyApps.length, 1), color: "#2563EB" },
  ];

  const statusPie = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of companyApps) {
      map.set(a.status, (map.get(a.status) ?? 0) + 1);
    }
    const colors = ["#2563EB", "#10B981", "#7C3AED", "#F59E0B", "#94A3B8", "#EF4444"];
    return [...map.entries()].map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [companyApps]);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("التقارير", "Reports")}
        subtitle={t("تحليلات التوظيف من بياناتك الحية", "Live hiring analytics from your data")}
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
              <StatCard title={t("إجمالي المتقدمين", "Total Applicants")} value={stats.totalApplications} icon={Users} />
              <StatCard title={t("مقابلات", "Interviews")} value={stats.interviewsScheduled} icon={BarChart3} />
              <StatCard title={t("تم التوظيف", "Hired")} value={stats.hired} icon={UserCheck} />
              <StatCard title={t("مشاهدات/متقدمون", "Views/Applicants")} value={stats.views} icon={Eye} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("التقديمات والتوظيف الشهري", "Monthly Applications and Hiring")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyHiring.length ? monthlyHiring : [{ month: "—", applications: 0, hires: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="applications" fill={chart.primary} radius={[8, 8, 0, 0]} name={t("تقديمات", "Applications")} />
                    <Bar dataKey="hires" fill={chart.emerald} radius={[8, 8, 0, 0]} name={t("توظيف", "Hires")} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("توزيع حالات الطلبات", "Application Status Mix")}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusPie.length ? statusPie : sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {(statusPie.length ? statusPie : sourceData).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chart.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </PanelCard>
            </div>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
