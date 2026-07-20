"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllApplications } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Calendar, Clock, Plus, Video, History } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function CompanyInterviewsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: applications, loading } = useAllApplications();
  const companyApps = (applications ?? []).filter(
    (a) => a.company?.id === companyId || a.job?.companyId === companyId
  );

  const interviews = companyApps.filter((a) => a.interviewDate);
  const upcoming = interviews.filter((i) => new Date(i.interviewDate!) > new Date());
  const past = interviews.filter((i) => new Date(i.interviewDate!) <= new Date());

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("المقابلات", "Interviews")}
        subtitle={t("جدولة وإدارة المقابلات", "Schedule and manage interviews")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("جدولة مقابلة", "Schedule Interview")}
          </Button>
        }
      >
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
                action={<Button size="sm"><Plus className="w-4 h-4" /> {t("جدولة مقابلة", "Schedule Interview")}</Button>}
              />
            ) : (
            <div className="space-y-3">
              {(upcoming.length === 0 ? past : upcoming).map((item) => (
                <div key={item.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                  <ActivityRow
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                        {item.student?.firstName[0]}
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
                    <Button size="sm">
                      <Video className="w-4 h-4" />
                      {t("بدء", "Start")}
                    </Button>
                    <Button size="sm" variant="outline">{t("إعادة جدولة", "Reschedule")}</Button>
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
                        {item.student?.firstName[0]}
                      </div>
                    }
                    title={`${item.student?.firstName} ${item.student?.lastName}`}
                    subtitle={item.job?.title}
                    meta={item.interviewDate ? formatDateTime(item.interviewDate) : undefined}
                  />
                ))}
              </div>
            )}
          </PanelCard>
        </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
