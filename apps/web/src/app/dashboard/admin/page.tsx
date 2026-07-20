"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, QuickAction } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAllApplications, useCompanies, useJobs, useUsers } from "@/hooks/data";
import { Users, Building2, Briefcase, FileText, DollarSign, TrendingUp, Shield, Flag } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

export default function AdminDashboard() {
  const { t } = useI18n();
  const monthlyData = [
    { month: t("يناير", "Jan"), users: 4200, jobs: 1800 },
    { month: t("فبراير", "Feb"), users: 4800, jobs: 2100 },
    { month: t("مارس", "Mar"), users: 5200, jobs: 2400 },
    { month: t("أبريل", "Apr"), users: 5800, jobs: 2700 },
    { month: t("مايو", "May"), users: 6400, jobs: 3100 },
    { month: t("يونيو", "Jun"), users: 7100, jobs: 3500 },
  ];
  const chart = useChartTheme();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const { data: jobs, loading: jobsLoading } = useJobs();
  const { data: applications, loading: appsLoading } = useAllApplications();
  const loading = usersLoading || companiesLoading || jobsLoading || appsLoading;

  const totalUsers = users?.length ?? 0;
  const totalCompanies = companies?.length ?? 0;
  const totalJobs = jobs?.length ?? 0;
  const totalApplications = applications?.length ?? 0;

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="admin"
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("مركز تحكم المنصة", "Platform Control Center")}
        subtitle={t("إحصائيات النظام، الموافقات، الإشراف، وصحة المنصة", "System statistics, approvals, moderation, and platform health")}
        showScenarios
        secondaryCta={{ href: "/dashboard/admin/reports", label: t("تحليل النمو", "Growth Analysis") }}
        actions={
          <Link href="/dashboard/admin/verification">
            <Button size="sm"><Shield className="w-4 h-4" /> {t("الموافقات", "Approvals")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="nq-skeleton h-72" />
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
                <div className="nq-skeleton h-72" />
                <div className="nq-skeleton h-72" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <StatCard title={t("المستخدمين", "Users")} value={totalUsers >= 1000 ? `${(totalUsers / 1000).toFixed(1)}K` : totalUsers} icon={Users} change="+12%" accent="blue" />
              <StatCard title={t("الشركات", "Companies")} value={totalCompanies >= 1000 ? `${(totalCompanies / 1000).toFixed(1)}K` : totalCompanies} icon={Building2} accent="purple" />
              <StatCard title={t("الوظائف", "Jobs")} value={totalJobs >= 1000 ? `${(totalJobs / 1000).toFixed(1)}K` : totalJobs} icon={Briefcase} accent="cyan" />
              <StatCard title={t("التقديمات", "Applications")} value={totalApplications >= 1000 ? `${(totalApplications / 1000).toFixed(0)}K` : totalApplications} icon={FileText} accent="emerald" />
              <StatCard title={t("الإيرادات", "Revenue")} value="$35K" icon={DollarSign} accent="amber" />
              <StatCard title={t("النمو الشهري", "Monthly Growth")} value="12%" icon={TrendingUp} accent="blue" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5 mb-6">
              <PanelCard title={t("إدارة سريعة", "Quick Actions")}>
                <div className="space-y-2">
                  <QuickAction href="/dashboard/admin/verification" label={t("موافقة الشركات", "Approve Companies")} icon={Shield} description={t("التحقق من الحسابات الجديدة", "Verify new accounts")} />
                  <QuickAction href="/dashboard/admin/moderation" label={t("الإشراف على المحتوى", "Content Moderation")} icon={Flag} />
                  <QuickAction href="/dashboard/admin/users" label={t("إدارة المستخدمين", "Manage Users")} icon={Users} />
                  <QuickAction href="/dashboard/admin/security" label={t("الأمان والسجلات", "Security & Logs")} icon={Shield} />
                </div>
              </PanelCard>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
                <PanelCard title={t("نمو المستخدمين", "User Growth")}>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                      <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: chart.tick, fontSize: 11 }} />
                      <Tooltip contentStyle={chart.tooltip} />
                      <Line type="monotone" dataKey="users" stroke={chart.emerald} strokeWidth={2} dot={{ fill: chart.emerald }} />
                    </LineChart>
                  </ResponsiveContainer>
                </PanelCard>

                <PanelCard title={t("الوظائف المنشورة", "Posted Jobs")}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                      <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 11 }} />
                      <YAxis tick={{ fill: chart.tick, fontSize: 11 }} />
                      <Tooltip contentStyle={chart.tooltip} />
                      <Bar dataKey="jobs" fill={chart.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </PanelCard>
              </div>
            </div>
          </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
