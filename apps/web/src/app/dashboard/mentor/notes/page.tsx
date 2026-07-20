"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useI18n } from "@/i18n";

export default function MentorNotesPage() {
  const { t } = useI18n();
  const notes = [
    { id: "n1", student: t("أمين صلاحات", "Amin Salahat"), session: t("مراجعة CV", "CV Review"), date: "2025-06-22", preview: t("يحتاج تحسين قسم المشاريع وإضافة metrics...", "Needs to improve the projects section and add metrics...") },
    { id: "n2", student: t("ليلى أحمد", "Layla Ahmed"), session: t("مسار مهني", "Career Path"), date: "2025-06-20", preview: t("التركيز على Frontend ثم الانتقال لـ Full Stack...", "Focus on Frontend first, then transition to Full Stack...") },
    { id: "n3", student: t("محمد عمر", "Mohamed Omar"), session: "Mock Interview", date: "2025-06-18", preview: t("أداء جيد في التواصل، يحتاج تحضير أكثر للأسئلة التقنية...", "Good communication skills; needs more preparation for technical questions...") },
  ];
  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("ملاحظات الجلسات", "Session Notes")}
        subtitle={t("ملاحظات وخطوات عمل لكل متدرب", "Notes and action items for each mentee")}
        actions={<Button size="sm"><Plus className="w-4 h-4" /> {t("ملاحظة جديدة", "New Note")}</Button>}
      >
        <PanelCard title={t("الملاحظات المحفوظة", "Saved Notes")}>
          {notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("لا ملاحظات", "No Notes")}
              description={t("أضف ملاحظات بعد كل جلسة إرشادية.", "Add notes after each mentorship session.")}
              action={<Button size="sm"><Plus className="w-4 h-4" /> {t("ملاحظة جديدة", "New Note")}</Button>}
            />
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="nq-lift p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="font-semibold text-text">{n.student} — {n.session}</p>
                    <span className="nq-chip shrink-0">{n.date}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{n.preview}</p>
                  <Button variant="ghost" size="sm" className="mt-3"><FileText className="w-4 h-4" /> {t("عرض كامل", "View Full")}</Button>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
