"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, PipelineBar, ActivityRow, QuickAction } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useAllApplications, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { getRoleExperience } from "@/components/role/role-experience";
import { Briefcase, Users, Calendar, UserCheck, Plus, Target, Handshake } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function CompanyDashboard() {
  const { t } = useI18n();
  const { user } = useApp();
  const role = getRoleExperience("company", t);
  const companyId = user?.organizationId ?? "comp-1";
  const { data: applications, loading } = useAllApplications();
  const { data: jobs } = useJobs();
  const apps = applications ?? [];
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === companyId);
  const companyApps = apps.filter((a) => a.company?.id === companyId || a.job?.companyId === companyId);
  const recentApps = companyApps.slice(0, 5);

  const stats = {
    activeJobs: companyJobs.filter((j) => j.status === "published" || !j.status).length,
    totalApplications: companyApps.length,
    interviewsScheduled: companyApps.filter((a) => a.status === "interview_scheduled" || a.interviewDate).length,
    hired: companyApps.filter((a) => a.status === "accepted").length,
  };

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="company"
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("مركز التوظيف", "Recruitment Center")}
        subtitle={t("إدارة الوظائف، المتقدمين، المقابلات، والشراكات الجامعية", "Manage jobs, applicants, interviews, and university partnerships")}
        showScenarios
        secondaryCta={{ href: "/dashboard/company/applications", label: t("مراجعة المتقدمين", "Review Applicants") }}
        actions={
          <Link href="/dashboard/company/jobs">
            <Button size="sm"><Plus className="w-4 h-4" /> {t("نشر وظيفة", "Post a Job")}</Button>
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
              <div className="lg:col-span-2 nq-skeleton h-80" />
              <div className="space-y-5">
                <div className="nq-skeleton h-56" />
                <div className="nq-skeleton h-40" />
              </div>
            </div>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title={t("وظائف نشطة", "Active Jobs")} value={stats.activeJobs} icon={Briefcase} accent="purple" />
          <StatCard title={t("المتقدمين", "Applicants")} value={stats.totalApplications} icon={Users} accent="blue" />
          <StatCard title={t("مقابلات", "Interviews")} value={stats.interviewsScheduled} icon={Calendar} accent="cyan" />
          <StatCard title={t("تم التوظيف", "Hired")} value={stats.hired} icon={UserCheck} accent="emerald" />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <PanelCard
              title={t("آخر المتقدمين", "Latest Applicants")}
              action={
                <Link href="/dashboard/company/applications">
                  <Button variant="outline" size="sm">{t("عرض الكل", "View All")}</Button>
                </Link>
              }
            >
              {recentApps.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={role.emptyStates.applicants.title}
                  description={role.emptyStates.applicants.description}
                  action={
                    <Link href="/dashboard/company/jobs"><Button size="sm">{t("انشر فرصة", "Post an Opportunity")}</Button></Link>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {recentApps.map((app) => (
                    <ActivityRow
                      key={app.id}
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                          {app.student?.firstName[0]}
                        </div>
                      }
                      title={`${app.student?.firstName} ${app.student?.lastName}`}
                      subtitle={app.job?.title}
                      meta={formatDate(app.appliedAt)}
                      badge={<span className="nq-chip">{applicationStatusLabel(app.status, t)}</span>}
                    />
                  ))}
                </div>
              )}
            </PanelCard>
          </div>

          <div className="space-y-5">
            <PanelCard title={t("إجراءات سريعة", "Quick Actions")}>
              <div className="space-y-2">
                <QuickAction href="/dashboard/company/applications" label={t("مراجعة المتقدمين", "Review Applicants")} icon={Users} description={t("قبول · رفض · قائمة مختصرة", "Accept · Reject · Shortlist")} />
                <QuickAction href="/dashboard/company/talent-pools" label={t("قوائم المواهب", "Talent Pools")} icon={Target} />
                <QuickAction href="/dashboard/company/partnerships" label={t("الشراكات الجامعية", "University Partnerships")} icon={Handshake} />
                <QuickAction href="/dashboard/company/reports" label={t("تقارير التوظيف", "Recruitment Reports")} icon={Briefcase} />
              </div>
            </PanelCard>
            <PanelCard title={t("قمع التوظيف", "Recruitment Funnel")}>
              <div className="space-y-3">
                <PipelineBar label={t("متقدمين", "Applicants")} count={stats.totalApplications} pct={100} />
                <PipelineBar label={t("قيد المراجعة", "Under Review")} count={companyApps.filter((a) => a.status === "under_review").length} pct={stats.totalApplications ? Math.round((companyApps.filter((a) => a.status === "under_review").length / stats.totalApplications) * 100) : 0} />
                <PipelineBar label={t("مقابلات", "Interviews")} count={stats.interviewsScheduled} pct={stats.totalApplications ? Math.round((stats.interviewsScheduled / stats.totalApplications) * 100) : 0} />
                <PipelineBar label={t("مقبولين", "Accepted")} count={stats.hired} pct={stats.totalApplications ? Math.round((stats.hired / stats.totalApplications) * 100) : 0} />
              </div>
            </PanelCard>
          </div>
        </div>
        </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
