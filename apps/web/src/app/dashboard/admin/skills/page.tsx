"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/data";
import { Plus, Target, TrendingUp, X } from "lucide-react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-admin-skills";

type SkillItem = { name: string; demand: number; category: string };

function loadCustomSkills(): SkillItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SkillItem[]) : [];
  } catch {
    return [];
  }
}

export default function AdminSkillsPage() {
  const { t } = useI18n();
  const { data: profileData, loading } = useProfile();
  const skillLevels = profileData?.skillLevels ?? [];
  const userSkills = profileData?.profile.skills ?? [];

  const [customSkills, setCustomSkills] = useState<SkillItem[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDemand, setFormDemand] = useState(50);
  const [formCategory, setFormCategory] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCustomSkills(loadCustomSkills());
    void (async () => {
      try {
        const res = await fetch("/api/data/skills");
        const json = await res.json();
        if (!res.ok || !Array.isArray(json.data)) return;
        const fromApi = (json.data as { name: string; demand: number; category: string }[]).map((s) => ({
          name: s.name,
          demand: s.demand,
          category: s.category,
        }));
        if (fromApi.length) {
          setCustomSkills(fromApi);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fromApi));
        }
      } catch {
        /* keep local */
      }
    })();
  }, []);

  const persist = (next: SkillItem[]) => {
    setCustomSkills(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const platformSkills: SkillItem[] = [
    ...skillLevels.map((s) => ({ name: s.skill, demand: s.value, category: t("تقنية", "Technical") })),
    ...userSkills
      .filter((name) => !skillLevels.some((s) => s.skill === name))
      .map((name) => ({ name, demand: 50, category: t("مسجّلة", "Registered") })),
    ...customSkills.filter(
      (c) =>
        !skillLevels.some((s) => s.skill === c.name) &&
        !userSkills.includes(c.name)
    ),
  ];

  const filtered = platformSkills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const gaps = skillLevels.filter((s) => s.value < 60).map((s) => s.skill);

  const openCreate = () => {
    setEditingName(null);
    setFormName("");
    setFormDemand(50);
    setFormCategory(t("تقنية", "Technical"));
    setShowForm(true);
    setMessage("");
  };

  const openEdit = (skill: SkillItem) => {
    setEditingName(skill.name);
    setFormName(skill.name);
    setFormDemand(skill.demand);
    setFormCategory(skill.category);
    setShowForm(true);
    setMessage("");
  };

  const saveSkill = async () => {
    const name = formName.trim();
    if (!name) return;
    const item: SkillItem = { name, demand: formDemand, category: formCategory.trim() || t("تقنية", "Technical") };
    try {
      const res = await fetch("/api/data/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        const saved = json.data as SkillItem;
        const next = [...customSkills.filter((s) => s.name !== editingName && s.name !== saved.name), saved];
        persist(next);
        setMessage(t("تم حفظ المهارة في قاعدة البيانات", "Skill saved to database"));
        setShowForm(false);
        return;
      }
    } catch {
      /* fall through */
    }
    if (editingName) {
      const next = customSkills.some((s) => s.name === editingName)
        ? customSkills.map((s) => (s.name === editingName ? item : s))
        : [...customSkills.filter((s) => s.name !== item.name), item];
      persist(next);
      setMessage(t("تم تحديث المهارة محلياً", "Skill updated locally"));
    } else {
      if (platformSkills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        setMessage(t("المهارة موجودة مسبقاً", "Skill already exists"));
        return;
      }
      persist([...customSkills, item]);
      setMessage(t("تمت إضافة المهارة محلياً", "Skill added locally"));
    }
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("المهارات", "Skills")}
        subtitle={t("إدارة قاموس المهارات والفجوات", "Manage the skills dictionary and gaps")}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            {t("مهارة جديدة", "New Skill")}
          </Button>
        }
      >
        {message && (
          <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
        )}

        {showForm && (
          <PanelCard title={editingName ? t("تعديل مهارة", "Edit Skill") : t("مهارة جديدة", "New Skill")} className="mb-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={t("اسم المهارة", "Skill name")}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                placeholder={t("التصنيف", "Category")}
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="number"
                min={0}
                max={100}
                placeholder={t("الطلب %", "Demand %")}
                value={formDemand}
                onChange={(e) => setFormDemand(Number(e.target.value) || 0)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => void saveSkill()}>{t("حفظ", "Save")}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

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
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="nq-skeleton h-14" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
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
                    badge={
                      <Button size="sm" variant="outline" onClick={() => openEdit(skill)}>
                        {t("تعديل", "Edit")}
                      </Button>
                    }
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
