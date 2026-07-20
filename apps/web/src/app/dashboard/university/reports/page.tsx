"use client";

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

const employmentTrend = [
  { year: "2021", rate: 58 },
  { year: "2022", rate: 63 },
  { year: "2023", rate: 67 },
  { year: "2024", rate: 70 },
  { year: "2025", rate: 72 },
];

export default function UniversityReportsPage() {
  const { t } = useI18n();
  const chart = useChartTheme();

  const departmentStats = [
    { dept: t("علوم الحاسوب", "Computer Science"), employed: 85, internships: 45 },
    { dept: t("هندسة البرمجيات", "Software Engineering"), employed: 78, internships: 38 },
    { dept: t("إدارة الأعمال", "Business Administration"), employed: 65, internships: 28 },
  ];
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

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("التقارير", "Reports")}
        subtitle={t("تقارير الجامعة والتوظيف", "University and employment reports")}
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
              <StatCard title={t("نسبة التوظيف", "Employment Rate")} value={`${employmentRate}%`} icon={TrendingUp} />
              <StatCard title={t("تدريبات نشطة", "Active Internships")} value={activeInternships.length} icon={Briefcase} />
              <StatCard title={t("الشراكات", "Partnerships")} value={(partnerships ?? []).length} icon={Handshake} />
              <StatCard title={t("طلبات تدريب", "Internship Requests")} value={requests.length} icon={Target} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <PanelCard title={t("نسبة التوظيف السنوية", "Annual Employment Rate")}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={employmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="year" tick={{ fill: chart.tick, fontSize: 12 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} domain={[50, 80]} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Line type="monotone" dataKey="rate" stroke={chart.emerald} strokeWidth={2} dot={{ fill: chart.emerald }} name={t("نسبة التوظيف %", "Employment Rate %")} />
                  </LineChart>
                </ResponsiveContainer>
              </PanelCard>

              <PanelCard title={t("التوظيف والتدريب حسب التخصص", "Employment and Internships by Major")}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                    <XAxis dataKey="dept" tick={{ fill: chart.tick, fontSize: 11 }} />
                    <YAxis tick={{ fill: chart.tick, fontSize: 12 }} />
                    <Tooltip contentStyle={chart.tooltip} />
                    <Bar dataKey="employed" fill={chart.primary} radius={[8, 8, 0, 0]} name={t("موظفين %", "Employed %")} />
                    <Bar dataKey="internships" fill={chart.emerald} radius={[8, 8, 0, 0]} name={t("تدريبات", "Internships")} />
                  </BarChart>
                </ResponsiveContainer>
              </PanelCard>
            </div>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
