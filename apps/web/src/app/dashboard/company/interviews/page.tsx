"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllApplications, updateApplicationStatus } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Calendar, Clock, Plus, Video, History } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function CompanyInterviewsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: applications, loading, refetch } = useAllApplications();
  const companyApps = (applications ?? []).filter(
    (a) => a.company?.id === companyId || a.job?.companyId === companyId
  );

  const interviews = companyApps.filter((a) => a.interviewDate || a.status === "interview_scheduled");
  const upcoming = interviews.filter((i) => !i.interviewDate || new Date(i.interviewDate) > new Date());
  const past = interviews.filter((i) => i.interviewDate && new Date(i.interviewDate) <= new Date());
  const shortlisted = companyApps.filter((a) => a.status === "shortlisted" || a.status === "under_review" || a.status === "applied");

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const schedule = async (id?: string, date?: string) => {
    const appId = id || selectedId;
    const interviewDate = date || (when ? new Date(when).toISOString() : undefined);
    if (!appId) return;
    setBusy(true);
    setMsg("");
    try {
      await updateApplicationStatus(appId, "interview_scheduled", interviewDate);
      setOpen(false);
      setSelectedId("");
      setWhen("");
      await refetch();
      setMsg(t("تمت جدولة المقابلة", "Interview scheduled"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الجدولة", "Schedule failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("المقابلات", "Interviews")}
        subtitle={t("جدولة وإدارة المقابلات", "Schedule and manage interviews")}
        actions={
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            <Plus className="w-4 h-4" />
            {t("جدولة مقابلة", "Schedule Interview")}
          </Button>
        }
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {open && (
          <PanelCard title={t("جدولة مقابلة جديدة", "Schedule a new interview")} className="mb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-text text-sm"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">{t("اختر مرشحاً", "Select candidate")}</option>
                {shortlisted.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.student?.firstName} {a.student?.lastName} — {a.job?.title}
                  </option>
                ))}
              </select>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" disabled={busy || !selectedId} onClick={() => void schedule()}>
                {t("تأكيد الجدولة", "Confirm schedule")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            </div>
          </PanelCard>
        )}

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="nq-skeleton h-96" />
            <div className="nq-skeleton h-96" />
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <PanelCard title={t("مقابلات قادمة", "Upcoming Interviews")}>
            {interviews.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t("لا مقابلات مجدولة", "No Scheduled Interviews")}
                description={t("ابدأ بجدولة مقابلات مع المرشحين المناسبين.", "Start scheduling interviews with suitable candidates.")}
                action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> {t("جدولة مقابلة", "Schedule Interview")}</Button>}
              />
            ) : (
            <div className="space-y-3">
              {(upcoming.length === 0 ? past : upcoming).map((item) => (
                <div key={item.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                  <ActivityRow
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {item.student?.firstName?.[0]}
                      </div>
                    }
                    title={`${item.student?.firstName} ${item.student?.lastName}`}
                    subtitle={item.job?.title}
                    badge={<span className="nq-chip">{applicationStatusLabel(item.status, t)}</span>}
                  />
                  <div className="flex items-center gap-4 mt-3 mr-12 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.interviewDate && formatDateTime(item.interviewDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t("60 دقيقة", "60 minutes")}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 mr-12">
                    <Button
                      size="sm"
                      onClick={() => {
                        window.location.href = `mailto:${item.student?.email ?? ""}?subject=${encodeURIComponent(t("مقابلة نقلة", "Naqla Interview"))}`;
                      }}
                    >
                      <Video className="w-4 h-4" />
                      {t("بدء", "Start")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOpen(true);
                        setSelectedId(item.id);
                        setWhen(item.interviewDate ? item.interviewDate.slice(0, 16) : "");
                      }}
                    >
                      {t("إعادة جدولة", "Reschedule")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </PanelCard>

          <PanelCard title={t("مقابلات سابقة", "Past Interviews")}>
            {past.length === 0 ? (
              <EmptyState
                icon={History}
                title={t("لا مقابلات سابقة", "No Past Interviews")}
                description={t("ستظهر المقابلات المكتملة هنا.", "Completed interviews will appear here.")}
              />
            ) : (
              <div className="space-y-2">
                {past.map((item) => (
                  <ActivityRow
                    key={item.id}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {item.student?.firstName?.[0]}
                      </div>
                    }
                    title={`${item.student?.firstName} ${item.student?.lastName}`}
                    subtitle={item.job?.title}
                    meta={item.interviewDate ? formatDateTime(item.interviewDate) : undefined}
                  />
                ))}
              </div>
            )}
            <Link href="/dashboard/company/applications" className="inline-block mt-4 text-sm text-brand hover:underline">
              {t("مركز مراجعة المتقدمين", "Applicant review center")}
            </Link>
          </PanelCard>
        </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
