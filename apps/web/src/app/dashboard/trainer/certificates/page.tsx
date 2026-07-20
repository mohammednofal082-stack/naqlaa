"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses, useUsers } from "@/hooks/data";
import { Award, Download } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerCertificatesPage() {
  const { t } = useI18n();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = coursesLoading || usersLoading;
  const courseItems = courses ?? [];

  const certificates = (users ?? [])
    .filter((u) => u.role === "student")
    .flatMap((student, i) =>
      courseItems.filter((c) => c.certificateEnabled).slice(0, i + 1).map((course) => ({
        id: `cert-${student.id}-${course.id}`,
        student,
        course,
        issuedAt: "2025-06-01",
        status: i === 0 ? "issued" : "pending",
      }))
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("الشهادات", "Certificates")}
        subtitle={t("إصدار وإدارة شهادات الإتمام", "Issue and manage completion certificates")}
      >
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-24" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title={t("لا شهادات", "No Certificates")}
            description={t("عند إتمام الطلاب للكورسات ستظهر الشهادات هنا.", "Certificates will appear here once students complete their courses.")}
          />
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="nq-lift">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cert.course.title}</CardTitle>
                      <p className="text-sm text-text-secondary">
                        {cert.student.firstName} {cert.student.lastName}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{t("تاريخ الإصدار:", "Issue Date:")} {cert.issuedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cert.status === "issued" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                      {cert.status === "issued" ? t("صادرة", "Issued") : t("بانتظار الإصدار", "Awaiting Issuance")}
                    </span>
                    {cert.status === "issued" ? (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                        {t("تحميل", "Download")}
                      </Button>
                    ) : (
                      <Button size="sm">{t("إصدار", "Issue")}</Button>
                    )}
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
