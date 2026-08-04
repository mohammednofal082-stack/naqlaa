"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllApplications, updateApplicationStatus } from "@/hooks/data";
import { applicationStatusLabel } from "@/i18n/labels";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Download, FileText, MessageSquare, User } from "lucide-react";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const { t } = useI18n();
  const { data: applications, loading, refetch } = useAllApplications();
  const app = useMemo(
    () => (applications ?? []).find((a) => a.id === applicationId),
    [applications, applicationId]
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const decide = async (status: "accepted" | "rejected" | "interview_scheduled") => {
    setBusy(true);
    setMsg("");
    try {
      await updateApplicationStatus(applicationId, status);
      await refetch();
      setMsg(t("تم تحديث الحالة", "Status updated"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("الطلبات", "Applications")}
        title={
          app
            ? `${app.student?.firstName ?? ""} ${app.student?.lastName ?? ""}`.trim() || t("مرشح", "Candidate")
            : t("تفاصيل الطلب", "Application details")
        }
        subtitle={app?.job?.title ?? applicationId}
        actions={
          <Link href="/dashboard/company/applications">
            <Button size="sm" variant="outline">{t("العودة", "Back")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="nq-skeleton h-64" />
        ) : !app ? (
          <EmptyState
            icon={FileText}
            title={t("الطلب غير موجود", "Application not found")}
            description={t("تحقق من الرابط أو عد للقائمة.", "Check the link or go back to the list.")}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <PanelCard title={t("الملف", "Profile")} className="lg:col-span-2">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-muted flex items-center justify-center text-brand font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-text">
                    {app.student?.firstName} {app.student?.lastName}
                  </p>
                  <p className="text-sm text-text-secondary">{app.student?.email}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {t("قدّم", "Applied")} {formatDate(app.appliedAt)} · {applicationStatusLabel(app.status, t)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {app.coverNote ||
                  t("لا توجد رسالة تغطية — راجع المهارات والحالة أدناه.", "No cover note — review skills and status below.")}
              </p>
              {app.interviewDate && (
                <p className="text-sm text-brand mt-4">
                  {t("موعد المقابلة:", "Interview:")} {formatDateTime(app.interviewDate)}
                </p>
              )}
              {msg && <p className="text-sm text-text-secondary mt-3">{msg}</p>}
              <div className="flex flex-wrap gap-2 mt-5">
                <Button size="sm" disabled={busy} onClick={() => void decide("accepted")}>{t("قبول", "Accept")}</Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void decide("interview_scheduled")}>{t("جدولة مقابلة", "Schedule interview")}</Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => void decide("rejected")}>{t("رفض", "Reject")}</Button>
                {app.studentId && (
                  <Link href={`/messages?user=${app.studentId}`}>
                    <Button size="sm" variant="outline"><MessageSquare className="w-4 h-4" /> {t("مراسلة", "Message")}</Button>
                  </Link>
                )}
                {app.studentId && (
                  <Link href={`/profile/${app.studentId}`}>
                    <Button size="sm" variant="outline">{t("الملف العام", "Public profile")}</Button>
                  </Link>
                )}
              </div>
            </PanelCard>
            <PanelCard title={t("التفاصيل", "Details")}>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>{t("الوظيفة:", "Job:")} {app.job?.title ?? "—"}</p>
                <p>{t("الشركة:", "Company:")} {app.company?.name ?? "—"}</p>
                <p>{t("التطابق:", "Match:")} {app.matchScore ?? 0}%</p>
                <p>{t("الحالة:", "Status:")} {applicationStatusLabel(app.status, t)}</p>
              </div>
              {app.studentId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => {
                    void (async () => {
                      try {
                        const res = await fetch(
                          `/api/data/cv?userId=${encodeURIComponent(app.studentId)}`
                        );
                        const json = await res.json();
                        if (!res.ok || !json.data?.publicUrl) {
                          setMsg(t("لا توجد سيرة ذاتية مرفوعة", "No uploaded CV found"));
                          return;
                        }
                        window.open(String(json.data.publicUrl), "_blank", "noopener,noreferrer");
                      } catch {
                        setMsg(t("فشل تحميل السيرة", "Failed to download CV"));
                      }
                    })();
                  }}
                >
                  <Download className="w-4 h-4" />
                  {t("تحميل السيرة", "Download CV")}
                </Button>
              )}
            </PanelCard>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
