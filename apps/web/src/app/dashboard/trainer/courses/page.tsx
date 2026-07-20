"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/data";
import { BookOpen, Plus, Star, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerCoursesPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const { data: courses, loading } = useCourses();
  const filtered = (courses ?? []).filter((c) => filter === "all" || c.status === filter);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("بناء الكورسات", "Course Builder")}
        subtitle={t("إدارة ونشر الكورسات", "Manage and publish courses")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("كورس جديد", "New Course")}
          </Button>
        }
      >
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>{t("الكل", "All")}</Button>
          <Button variant={filter === "published" ? "primary" : "outline"} size="sm" onClick={() => setFilter("published")}>{t("منشور", "Published")}</Button>
          <Button variant={filter === "draft" ? "primary" : "outline"} size="sm" onClick={() => setFilter("draft")}>{t("مسودة", "Draft")}</Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("لا كورسات", "No Courses")}
            description={t("أنشئ كورساً جديداً أو غيّر الفلتر.", "Create a new course or change the filter.")}
            action={
              <Button size="sm">
                <Plus className="w-4 h-4" />
                {t("كورس جديد", "New Course")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((course) => (
              <Card key={course.id} className="nq-lift">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-muted border border-border flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{course.title}</CardTitle>
                      <p className="text-sm text-text-secondary mt-1">{course.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-secondary">
                        <span>{course.category}</span>
                        <span>{course.level}</span>
                        <span>{course.duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber" />{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={course.status === "published" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                      {course.status === "published" ? t("منشور", "Published") : t("مسودة", "Draft")}
                    </span>
                    <Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button>
                    <Button size="sm">{t("الوحدات", "Modules")}</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
