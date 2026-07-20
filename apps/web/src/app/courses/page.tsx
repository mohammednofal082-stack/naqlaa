"use client";

import { useState } from "react";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/page-header";
import { useCourses, enrollInCourse } from "@/hooks/data";
import { BookOpen, Clock, Star, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function CoursesPage() {
  const { t } = useI18n();
  const { data: courses, loading, refetch } = useCourses();
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const list = courses ?? [];

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      await enrollInCourse(courseId);
      await refetch();
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("الكورسات", "Courses")} subtitle={t("كورسات لتطوير مهاراتك المهنية", "Courses to develop your professional skills")} />
        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="nq-skeleton h-56 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={t("الكورسات", "Courses")} subtitle={`${list.length} ${t("كورس متاح", "courses available")}`} />

      <div className="nq-page-enter mt-6">
        {list.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("لا توجد كورسات متاحة حالياً", "No courses available yet")}
            description={t("تُضاف كورسات جديدة باستمرار — استكشف الأدوات المهنية لتطوير مهاراتك", "New courses are added regularly — explore the professional tools to develop your skills")}
            action={
              <Link href="/ai" className="btn-ghost">{t("استكشف الأدوات المهنية", "Explore Professional Tools")}</Link>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            {list.map((course) => {
              const isEnrolled = course.progress != null && course.progress >= 0;
              const progress = course.progress ?? 0;

              return (
                <Card key={course.id} className="nq-lift flex flex-col">
                  <div className="mb-4">
                    <span className="text-text-muted text-xs">{course.category}</span>
                    <CardTitle className="font-display font-bold mt-1">{course.title}</CardTitle>
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">{course.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.modulesCount} {t("وحدة", "modules")}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolledCount}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{course.rating}</span>
                  </div>

                  {isEnrolled && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-text-secondary">{t("التقدم", "Progress")}</span>
                        <span className="nq-chip-emerald nq-chip tabular-nums">{progress}%</span>
                      </div>
                      <div className="h-2 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-text-muted text-xs">{course.level}</span>
                    {isEnrolled ? (
                      <Button>{t("متابعة التعلم", "Continue Learning")}</Button>
                    ) : (
                      <Button onClick={() => handleEnroll(course.id)} disabled={enrolling === course.id}>
                        {enrolling === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {t("التسجيل", "Enroll")}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
