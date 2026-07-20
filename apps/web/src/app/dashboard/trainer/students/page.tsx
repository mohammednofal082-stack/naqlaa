"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { useCourses, useUsers } from "@/hooks/data";
import { Award, TrendingUp, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerStudentsPage() {
  const { t } = useI18n();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = coursesLoading || usersLoading;
  const courseItems = courses ?? [];
  const studentProgress = (users ?? [])
    .filter((u) => u.role === "student")
    .map((student, i) => ({
      student,
      course: courseItems[i % Math.max(courseItems.length, 1)],
      progress: courseItems[i % Math.max(courseItems.length, 1)]?.progress ?? [65, 30, 0][i % 3],
      lastActive: ["2025-06-20", "2025-06-18", "2025-06-15"][i % 3],
    }));

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("تقدم الطلاب", "Student Progress")}
        subtitle={t("متابعة تقدم المتعلمين", "Track learner progress")}
      >
        {loading ? (
          <div className="space-y-6">
            <div className="nq-skeleton h-64" />
            <div className="grid lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-24" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <PanelCard title={t("جدول التقدم", "Progress Table")}>
              {studentProgress.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={t("لا طلاب", "No Students")}
                  description={t("عند تسجيل طلاب في كورساتك سيظهر تقدمهم هنا.", "When students enroll in your courses, their progress will appear here.")}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-text-muted">
                        <th className="text-right py-3 px-4">{t("الطالب", "Student")}</th>
                        <th className="text-right py-3 px-4">{t("الكورس", "Course")}</th>
                        <th className="text-right py-3 px-4">{t("التقدم", "Progress")}</th>
                        <th className="text-right py-3 px-4">{t("آخر نشاط", "Last Active")}</th>
                        <th className="text-right py-3 px-4">{t("إجراء", "Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentProgress.map(({ student, course, progress, lastActive }) => (
                        <tr key={student.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center text-sm font-bold text-emerald">
                                {student.firstName[0]}
                              </div>
                              {student.firstName} {student.lastName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{course?.title}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-emerald font-medium tabular-nums">{progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{lastActive}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline">{t("التفاصيل", "Details")}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </PanelCard>

            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <StatCard title={t("طلاب نشطون", "Active Students")} value={studentProgress.length} icon={Users} accent="blue" />
              <StatCard title={t("متوسط التقدم", "Average Progress")} value="48%" icon={TrendingUp} accent="emerald" />
              <StatCard title={t("شهادات معلقة", "Pending Certificates")} value={2} icon={Award} accent="amber" />
            </div>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
