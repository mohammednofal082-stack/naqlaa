"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus } from "lucide-react";
import { useI18n } from "@/i18n";

type Department = { id: string; name: string; code?: string };
type College = { id: string; name: string; departments?: Department[] };
type University = { id: string; name: string; name_en?: string; colleges?: College[] };

export default function UniversityDepartmentsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/universities");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setItems(json.data ?? []);
      const firstCollege = (json.data ?? []).flatMap((u: University) => u.colleges ?? [])[0];
      if (firstCollege && !collegeId) setCollegeId(firstCollege.id);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحميل", "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addDepartment = async () => {
    if (!collegeId || !name.trim()) return;
    setMsg("");
    try {
      const res = await fetch("/api/data/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "department", collegeId, name: name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setName("");
      await load();
      setMsg(t("تمت إضافة القسم", "Department added"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  const colleges = items.flatMap((u) => (u.colleges ?? []).map((c) => ({ ...c, uni: u.name })));

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الكليات والتخصصات", "Faculties and Majors")}
        subtitle={t("إدارة الهيكل الأكاديمي", "Manage academic structure")}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        <PanelCard title={t("إضافة قسم", "Add department")} className="mb-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
            >
              <option value="">{t("اختر الكلية", "Select college")}</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.uni}</option>
              ))}
            </select>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("اسم القسم", "Department name")} />
            <Button onClick={() => void addDepartment()} disabled={!collegeId || !name.trim()}>
              <Plus className="w-4 h-4" /> {t("إضافة", "Add")}
            </Button>
          </div>
        </PanelCard>

        {loading ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-24" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t("لا جامعات في القاعدة", "No universities in DB")}
            description={t("نفّذ migration 009 ثم أعد التحميل.", "Run migration 009 then reload.")}
          />
        ) : (
          <div className="space-y-4">
            {items.map((uni) => (
              <PanelCard key={uni.id} title={`${uni.name}${uni.name_en ? ` · ${uni.name_en}` : ""}`}>
                {(uni.colleges ?? []).length === 0 ? (
                  <p className="text-sm text-text-muted">{t("لا كليات بعد", "No colleges yet")}</p>
                ) : (
                  <div className="space-y-3">
                    {(uni.colleges ?? []).map((college) => (
                      <div key={college.id} className="rounded-lg border border-border p-3">
                        <p className="font-medium text-text text-sm">{college.name}</p>
                        <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                          {(college.departments ?? []).map((d) => (
                            <li key={d.id}>— {d.name}{d.code ? ` (${d.code})` : ""}</li>
                          ))}
                          {(college.departments ?? []).length === 0 && (
                            <li className="text-text-muted">{t("لا أقسام", "No departments")}</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </PanelCard>
            ))}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
