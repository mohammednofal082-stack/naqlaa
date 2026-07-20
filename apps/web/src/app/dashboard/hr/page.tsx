"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, ActivityRow } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllApplications } from "@/hooks/data";
import { Users, Calendar, Layers, ClipboardList, Inbox } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function HRDashboard() {
  const { t } = useI18n();
  const { data: applications, loading } = useAllApplications();
  const apps = applications ?? [];

  const stageMeta = [
    { label: t("متقدمين", "Applicants"), status: "applied" as const, color: "bg-blue" },
    { label: t("قيد المراجعة", "Under Review"), status: "under_review" as const, color: "bg-amber" },
    { label: t("قائمة مختصرة", "Shortlisted"), status: "shortlisted" as const, color: "bg-purple" },
    { label: t("مقابلات", "Interviews"), status: "interview_scheduled" as const, color: "bg-cyan" },
    { label: t("مقبولين", "Accepted"), status: "accepted" as const, color: "bg-emerald" },
  ];

  const pipelineStages = stageMeta.map((stage) => ({
    ...stage,
    count: apps.filter((a) => a.status === stage.status).length,
  }));

  const todayInterviews = apps.filter((a) => a.interviewDate).slice(0, 4);
  const pendingApps = apps.filter((a) => a.status === "applied" || a.status === "under_review").slice(0, 5);

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="hr"
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("قمع التوظيف", "Recruitment Funnel")}
        subtitle={t("مراجعة المتقدمين، جدولة المقابلات، وإدارة القرارات اليومية", "Review applicants, schedule interviews, and manage daily decisions")}
        showScenarios
        secondaryCta={{ href: "/dashboard/hr/pipeline", label: t("عرض القمع", "View Funnel") }}
        actions={
          <Link href="/dashboard/hr/interviews">
            <Button size="sm"><Calendar className="w-4 h-4" /> {t("جدولة مقابلة", "Schedule Interview")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="nq-skeleton h-64" />
                <div className="nq-skeleton h-40" />
              </div>
              <div className="nq-skeleton h-96" />
            </div>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title={t("متقدمين معلقين", "Pending Applicants")} value={pendingApps.length} icon={ClipboardList} accent="amber" />
          <StatCard title={t("مقابلات اليوم", "Today's Interviews")} value={todayInterviews.length} icon={Calendar} accent="purple" />
          <StatCard title={t("إجمالي المتقدمين", "Total Applicants")} value={apps.length} icon={Users} accent="blue" />
          <StatCard title={t("مراحل القمع", "Funnel Stages")} value={pipelineStages.length} icon={Layers} accent="cyan" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <PanelCard
              title={t("مقابلات اليوم", "Today's Interviews")}
              action={
                <Link href="/dashboard/hr/interviews">
                  <Button variant="outline" size="sm">{t("جدولة", "Schedule")}</Button>
                </Link>
              }
            >
              {todayInterviews.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title={t("لا مقابلات اليوم", "No Interviews Today")}
                  description={t("عند جدولة مقابلات جديدة ستظهر هنا.", "New interviews will appear here once scheduled.")}
                  action={
                    <Link href="/dashboard/hr/interviews"><Button size="sm">{t("جدولة مقابلة", "Schedule Interview")}</Button></Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {todayInterviews.map((item) => (
                    <ActivityRow
                      key={item.id}
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center font-bold text-purple text-sm">
                          {item.student?.firstName[0]}
                        </div>
                      }
                      title={`${item.student?.firstName} ${item.student?.lastName}`}
                      subtitle={item.job?.title}
                      meta={item.interviewDate ? formatDateTime(item.interviewDate) : undefined}
                      badge={<span className="nq-chip">{applicationStatusLabel(item.status, t)}</span>}
                    />
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard
              title={t("قمع التوظيف", "Recruitment Funnel")}
              action={
                <Link href="/dashboard/hr/pipeline">
                  <Button variant="outline" size="sm">{t("عرض الكامل", "View All")}</Button>
                </Link>
              }
            >
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {pipelineStages.map((stage) => (
                  <div key={stage.status} className="nq-lift flex-shrink-0 w-36 rounded-lg border border-border bg-surface-hover/50 p-4">
                    <p className="text-xs font-medium text-text-secondary mb-1">{stage.label}</p>
                    <p className="font-display text-2xl font-bold text-text tabular-nums">{stage.count}</p>
                    <div className="mt-2 h-1.5 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${Math.min(stage.count * 5, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>
          </div>

          <PanelCard
            title={t("بانتظار المراجعة", "Awaiting Review")}
            action={
              <Link href="/dashboard/hr/candidates">
                <Button variant="outline" size="sm">{t("الكل", "All")}</Button>
              </Link>
            }
          >
            {pendingApps.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={t("لا طلبات معلقة", "No Pending Applications")}
                description={t("جميع الطلبات تمت مراجعتها. أحسنت!", "All applications have been reviewed. Well done!")}
              />
            ) : (
              <div className="space-y-3">
                {pendingApps.map((app) => (
                  <div key={app.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-semibold text-sm truncate">{app.student?.firstName} {app.student?.lastName}</p>
                      <span className="nq-chip shrink-0">{applicationStatusLabel(app.status, t)}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate">{app.job?.title}</p>
                    <p className="text-xs text-text-muted mt-1">{t("تقدم", "Applied")} {formatDate(app.appliedAt)}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">{t("مراجعة", "Review")}</Button>
                      <Button size="sm">{t("جدولة", "Schedule")}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        </div>
        </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
