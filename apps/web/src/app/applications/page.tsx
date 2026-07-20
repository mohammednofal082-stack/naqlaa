"use client";

import Link from "next/link";
import Image from "next/image";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { useApp } from "@/contexts/app-context";
import { getRoleExperience } from "@/components/role/role-experience";
import { KanbanBoard } from "@/components/role/kanban-board";
import { RoleIdentityBanner } from "@/components/role/role-ui";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/page-header";
import { type ApplicationStatus } from "@careerlink/shared";
import { useApplications } from "@/hooks/data";
import { applicationStatusLabel } from "@/i18n/labels";
import { formatDate } from "@/lib/utils";
import { Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export default function ApplicationsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const role = user?.role ?? "student";
  const exp = getRoleExperience(role, t);
  const { data: applications, loading } = useApplications();
  const apps = applications ?? [];
  const isCandidate = role === "student" || role === "graduate";

  const kanbanStages: { key: ApplicationStatus; label: string; color: string }[] = [
    { key: "applied", label: t("تم التقديم", "Applied"), color: "bg-blue" },
    { key: "under_review", label: t("قيد المراجعة", "Under Review"), color: "bg-amber" },
    { key: "shortlisted", label: t("قائمة مختصرة", "Shortlisted"), color: "bg-purple" },
    { key: "interview_scheduled", label: t("مقابلة", "Interview"), color: "bg-cyan" },
    { key: "accepted", label: t("مقبول", "Accepted"), color: "bg-emerald" },
    { key: "rejected", label: t("مرفوض", "Rejected"), color: "bg-red-500" },
  ];

  if (loading && isCandidate) {
    return (
      <DashboardLayout>
        <Header title={t("تتبع طلباتك", "Track Your Applications")} subtitle={t("كل تقديم له قصة — تابعها مرحلة بمرحلة", "Every application has a story — follow it stage by stage")} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="nq-skeleton h-48 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (isCandidate) {
    const columns = kanbanStages.map((stage) => ({
      id: stage.key,
      label: stage.label,
      color: stage.color,
      items: apps.filter((a) => a.status === stage.key),
    }));

    return (
      <DashboardLayout>
        <Header title={t("تتبع طلباتك", "Track Your Applications")} subtitle={t("كل تقديم له قصة — تابعها مرحلة بمرحلة", "Every application has a story — follow it stage by stage")} />

        <div className="nq-page-enter mt-6">
        <RoleIdentityBanner role={exp} />

        {apps.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={exp.emptyStates.applications?.title ?? t("لا طلبات", "No applications")}
            description={exp.emptyStates.applications?.description}
            action={<Link href="/jobs"><Button>{t("استكشف الفرص", "Explore Opportunities")}</Button></Link>}
          />
        ) : (
          <KanbanBoard
            columns={columns}
            renderCard={(app) => (
              <>
                <div className="flex items-center gap-3 mb-2">
                  {app.company?.logo ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border">
                      <Image src={app.company.logo} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-blue/15 flex items-center justify-center text-sm font-bold text-blue">
                      {app.company?.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link href={`/jobs/${app.jobId}`} className="font-semibold text-sm text-text hover:text-blue truncate block">
                      {app.job?.title}
                    </Link>
                    <p className="text-xs text-text-muted truncate">{app.company?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{formatDate(app.appliedAt)}</span>
                  {app.matchScore && <span className="nq-chip-emerald nq-chip tabular-nums">{app.matchScore}%</span>}
                </div>
                {app.interviewDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.interviewDate).toLocaleDateString("ar")}
                  </div>
                )}
              </>
            )}
            actionLabel={t("عرض التفاصيل", "View Details")}
          />
        )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={t("طلبات التقديم", "Applications")} subtitle={t(`${apps.length} طلب في النظام`, `${apps.length} applications in the system`)} />
      <div className="nq-page-enter mt-6 space-y-4">
        {apps.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title={t("لا طلبات في النظام", "No applications in the system")}
            description={t("ستظهر طلبات التقديم الواردة هنا فور استلامها", "Incoming applications will appear here as soon as they are received")}
            action={<Link href="/jobs"><Button>{t("عرض الوظائف", "View Jobs")}</Button></Link>}
          />
        )}
        {apps.map((app) => (
          <Card key={app.id} hover className="nq-lift group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue/15 flex items-center justify-center font-bold text-blue">
                  {app.company?.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-text">{app.job?.title}</p>
                  <p className="text-sm text-text-secondary">
                    {app.company?.name}
                    {app.company?.industry ? ` · ${app.company.industry}` : ""}
                  </p>
                </div>
              </div>
              <span className="nq-chip">{applicationStatusLabel(app.status, t)}</span>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
