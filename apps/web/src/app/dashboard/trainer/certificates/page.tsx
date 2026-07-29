"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses, useUsers } from "@/hooks/data";
import { Award, Download } from "lucide-react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-trainer-certificates-issued";

export default function TrainerCertificatesPage() {
  const { t } = useI18n();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = coursesLoading || usersLoading;
  const courseItems = courses ?? [];
  const [issuedIds, setIssuedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIssuedIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const baseCertificates = useMemo(
    () =>
      (users ?? [])
        .filter((u) => u.role === "student")
        .flatMap((student, i) =>
          courseItems
            .filter((c) => c.certificateEnabled)
            .slice(0, i + 1)
            .map((course) => ({
              id: `cert-${student.id}-${course.id}`,
              student,
              course,
              issuedAt: "2025-06-01",
              initiallyIssued: i === 0,
            }))
        )
        .slice(0, 5),
    [users, courseItems]
  );

  const certificates = baseCertificates.map((cert) => ({
    ...cert,
    status: cert.initiallyIssued || issuedIds.has(cert.id) ? "issued" : "pending",
  }));

  const markIssued = (id: string) => {
    const next = new Set(issuedIds);
    next.add(id);
    setIssuedIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const downloadCert = (cert: (typeof certificates)[0]) => {
    const text = [
      "Naqlah Certificate of Completion",
      "================================",
      `Course: ${cert.course.title}`,
      `Student: ${cert.student.firstName} ${cert.student.lastName}`,
      `Issued: ${cert.issuedAt}`,
      `Certificate ID: ${cert.id}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cert.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                      <p className="text-xs text-text-muted mt-1">
                        {t("تاريخ الإصدار:", "Issue Date:")} {cert.issuedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cert.status === "issued" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                      {cert.status === "issued" ? t("صادرة", "Issued") : t("بانتظار الإصدار", "Awaiting Issuance")}
                    </span>
                    {cert.status === "issued" ? (
                      <Button size="sm" variant="outline" onClick={() => downloadCert(cert)}>
                        <Download className="w-4 h-4" />
                        {t("تحميل", "Download")}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => markIssued(cert.id)}>
                        {t("إصدار", "Issue")}
                      </Button>
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
