"use client";

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
import { Briefcase, Building2, DollarSign, Users } from "lucide-react";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

export default function AdminReportsPage() {
  const { t } = useI18n();
  const growthData = [
    { month: t("يناير", "Jan"), users: 4200, revenue: 18000 },
    { month: t("فبراير", "Feb"), users: 4800, revenue: 21000 },
    { month: t("مارس", "Mar"), users: 5200, revenue: 24000 },
    { month: t("أبريل", "Apr"), users: 5800, revenue: 27000 },
    { month: t("مايو", "May"), users: 6400, revenue: 31000 },
    { month: t("يونيو", "Jun"), users: 7100, revenue: 35000 },
  ];
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

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("التقارير", "Reports")}
        subtitle={t("تقارير المنصة الشاملة", "Comprehensive platform reports")}
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
              <StatCard title={t("المستخدمين", "Users")} value={totalUsers >= 1000 ? `${(totalUsers / 1000).toFixed(1)}K` : totalUsers} icon={Users} />
              <StatCard title={t("الشركات", "Companies")} value={totalCompanies >= 1000 ? `${(totalCompanies / 1000).toFixed(1)}K` : totalCompanies} icon={Building2} />
              <StatCard title={t("الوظائف", "Jobs")} value={totalJobs >= 1000 ? `${(totalJobs / 1000).toFixed(1)}K` : totalJobs} icon={Briefcase} />
              <StatCard title={t("التقديمات", "Applications")} value={applications?.length ?? 0} icon={DollarSign} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("نمو المستخدمين", "User Growth")}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Area type="monotone" dataKey="users" stroke={chart.primary} fill={chart.primary} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("الإيرادات الشهرية", "Monthly Revenue")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="revenue" fill={chart.emerald} radius={[8, 8, 0, 0]} name={t("إيرادات $", "Revenue $")} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>
            </div>

            <PanelCard title={t("إحصائيات المنصة", "Platform Statistics")} className="mt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title={t("طلاب", "Students")} value={students.toLocaleString()} icon={Users} />
                <StatCard title={t("شركات", "Companies")} value={totalCompanies.toLocaleString()} icon={Building2} />
                <StatCard title={t("وظائف", "Jobs")} value={totalJobs.toLocaleString()} icon={Briefcase} />
                <StatCard title={t("تدريبات", "Internships")} value={totalInternships.toLocaleString()} icon={Briefcase} />
              </div>
            </PanelCard>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
