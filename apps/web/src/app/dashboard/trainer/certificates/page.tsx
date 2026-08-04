"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses, useUsers } from "@/hooks/data";
import { Award, Download } from "lucide-react";
import { useI18n } from "@/i18n";

type Cert = {
  id: string;
  course_id: string;
  student_id: string;
  certificate_code: string;
  qr_payload?: string;
  issued_at: string;
  courses?: { title?: string } | null;
};

export default function TrainerCertificatesPage() {
  const { t } = useI18n();
  const { data: courses, loading: coursesLoading } = useCourses();
  const { data: users, loading: usersLoading } = useUsers();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const loading = coursesLoading || usersLoading;

  const load = async () => {
    try {
      const res = await fetch("/api/data/certificates");
      const json = await res.json();
      if (res.ok) setCerts(json.data ?? []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const students = (users ?? []).filter((u) => u.role === "student" || u.role === "graduate");
  const publishable = (courses ?? []).filter((c) => c.certificateEnabled);

  const issue = async (courseId: string, studentId: string) => {
    const key = `${courseId}:${studentId}`;
    setBusy(key);
    setMsg("");
    try {
      const res = await fetch("/api/data/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, studentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      await load();
      setMsg(t("تم إصدار الشهادة", "Certificate issued"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الإصدار", "Issue failed"));
    } finally {
      setBusy(null);
    }
  };

  const download = (cert: Cert) => {
    const courseTitle = cert.courses?.title ?? courses?.find((c) => c.id === cert.course_id)?.title ?? "Course";
    const student = users?.find((u) => u.id === cert.student_id);
    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>${cert.certificate_code}</title>
<style>body{font-family:Cairo,sans-serif;padding:48px;text-align:center}h1{color:#0f172a}.code{margin-top:24px;font-family:monospace}</style></head>
<body><h1>شهادة إتمام — Naqla</h1><p>${student?.firstName ?? ""} ${student?.lastName ?? ""}</p>
<p>أتمّ بنجاح: <strong>${courseTitle}</strong></p>
<p class="code">${cert.certificate_code}</p><p>${cert.qr_payload ?? ""}</p>
<p>${new Date(cert.issued_at).toLocaleDateString("ar-PS")}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cert.certificate_code}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("الشهادات", "Certificates")}
        subtitle={t("إصدار وتحميل شهادات إتمام الكورسات", "Issue and download course completion certificates")}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="nq-skeleton h-24" />)}</div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              <p className="text-sm font-semibold text-text">{t("إصدار شهادة جديدة", "Issue a new certificate")}</p>
              {students.slice(0, 6).flatMap((student) =>
                publishable.slice(0, 2).map((course) => {
                  const key = `${course.id}:${student.id}`;
                  const already = certs.some((c) => c.course_id === course.id && c.student_id === student.id);
                  return (
                    <Card key={key} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm">{student.firstName} {student.lastName}</CardTitle>
                        <p className="text-xs text-text-muted">{course.title}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={already || busy === key}
                        onClick={() => void issue(course.id, student.id)}
                      >
                        <Award className="w-4 h-4" />
                        {already ? t("صادرة", "Issued") : t("إصدار", "Issue")}
                      </Button>
                    </Card>
                  );
                }),
              )}
            </div>

            {certs.length === 0 ? (
              <EmptyState icon={Award} title={t("لا شهادات صادرة", "No issued certificates")} description={t("أصدر شهادة من القائمة أعلاه.", "Issue a certificate from the list above.")} />
            ) : (
              <div className="space-y-3">
                {certs.map((cert) => (
                  <Card key={cert.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-text">{cert.certificate_code}</p>
                      <p className="text-xs text-text-muted">{cert.courses?.title ?? cert.course_id}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => download(cert)}>
                      <Download className="w-4 h-4" /> {t("تحميل", "Download")}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
