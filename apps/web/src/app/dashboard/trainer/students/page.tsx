"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  progress: number;
  enrolledAt: string;
};

export default function TrainerStudentsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/data/course-enrollments?scope=trainer")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) setRows(json.data as Row[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const avg = useMemo(
    () => (rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0),
    [rows]
  );

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("تقدم الطلاب", "Student Progress")}
        subtitle={t("متابعة تقدم المتعلمين", "Track learner progress")}
      >
        {loading ? (
          <div className="nq-skeleton h-64" />
        ) : (
          <>
            <PanelCard title={t("جدول التقدم", "Progress Table")}>
              {rows.length === 0 ? (
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
                        <th className="text-right py-3 px-4">{t("التسجيل", "Enrolled")}</th>
                        <th className="text-right py-3 px-4">{t("إجراء", "Action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-border">
                          <td className="py-3 px-4">{row.studentName || row.studentEmail}</td>
                          <td className="py-3 px-4 text-text-secondary">{row.courseTitle}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-emerald" style={{ width: `${row.progress}%` }} />
                              </div>
                              <span className="text-emerald font-medium">{row.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">{formatDate(row.enrolledAt)}</td>
                          <td className="py-3 px-4 flex gap-2">
                            <Link href={`/profile/${row.studentId}`}><Button size="sm" variant="outline">{t("الملف", "Profile")}</Button></Link>
                            <Link href={`/messages?user=${row.studentId}`}><Button size="sm">{t("مراسلة", "Message")}</Button></Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </PanelCard>
            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <StatCard title={t("طلاب مسجّلون", "Enrolled students")} value={rows.length} icon={Users} accent="blue" />
              <StatCard title={t("متوسط التقدم", "Average Progress")} value={`${avg}%`} icon={TrendingUp} accent="emerald" />
              <StatCard title={t("مكتملون", "Completed")} value={rows.filter((r) => r.progress >= 100).length} icon={Award} accent="amber" />
            </div>
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
