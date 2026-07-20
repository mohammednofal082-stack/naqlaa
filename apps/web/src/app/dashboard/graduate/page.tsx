"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { RoleWorkspace } from "@/components/role/role-workspace";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, QuickAction } from "@/components/dashboard/dashboard-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { useApplications, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Briefcase, CheckCircle, Handshake, BookOpen, FileText, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function GraduateDashboard() {
  const { t } = useI18n();
  const { user } = useApp();
  const { data: applications } = useApplications();
  const { data: jobsData } = useJobs();
  const apps = applications ?? [];
  const jobs = (jobsData ?? []).slice(0, 3);
  const employed = apps.some((a) => a.status === "accepted");
  const firstName = user?.fullName.split(" ")[0] ?? t("خريج", "Graduate");
  const interviews = apps.filter((a) => a.status === "interview_scheduled" || a.interviewDate).length;

  const kanbanColumns = [
    { key: "applied", label: t("تم التقديم", "Applied"), color: "bg-blue/10 border-blue/20" },
    { key: "under_review", label: t("قيد المراجعة", "Under Review"), color: "bg-amber/10 border-amber/20" },
    { key: "interview_scheduled", label: t("مقابلة", "Interview"), color: "bg-purple/10 border-purple/20" },
    { key: "accepted", label: t("مقبول", "Accepted"), color: "bg-emerald/10 border-emerald/20" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("لوحة الخريج", "Graduate Dashboard")}
        title={t(`مرحباً، ${firstName}`, `Welcome, ${firstName}`)}
        subtitle={t("تتبع طلباتك، فرصك، ومجتمع الخريجين بعد التخرج", "Track your applications, opportunities, and the alumni community after graduation")}
        actions={<Link href="/feed"><Button variant="outline" size="sm">{t("المنصة", "Platform")}</Button></Link>}
      />

      <RoleWorkspace showScenarios showBanner={false}>
        <div className="nq-page-enter space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title={t("طلبات نشطة", "Active Applications")} value={apps.length} icon={Briefcase} accent="blue" />
          <StatCard title={t("مقابلات قادمة", "Upcoming Interviews")} value={interviews} icon={CheckCircle} accent="purple" />
          <StatCard title={t("حالة التوظيف", "Employment Status")} value={employed ? t("موظف", "Employed") : t("باحث", "Job Seeker")} icon={CheckCircle} accent="emerald" />
          <StatCard title={t("جلسات إرشاد", "Mentorship Sessions")} value={2} icon={Handshake} accent="cyan" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PanelCard title={t("وظائف مناسبة لك", "Jobs That Match You")} action={<Link href="/jobs"><Button variant="outline" size="sm">{t("عرض الكل", "View All")}</Button></Link>}>
              {jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t("لا توجد وظائف بعد", "No jobs yet")}
                  description={t("اكتشف الفرص المتاحة وابدأ التقديم اليوم.", "Discover available opportunities and start applying today.")}
                  action={<Link href="/jobs"><Button size="sm">{t("تصفح الوظائف", "Browse Jobs")}</Button></Link>}
                />
              ) : (
                <div className="space-y-3">{jobs.map((job) => <JobCard key={job.id} job={job} company={job.company} compact />)}</div>
              )}
            </PanelCard>

            <PanelCard title={t("معاينة طلبات التقديم", "Applications Preview")}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {kanbanColumns.map((col) => {
                  const items = apps.filter((a) => a.status === col.key);
                  return (
                    <div key={col.key} className={`rounded-xl border p-4 ${col.color}`}>
                      <p className="text-sm font-medium text-text-secondary mb-2">{col.label}</p>
                      <p className="text-2xl font-bold text-text mb-3">{items.length}</p>
                      <div className="space-y-2">
                        {items.slice(0, 2).map((app) => (
                          <div key={app.id} className="p-2 rounded-lg bg-surface border border-border text-xs">
                            <p className="font-medium truncate">{app.job?.title}</p>
                            <p className="text-text-muted truncate">{app.company?.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PanelCard>
          </div>

          <div className="space-y-6">
            <PanelCard title={t("حالة التوظيف", "Employment Status")}>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald/10 border border-emerald/20">
                <CheckCircle className="w-8 h-8 text-emerald" />
                <div>
                  <p className="font-semibold text-text">{employed ? t("تم قبولك في تدريب", "You have been accepted for training") : t("باحث عن عمل", "Job Seeker")}</p>
                  <p className="text-sm text-text-secondary">{t("آخر تحديث", "Last updated")} {formatDate("2025-06-15")}</p>
                </div>
              </div>
            </PanelCard>

            <PanelCard title={t("خدمات مهنية", "Professional Services")}>
              <div className="space-y-2">
                <QuickAction href="/mentorship" label={t("جلسات الإرشاد", "Mentorship Sessions")} icon={Handshake} />
                <QuickAction href="/courses" label={t("كورسات التطوير", "Development Courses")} icon={BookOpen} />
                <QuickAction href="/ai/cv-analyzer" label={t("مراجعة السيرة", "CV Review")} icon={FileText} />
                <QuickAction href="/community" label={t("مجتمع الخريجين", "Alumni Community")} icon={Users} />
              </div>
            </PanelCard>

            <PanelCard title={t("آخر الطلبات", "Latest Applications")}>
              {apps.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title={t("لا توجد طلبات بعد", "No applications yet")}
                  description={t("عند تقديمك على وظيفة ستظهر حالتها هنا.", "When you apply for a job, its status will appear here.")}
                />
              ) : (
                <div className="space-y-2">
                  {apps.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface-hover/40">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{app.job?.title}</p>
                        <p className="text-xs text-text-muted truncate">{app.company?.name}</p>
                      </div>
                      <span className="nq-chip">{applicationStatusLabel(app.status, t)}</span>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>
          </div>
        </div>
        </div>
      </RoleWorkspace>
    </DashboardLayout>
  );
}
