"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { useUsers } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Building2 } from "lucide-react";
import { useI18n } from "@/i18n";

export default function UniversityDepartmentsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const { loading } = useUsers();
  const uniName =
    user?.role === "university" && user.fullName
      ? user.fullName
      : t("جامعة النجاح الوطنية", "An-Najah National University");

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الكليات والتخصصات", "Faculties and Majors")}
        subtitle={uniName}
      >
        {loading ? (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="nq-skeleton h-24" />
            ))}
          </div>
        ) : (
          <PanelCard title={t("الأقسام الأكاديمية", "Academic Departments")}>
            <EmptyState
              icon={Building2}
              title={t("لا أقسام", "No Departments")}
              description={t("أضف أقساماً أكاديمية لعرضها هنا.", "Add academic departments to display them here.")}
            />
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
