"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { useAllApplications, useCompanies, useInternships, useJobs, useUsers } from "@/hooks/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Briefcase, Building2, ClipboardList, Users } from "lucide-react";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

function monthKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const { data: jobs, loading: jobsLoading } = useJobs();
  const { data: internships, loading: internshipsLoading } = useInternships();
  const { data: applications, loading: appsLoading } = useAllApplications();
  const loading = usersLoading || companiesLoading || jobsLoading || internshipsLoading || appsLoading;

  const totalUsers = users?.length ?? 0;
  const totalCompanies = companies?.length ?? 0;
  const totalJobs = jobs?.length ?? 0;
  const students = users?.filter((u) => u.role === "student").length ?? 0;
  const totalInternships = internships?.length ?? 0;
  const totalApps = applications?.length ?? 0;

  const growthData = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const u of users ?? []) {
      const key = monthKey(u.createdAt);
      if (!key) continue;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const keys = [...buckets.keys()].sort().slice(-6);
    let running = 0;
    const allBefore = [...buckets.entries()]
      .filter(([k]) => keys[0] && k < keys[0])
      .reduce((s, [, n]) => s + n, 0);
    running = allBefore;
    return keys.map((k) => {
      running += buckets.get(k) ?? 0;
      const [, m] = k.split("-");
      return { month: m, users: running };
    });
  }, [users]);

  const appsByMonth = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const a of applications ?? []) {
      const key = monthKey(a.appliedAt);
      if (!key) continue;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.keys()]
      .sort()
      .slice(-6)
      .map((k) => {
        const [, m] = k.split("-");
        return { month: m, applications: buckets.get(k) ?? 0 };
      });
  }, [applications]);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("التقارير", "Reports")}
        subtitle={t("تقارير المنصة من البيانات الحية", "Live platform reports")}
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
              <StatCard title={t("المستخدمين", "Users")} value={totalUsers} icon={Users} />
              <StatCard title={t("الشركات", "Companies")} value={totalCompanies} icon={Building2} />
              <StatCard title={t("الوظائف", "Jobs")} value={totalJobs} icon={Briefcase} />
              <StatCard title={t("التقديمات", "Applications")} value={totalApps} icon={ClipboardList} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("نمو المستخدمين", "User Growth")}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthData.length ? growthData : [{ month: "—", users: totalUsers }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Area type="monotone" dataKey="users" stroke={chart.primary} fill={chart.primary} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("التقديمات الشهرية", "Monthly Applications")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appsByMonth.length ? appsByMonth : [{ month: "—", applications: totalApps }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="applications" fill={chart.emerald} radius={[8, 8, 0, 0]} name={t("تقديمات", "Applications")} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>
            </div>

            <PanelCard title={t("إحصائيات المنصة", "Platform Statistics")} className="mt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title={t("طلاب", "Students")} value={students} icon={Users} />
                <StatCard title={t("شركات", "Companies")} value={totalCompanies} icon={Building2} />
                <StatCard title={t("وظائف", "Jobs")} value={totalJobs} icon={Briefcase} />
                <StatCard title={t("تدريبات", "Internships")} value={totalInternships} icon={Briefcase} />
              </div>
            </PanelCard>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
