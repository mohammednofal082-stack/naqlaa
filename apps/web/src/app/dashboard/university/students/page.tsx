"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { studentProfile } from "@careerlink/shared";
import { useUsers } from "@/hooks/data";
import { GraduationCap, MapPin, Search, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function UniversityStudentsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { data: users, loading } = useUsers();
  const students = (users ?? []).filter((u) => u.role === "student").filter(
    (s) => !search || s.firstName.includes(search) || s.lastName.includes(search)
  );

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("دليل الطلاب", "Student Directory")}
        subtitle={t(`${students.length} طالب`, `${students.length} students`)}
      >
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={t("بحث بالاسم...", "Search by name...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nq-skeleton h-20" />
            ))}
          </div>
        ) : (
          <PanelCard title={t("الطلاب المسجلون", "Enrolled Students")}>
            {students.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("لا طلاب", "No Students")}
                description={search ? t("لا نتائج مطابقة لبحثك.", "No results match your search.") : t("عند تسجيل الطلاب سيظهرون هنا.", "Students will appear here once enrolled.")}
              />
            ) : (
              <div className="grid lg:grid-cols-2 gap-2">
                {students.map((student) => (
                  <div key={student.id} className="nq-lift rounded-lg border border-border bg-surface-hover/40 p-1">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                          {student.firstName[0]}
                        </div>
                      }
                      title={`${student.firstName} ${student.lastName}`}
                      subtitle={studentProfile.major}
                      meta={`${studentProfile.profileCompletion}%`}
                      badge={
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {studentProfile.graduationYear}
                          </span>
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {studentProfile.location}
                          </span>
                          <Button size="sm" variant="outline">{t("عرض", "View")}</Button>
                        </div>
                      }
                    />
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
