"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllApplications } from "@/hooks/data";
import { Calendar, Clock, Plus, Video } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function HRInterviewsPage() {
  const { t } = useI18n();
  const [view, setView] = useState<"calendar" | "list">("list");
  const { data: applications, loading } = useAllApplications();
  const apps = applications ?? [];

  const interviews = apps.filter((a) => a.interviewDate || a.status === "interview_scheduled");

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("جدولة المقابلات", "Interview Scheduling")}
        subtitle={t(`${interviews.length} مقابلة`, `${interviews.length} interviews`)}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("جدولة جديدة", "New Schedule")}
          </Button>
        }
      >
        <div className="flex gap-2 mb-6">
          <Button variant={view === "list" ? "primary" : "outline"} size="sm" onClick={() => setView("list")}>
            {t("قائمة", "List")}
          </Button>
          <Button variant={view === "calendar" ? "primary" : "outline"} size="sm" onClick={() => setView("calendar")}>
            {t("تقويم", "Calendar")}
          </Button>
        </div>

        {view === "calendar" ? (
          <PanelCard title={t("تقويم المقابلات", "Interview Calendar")}>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {[t("أحد", "Sun"), t("إثن", "Mon"), t("ثلا", "Tue"), t("أرب", "Wed"), t("خم", "Thu"), t("جم", "Fri"), t("سب", "Sat")].map((day) => (
                <div key={day} className="p-2 font-medium text-text-secondary">{day}</div>
              ))}
              {Array.from({ length: 28 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border border-border min-h-[80px]",
                    i === 24 ? "bg-brand-muted border-brand/30" : "bg-surface-hover/40"
                  )}
                >
                  <span className="text-sm text-text-secondary">{i + 1}</span>
                  {i === 24 && interviews[0] && (
                    <p className="text-xs mt-1 text-brand truncate">{interviews[0].student?.firstName}</p>
                  )}
                </div>
              ))}
            </div>
          </PanelCard>
        ) : (
          <PanelCard title={t("المقابلات المجدولة", "Scheduled Interviews")}>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="nq-skeleton h-28" />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t("لا مقابلات مجدولة", "No Scheduled Interviews")}
                description={t("ابدأ بجدولة مقابلة جديدة مع أحد المرشحين.", "Start by scheduling a new interview with a candidate.")}
                action={<Button size="sm"><Plus className="w-4 h-4" /> {t("جدولة جديدة", "New Schedule")}</Button>}
              />
            ) : (
            <div className="space-y-2">
              {interviews.map((item) => (
                <div key={item.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                  <ActivityRow
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-brand" />
                      </div>
                    }
                    title={`${item.student?.firstName} ${item.student?.lastName}`}
                    subtitle={item.job?.title}
                    badge={<span className="nq-chip">{applicationStatusLabel(item.status, t)}</span>}
                  />
                  {item.interviewDate && (
                    <p className="text-sm text-text-secondary mt-2 mr-12 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(item.interviewDate)}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3 mr-12">
                    <Button size="sm">
                      <Video className="w-4 h-4" />
                      {t("بدء", "Start")}
                    </Button>
                    <Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button>
                  </div>
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
