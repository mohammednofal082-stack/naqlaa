"use client";

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

export default function CompanyReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();
  const { user } = useApp();

  const monthlyHiring = [
    { month: t("يناير", "January"), applications: 45, hires: 2 },
    { month: t("فبراير", "February"), applications: 52, hires: 3 },
    { month: t("مارس", "March"), applications: 38, hires: 1 },
    { month: t("أبريل", "April"), applications: 61, hires: 4 },
    { month: t("مايو", "May"), applications: 55, hires: 2 },
    { month: t("يونيو", "June"), applications: 48, hires: 3 },
  ];

  const sourceData = [
    { name: t("نقلة", "Naqla"), value: 45, color: "#2563EB" },
    { name: t("إحالة", "Referral"), value: 25, color: "#10B981" },
    { name: "LinkedIn", value: 20, color: "#7C3AED" },
    { name: t("أخرى", "Other"), value: 10, color: "#94A3B8" },
  ];
  const companyId = user?.organizationId ?? "comp-1";
  const { data: applications, loading: appsLoading } = useAllApplications();
  const { data: jobs, loading: jobsLoading } = useJobs();
  const loading = appsLoading || jobsLoading;
  const companyApps = (applications ?? []).filter(
    (a) => a.company?.id === companyId || a.job?.companyId === companyId
  );
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === companyId);

  const stats = {
    totalApplications: companyApps.length,
    interviewsScheduled: companyApps.filter((a) => a.status === "interview_scheduled" || a.interviewDate).length,
    hired: companyApps.filter((a) => a.status === "accepted").length,
    views: companyJobs.reduce((sum, j) => sum + j.applicants, 0),
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("التقارير", "Reports")}
        subtitle={t("تحليلات التوظيف والأداء", "Recruitment and performance analytics")}
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
              <StatCard title={t("مشاهدات", "Views")} value={stats.views} icon={Eye} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("التقديمات والتوظيف الشهري", "Monthly Applications and Hiring")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyHiring}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="applications" fill={chart.primary} radius={[8, 8, 0, 0]} name={t("تقديمات", "Applications")} />
                    <Bar dataKey="hires" fill={chart.emerald} radius={[8, 8, 0, 0]} name={t("توظيف", "Hires")} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("مصادر المرشحين", "Candidate Sources")}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry) => (
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
