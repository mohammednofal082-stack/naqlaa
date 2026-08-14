"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, QuickAction } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAllApplications, useCompanies, useJobs, useUsers } from "@/hooks/data";
import { Users, Building2, Briefcase, FileText, Shield, Flag, Wallet, UserCheck } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

function monthBucket(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string, t: (ar: string, en: string) => string) {
  const m = Number(key.split("-")[1] ?? 0);
  const labels = [
    t("يناير", "Jan"),
    t("فبراير", "Feb"),
    t("مارس", "Mar"),
    t("أبريل", "Apr"),
    t("مايو", "May"),
    t("يونيو", "Jun"),
    t("يوليو", "Jul"),
    t("أغسطس", "Aug"),
    t("سبتمبر", "Sep"),
    t("أكتوبر", "Oct"),
    t("نوفمبر", "Nov"),
    t("ديسمبر", "Dec"),
  ];
  return labels[Math.max(0, m - 1)] ?? key;
}

export default function AdminDashboard() {
  const { t } = useI18n();
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
  const pendingCompanies = (companies ?? []).filter(
    (c) => c.verificationStatus === "pending" || (!c.verified && c.verificationStatus !== "approved")
  ).length;
  const interviews = (applications ?? []).filter(
    (a) => a.status === "interview_scheduled" || Boolean(a.interviewDate)
  ).length;

  const monthlyData = useMemo(() => {
    const map = new Map<string, { users: number; jobs: number }>();
    for (const u of users ?? []) {
      const key = monthBucket((u as { createdAt?: string }).createdAt);
      if (!key) continue;
      const cur = map.get(key) ?? { users: 0, jobs: 0 };
      cur.users += 1;
      map.set(key, cur);
    }
    for (const j of jobs ?? []) {
      const key = monthBucket((j as { createdAt?: string; postedAt?: string }).createdAt
        ?? (j as { postedAt?: string }).postedAt);
      if (!key) continue;
      const cur = map.get(key) ?? { users: 0, jobs: 0 };
      cur.jobs += 1;
      map.set(key, cur);
    }
    return [...map.keys()]
      .sort()
      .slice(-6)
      .map((k) => ({
        month: monthLabel(k, t),
        users: map.get(k)!.users,
        jobs: map.get(k)!.jobs,
      }));
  }, [users, jobs, t]);

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="admin"
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("مركز تحكم المنصة", "Platform Control Center")}
        subtitle={t("إحصائيات حية من قاعدة البيانات", "Live statistics from the database")}
        secondaryCta={{ href: "/dashboard/admin/billing", label: t("الفوترة", "Billing") }}
        actions={
          <Link href="/dashboard/admin/partnerships">
            <Button size="sm"><Shield className="w-4 h-4" /> {t("الشراكات الجديدة", "New Partnerships")}</Button>
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
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <StatCard title={t("المستخدمين", "Users")} value={totalUsers} icon={Users} />
              <StatCard title={t("الشركات", "Companies")} value={totalCompanies} icon={Building2} />
              <StatCard title={t("الوظائف", "Jobs")} value={totalJobs} icon={Briefcase} />
              <StatCard title={t("التقديمات", "Applications")} value={totalApplications} icon={FileText} />
              <StatCard title={t("بانتظار التحقق", "Pending verification")} value={pendingCompanies} icon={Shield} />
              <StatCard title={t("مقابلات مجدولة", "Scheduled interviews")} value={interviews} icon={UserCheck} />
            </div>

            <div className="grid lg:grid-cols-3 gap-5 mb-6">
              <PanelCard title={t("إدارة سريعة", "Quick Actions")}>
                <div className="space-y-2">
                  <QuickAction href="/dashboard/admin/partnerships" label={t("الشراكات الجديدة", "New Partnerships")} icon={Shield} description={t("موافقة الشركات والجامعات", "Approve companies and universities")} />
                  <QuickAction href="/dashboard/admin/verification" label={t("موافقة الشركات", "Approve Companies")} icon={Building2} description={t("التحقق من الشركات", "Verify companies")} />
                  <QuickAction href="/dashboard/admin/moderation" label={t("الإشراف على المحتوى", "Content Moderation")} icon={Flag} />
                  <QuickAction href="/dashboard/admin/billing" label={t("الفوترة والرسوم", "Billing & Fees")} icon={Wallet} description={t("معاينة تجريبية للدفع", "Sample payment preview")} />
                  <QuickAction href="/dashboard/admin/users" label={t("إدارة المستخدمين", "Manage Users")} icon={Users} />
                </div>
              </PanelCard>

              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
                <PanelCard title={t("المستخدمون حسب شهر الإنشاء", "Users by signup month")}>
                  {monthlyData.length === 0 ? (
                    <p className="text-sm text-text-muted py-16 text-center">{t("لا بيانات زمنية بعد", "No dated records yet")}</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fill: chart.tick, fontSize: 11 }} />
                        <Tooltip contentStyle={chart.tooltip} />
                        <Line type="monotone" dataKey="users" stroke={chart.emerald} strokeWidth={2} dot={{ fill: chart.emerald }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </PanelCard>

                <PanelCard title={t("الوظائف حسب شهر النشر", "Jobs by post month")}>
                  {monthlyData.length === 0 ? (
                    <p className="text-sm text-text-muted py-16 text-center">{t("لا بيانات زمنية بعد", "No dated records yet")}</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                        <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fill: chart.tick, fontSize: 11 }} />
                        <Tooltip contentStyle={chart.tooltip} />
                        <Bar dataKey="jobs" fill={chart.primary} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </PanelCard>
              </div>
            </div>
          </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
