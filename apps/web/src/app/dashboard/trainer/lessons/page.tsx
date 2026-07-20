"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/data";
import { FileText, Plus, Play } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerLessonsPage() {
  const { t } = useI18n();
  const lessons = [
    { id: "1", title: t("مقدمة في React", "Introduction to React"), course: t("React.js من الصفر", "React.js from Scratch"), duration: t("45 د", "45 min"), type: t("فيديو", "Video") },
    { id: "2", title: "Components & Props", course: t("React.js من الصفر", "React.js from Scratch"), duration: t("60 د", "60 min"), type: t("فيديو", "Video") },
    { id: "3", title: "State & Hooks", course: t("React.js من الصفر", "React.js from Scratch"), duration: t("55 د", "55 min"), type: t("تفاعلي", "Interactive") },
    { id: "4", title: t("أساسيات التصميم", "Design Fundamentals"), course: "UI/UX Design", duration: t("40 د", "40 min"), type: t("نص", "Text") },
  ];
  const { data: courses, loading } = useCourses();
  const courseCount = courses?.length ?? 0;

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("إدارة الدروس", "Lesson Management")}
        subtitle={t("أضف وعدّل دروس الكورسات — فيديو، نص، أو تفاعلي", "Add and edit course lessons — video, text, or interactive")}
        actions={<Button size="sm"><Plus className="w-4 h-4" /> {t("درس جديد", "New Lesson")}</Button>}
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nq-skeleton h-20" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${lessons.length} دروس في ${courseCount} كورسات`, `${lessons.length} lessons across ${courseCount} courses`)}>
            {lessons.length === 0 ? (
              <EmptyState
                icon={Play}
                title={t("لا دروس", "No Lessons")}
                description={t("أضف درساً جديداً لبدء بناء المحتوى.", "Add a new lesson to start building content.")}
                action={<Button size="sm"><Plus className="w-4 h-4" /> {t("درس جديد", "New Lesson")}</Button>}
              />
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-text">{lesson.title}</p>
                        <p className="text-sm text-text-muted">{lesson.course} · {lesson.type} · {lesson.duration}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><FileText className="w-4 h-4" /> {t("تعديل", "Edit")}</Button>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
