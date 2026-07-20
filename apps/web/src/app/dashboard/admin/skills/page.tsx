"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { skillAnalysis, studentProfile } from "@careerlink/shared";
import { Plus, Target, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AdminSkillsPage() {
  const { t } = useI18n();
  const platformSkills = [
    ...skillAnalysis.map((s) => ({ name: s.skill, demand: s.value, category: t("تقنية", "Technical") })),
    { name: "Docker", demand: 45, category: "DevOps" },
    { name: "CI/CD", demand: 40, category: "DevOps" },
    { name: "Agile", demand: 55, category: t("عمل", "Business") },
  ];
  const [search, setSearch] = useState("");
  const filtered = platformSkills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const gaps = studentProfile.skills.length > 0 ? ["Docker", "CI/CD", "Testing"] : [];

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("المهارات", "Skills")}
        subtitle={t("إدارة قاموس المهارات والفجوات", "Manage the skills dictionary and gaps")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("مهارة جديدة", "New Skill")}
          </Button>
        }
      >
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder={t("بحث عن مهارة...", "Search for a skill...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <PanelCard title={t("قاموس المهارات", "Skills Dictionary")}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Target}
                title={t("لا نتائج", "No Results")}
                description={t("جرّب كلمة بحث أخرى.", "Try a different search term.")}
              />
            ) : (
              <div className="space-y-2">
                {filtered.map((skill) => (
                  <ActivityRow
                    key={skill.name}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                        <Target className="w-4 h-4 text-brand" />
                      </div>
                    }
                    title={skill.name}
                    subtitle={skill.category}
                    meta={t(`${skill.demand}% طلب`, `${skill.demand}% demand`)}
                    badge={<Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button>}
                  />
                ))}
              </div>
            )}
          </PanelCard>

          <div className="space-y-6">
            <PanelCard title={t("فجوات مهارية", "Skill Gaps")}>
              {gaps.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title={t("لا فجوات نشطة", "No Active Gaps")}
                  description={t("عند رصد فجوات مهارية ستظهر هنا.", "When skill gaps are detected, they will appear here.")}
                />
              ) : (
                <div className="space-y-2">
                  {gaps.map((gap) => (
                    <div key={gap} className="nq-lift flex items-center justify-between p-3 rounded-lg border border-border bg-surface-hover/40">
                      <span className="font-medium text-sm text-text">{gap}</span>
                      <span className="nq-chip nq-chip-emerald flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {t("طلب مرتفع", "High Demand")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard title={t("إحصائيات", "Statistics")}>
              <div className="grid grid-cols-2 gap-3">
                <StatCard title={t("مهارة مسجلة", "Registered Skills")} value={platformSkills.length} icon={Target} />
                <StatCard title={t("فجوات نشطة", "Active Gaps")} value={gaps.length} icon={TrendingUp} />
              </div>
            </PanelCard>
          </div>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
