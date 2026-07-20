"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { departments, universities } from "@careerlink/shared";
import { useUsers } from "@/hooks/data";
import { Building2, GraduationCap } from "lucide-react";
import { useI18n } from "@/i18n";

export default function UniversityDepartmentsPage() {
  const { t } = useI18n();
  const uni = universities[0];
  const { data: users, loading } = useUsers();
  const studentCount = users?.filter((u) => u.role === "student").length ?? 0;

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الكليات والتخصصات", "Faculties and Majors")}
        subtitle={uni.name}
      >
        {loading ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="nq-skeleton h-24" />
            ))}
          </div>
        ) : (
          <PanelCard title={t("الأقسام الأكاديمية", "Academic Departments")}>
            {departments.length === 0 ? (
              <EmptyState
                icon={Building2}
                title={t("لا أقسام", "No Departments")}
                description={t("أضف أقساماً أكاديمية لعرضها هنا.", "Add academic departments to display them here.")}
              />
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {departments.map((dept, index) => (
                  <div key={dept.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={dept.name}
                      subtitle={t(`رمز: ${dept.code} · ${dept.degreeType}`, `Code: ${dept.code} · ${dept.degreeType}`)}
                    />
                    <p className="text-xs text-text-muted mt-2 mr-12 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {t(`${Math.round(studentCount / Math.max(departments.length, 1)) + (index * 10)} طالب`, `${Math.round(studentCount / Math.max(departments.length, 1)) + (index * 10)} students`)}
                    </p>
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
