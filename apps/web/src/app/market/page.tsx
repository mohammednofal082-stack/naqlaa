"use client";

import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { EmptyState } from "@/components/layout/page-header";
import { useMarketAnalysis } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { useChartTheme } from "@/lib/chart-theme";
import {
  Briefcase, GraduationCap, DollarSign, TrendingUp, MapPin, Building2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["#0d9488", "#8b5cf6", "#f59e0b", "#3b82f6", "#ef4444", "#10b981"];

export default function MarketAnalysisPage() {
  const { t } = useI18n();
  const { data, loading, error } = useMarketAnalysis();
  const chart = useChartTheme();

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("تحليل سوق العمل", "Job market analysis")} subtitle={t("مؤشرات محسوبة لحظياً من الوظائف والتدريبات المنشورة", "Metrics calculated in real time from published jobs and internships")} />
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nq-skeleton h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="nq-skeleton h-80 rounded-xl lg:col-span-2" />
            <div className="nq-skeleton h-80 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <Header title={t("تحليل سوق العمل", "Job market analysis")} subtitle={t("تعذر جلب البيانات", "Unable to load data")} />
        <EmptyState
          icon={TrendingUp}
          title={t("تعذر جلب بيانات السوق", "Unable to load market data")}
          description={error ?? t("لا توجد بيانات متاحة حالياً — حاول مرة أخرى لاحقاً", "No data available right now — please try again later")}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title={t("تحليل سوق العمل", "Job market analysis")}
        subtitle={t("مؤشرات محسوبة لحظياً من الوظائف والتدريبات المنشورة على المنصة", "Metrics calculated in real time from jobs and internships published on the platform")}
      />

      <div className="nq-page-enter mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title={t("وظائف نشطة", "Active jobs")} value={data.totalJobs} icon={Briefcase} accent="blue" />
        <StatCard title={t("فرص تدريب", "Internships")} value={data.totalInternships} icon={GraduationCap} accent="purple" />
        <StatCard title={t("متوسط الراتب", "Average salary")} value={`$${data.avgSalary.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard
          title={t("أعلى مهارة طلباً", "Most in-demand skill")}
          value={data.topSkills[0]?.skill ?? "—"}
          icon={TrendingUp}
          accent="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <PanelCard title={t("المهارات الأكثر طلباً", "Most in-demand skills")}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data.topSkills.slice(0, 10)} layout="vertical" margin={{ right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis type="number" tick={{ fill: chart.tick, fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={110}
                  tick={{ fill: chart.tick, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={chart.tooltip}
                  formatter={(value: number, name) =>
                    name === "count" ? [t(`${value} وظيفة`, `${value} jobs`), t("الطلب", "Demand")] : [value, name]
                  }
                />
                <Bar dataKey="count" fill={chart.primary} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>

        <PanelCard title={t("نمط العمل", "Work arrangement")}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data.workTypes}
                dataKey="count"
                nameKey="label"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {data.workTypes.map((entry, i) => (
                  <Cell key={entry.key} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={chart.tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <PanelCard title={t("الرواتب حسب مستوى الخبرة (USD)", "Salaries by experience level (USD)")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.salaryByExperience}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="label" tick={{ fill: chart.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} />
              <Tooltip
                contentStyle={chart.tooltip}
                formatter={(value: number, name) => {
                  const labels: Record<string, string> = { min: t("الحد الأدنى", "Minimum"), avg: t("المتوسط", "Average"), max: t("الحد الأعلى", "Maximum") };
                  return [`$${value.toLocaleString()}`, labels[String(name)] ?? name];
                }}
              />
              <Bar dataKey="min" fill={chart.grid} radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg" fill={chart.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" fill={chart.emerald} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title={t("مهارات صاعدة", "Rising skills")}>
          {data.risingSkills.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">{t("لا توجد مهارات صاعدة حالياً", "No rising skills at the moment")}</p>
          ) : (
            <div className="space-y-3">
              {data.risingSkills.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text">{skill.skill}</p>
                      <p className="text-xs text-text-muted">
                        {t(`مطلوبة في ${skill.percentage}% من أحدث الوظائف`, `Required in ${skill.percentage}% of the latest jobs`)}
                      </p>
                    </div>
                  </div>
                  {skill.avgSalary > 0 && (
                    <span className="text-sm font-bold text-text tabular-nums">
                      ${skill.avgSalary.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 pb-20 lg:pb-6">
        <PanelCard title={t("الشركات الأكثر توظيفاً", "Top hiring companies")}>
          <div className="space-y-2">
            {data.topCompanies.map((company) => (
              <div key={company.companyId} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text">{company.name}</p>
                    <p className="text-xs text-text-muted">{t(`${company.openings} فرصة مفتوحة`, `${company.openings} open positions`)}</p>
                  </div>
                </div>
                {company.avgSalary > 0 && (
                  <span className="text-xs text-text-muted tabular-nums">
                    ~${company.avgSalary.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </PanelCard>

        <Card>
          <CardTitle className="font-display mb-4">{t("التوزيع الجغرافي", "Geographic distribution")}</CardTitle>
          <div className="space-y-3">
            {data.locations.map((loc) => (
              <div key={loc.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    {loc.label}
                  </span>
                  <span className="text-xs text-text-muted tabular-nums">
                    {loc.count} ({loc.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${loc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}
