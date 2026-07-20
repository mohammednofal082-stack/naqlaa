"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCourses, useProfile, useUsers } from "@/hooks/data";
import { BookOpen, Users, ClipboardList, Star } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerDashboard() {
  const { t } = useI18n();
  const pendingAssignments = [
    { id: "a1", student: t("أمير أبو شمس", "Amir Abu Shams"), course: t("React.js من الصفر للاحتراف", "React.js from Scratch to Mastery"), task: t("مشروع Todo App", "Todo App Project"), due: "2025-06-25" },
    { id: "a2", student: t("سارة خليل", "Sara Khalil"), course: t("أساسيات UI/UX Design", "UI/UX Design Fundamentals"), task: t("تصميم Wireframe", "Wireframe Design"), due: "2025-06-26" },
    { id: "a3", student: t("سارة محمد", "Sara Mohammed"), course: "Node.js & APIs", task: "REST API Challenge", due: "2025-06-28" },
  ];
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: profileData, loading: profileLoading } = useProfile();
  const loading = coursesLoading || usersLoading || profileLoading;
  const courseItems = courses ?? [];
  const enrolledStudents = (users ?? []).filter((u) => u.role === "student");
  const specialization = profileData?.profile.headline ?? t("مدرب تقني", "Technical Trainer");
  const rating = courseItems.length ? (courseItems.reduce((sum, c) => sum + c.rating, 0) / courseItems.length).toFixed(1) : "4.9";

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="trainer"
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("مساحة التدريب", "Training Workspace")}
        subtitle={specialization}
        showScenarios
        secondaryCta={{ href: "/dashboard/trainer/courses", label: t("إدارة الكورسات", "Manage Courses") }}
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 nq-skeleton h-80" />
              <div className="space-y-6">
                <div className="nq-skeleton h-48" />
                <div className="nq-skeleton h-48" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title={t("الكورسات", "Courses")} value={courseItems.length} icon={BookOpen} accent="blue" />
              <StatCard title={t("الطلاب", "Students")} value={enrolledStudents.length} icon={Users} accent="purple" />
              <StatCard title={t("واجبات معلقة", "Pending Assignments")} value={pendingAssignments.length} icon={ClipboardList} accent="amber" />
              <StatCard title={t("التقييم", "Rating")} value={rating} icon={Star} accent="emerald" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PanelCard title={t("كورساتي", "My Courses")} action={<Link href="/dashboard/trainer/courses"><Button variant="outline" size="sm">{t("إدارة الكورسات", "Manage Courses")}</Button></Link>}>
                  {courseItems.length === 0 ? (
                    <EmptyState
                      icon={BookOpen}
                      title={t("لا كورسات", "No Courses")}
                      description={t("أنشئ كورسك الأول وابدأ بنشر المحتوى.", "Create your first course and start publishing content.")}
                    />
                  ) : (
                    <div className="space-y-3">
                      {courseItems.map((course) => (
                        <div key={course.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                          <div>
                            <p className="font-semibold text-text">{course.title}</p>
                            <p className="text-sm text-text-muted">{course.category} · {course.level}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                              <span>{t(`${course.enrolledCount} مسجل`, `${course.enrolledCount} enrolled`)}</span>
                              <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{course.rating}</span>
                              <span className={course.status === "published" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                                {course.status === "published" ? t("منشور", "Published") : t("مسودة", "Draft")}
                              </span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-blue">{course.duration}</p>
                            <p className="text-xs text-text-muted">{t(`${course.modulesCount} وحدة`, `${course.modulesCount} modules`)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PanelCard>
              </div>

              <div className="space-y-6">
                <PanelCard title={t("الطلاب", "Students")} action={<Link href="/dashboard/trainer/students"><Button variant="outline" size="sm">{t("التقدم", "Progress")}</Button></Link>}>
                  {enrolledStudents.length === 0 ? (
                    <EmptyState icon={Users} title={t("لا طلاب", "No Students")} description={t("سيظهر الطلاب المسجلون هنا.", "Enrolled students will appear here.")} />
                  ) : (
                    <div className="space-y-3">
                      {enrolledStudents.map((student) => (
                        <div key={student.id} className="nq-lift flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-hover/40">
                          <div className="w-10 h-10 rounded-xl bg-emerald/10 border border-emerald/20 flex items-center justify-center font-bold text-emerald">{student.firstName[0]}</div>
                          <div>
                            <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-text-muted">{student.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PanelCard>

                <PanelCard title={t("واجبات بانتظار التصحيح", "Assignments Awaiting Grading")}>
                  <div className="space-y-3">
                    {pendingAssignments.map((item) => (
                      <div key={item.id} className="nq-lift p-3 rounded-xl border border-border bg-surface-hover/40">
                        <p className="font-medium text-sm">{item.task}</p>
                        <p className="text-xs text-text-muted">{item.student} · {item.course}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="nq-chip">{t("موعد", "Due")} {item.due}</span>
                          <Button size="sm" variant="outline">{t("تصحيح", "Grade")}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelCard>
              </div>
            </div>
          </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
