"use client";

import Link from "next/link";
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
  const { data: courses, loading } = useCourses();
  const list = courses ?? [];

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("إدارة الدروس", "Lesson Management")}
        subtitle={t("أضف وعدّل دروس الكورسات من بناء الوحدات", "Add and edit course lessons from the modules builder")}
        actions={
          <Link href="/dashboard/trainer/courses">
            <Button size="sm"><Plus className="w-4 h-4" /> {t("درس جديد", "New Lesson")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nq-skeleton h-20" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${list.length} كورسات`, `${list.length} courses`)}>
            {list.length === 0 ? (
              <EmptyState
                icon={Play}
                title={t("لا دروس", "No Lessons")}
                description={t("أضف درساً جديداً لبدء بناء المحتوى.", "Add a new lesson to start building content.")}
                action={
                  <Link href="/dashboard/trainer/courses">
                    <Button size="sm"><Plus className="w-4 h-4" /> {t("فتح بناء الكورسات", "Open course builder")}</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {list.map((course) => (
                  <div key={course.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-text">{course.title}</p>
                        <p className="text-sm text-text-muted">{course.category} · {course.level} · {course.duration}</p>
                      </div>
                    </div>
                    <Link href="/dashboard/trainer/courses">
                      <Button variant="outline" size="sm"><FileText className="w-4 h-4" /> {t("الوحدات والدروس", "Modules & lessons")}</Button>
                    </Link>
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
