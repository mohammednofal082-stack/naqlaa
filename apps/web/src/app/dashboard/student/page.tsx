"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { RoleWorkspace } from "@/components/role/role-workspace";
import { RoleJourneyTimeline } from "@/components/role/role-ui";
import { DashboardHero } from "@/components/dashboard/dashboard-shell";
import {
  ProfileCompletionWidget,
  StatsWidget,
  SkillsRadarWidget,
} from "@/components/dashboard/widgets";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { getRoleExperience } from "@/components/role/role-experience";
import { dashboardStats, analyzeSkillGap, buildUserSkills } from "@careerlink/shared";
import { useJobs, useProfile } from "@/hooks/data";
import Link from "next/link";
import { Map, Route, Compass, FileText, Briefcase } from "lucide-react";
import { useI18n } from "@/i18n";

export default function StudentDashboard() {
  const { t } = useI18n();
  const { user } = useApp();
  const { data: profileData } = useProfile();
  const { data: jobsData, loading: jobsLoading } = useJobs();
  const role = getRoleExperience("student", t);
  const firstName = user?.fullName.split(" ")[0] ?? t("طالب", "Student");

  const userSkills = profileData
    ? buildUserSkills(profileData.profile.skills, profileData.skillLevels)
    : buildUserSkills([], []);
  const gapAnalysis = analyzeSkillGap("Full Stack Developer", userSkills);

  const recommendedJobs = (jobsData ?? [])
    .filter((j) => j.matchPercentage && j.matchPercentage >= 70)
    .slice(0, 3);

  const journeySteps = [
    { label: t("إكمال الملف الشخصي", "Complete your profile"), status: "done" as const, detail: t(`${dashboardStats.profileCompletion}% مكتمل`, `${dashboardStats.profileCompletion}% complete`) },
    { label: t("تحليل المهارات", "Skills analysis"), status: "done" as const, detail: t(`${gapAnalysis.missing.length} مهارات تحتاج تطوير`, `${gapAnalysis.missing.length} skills need development`) },
    { label: t("التقديم على التدريب", "Apply for training"), status: "current" as const, detail: t("فرصتان مناسبتان الآن", "Two suitable opportunities now") },
    { label: t("المقابلة الأولى", "First interview"), status: "upcoming" as const },
    { label: t("أول عرض وظيفي", "First job offer"), status: "upcoming" as const },
  ];

  return (
    <DashboardLayout>
      <div className="nq-page-enter">
      <PageHeader
        meta={t("لوحة الطالب", "Student Dashboard")}
        title={t(`مرحباً، ${firstName}`, `Welcome, ${firstName}`)}
        subtitle={t("نظرة شاملة على تقدّمك، فرصك، وأدواتك المهنية", "A comprehensive overview of your progress, opportunities, and professional tools")}
        actions={
          <Link href="/feed">
            <Button variant="outline" size="sm">{t("المنصة", "Platform")}</Button>
          </Link>
        }
      />

      <RoleWorkspace showScenarios showBanner={false}>
        <DashboardHero
          eyebrow={t("الخطوة التالية الموصى بها", "Recommended Next Step")}
          title={role.scenarios[0].title}
          subtitle={role.scenarios[0].description}
        >
          <Link href={role.scenarios[0].href}><Button size="sm">{role.scenarios[0].cta}</Button></Link>
          <Link href="/ai/cv-analyzer">
            <Button variant="outline" size="sm"><FileText className="w-4 h-4" /> {t("راجع سيرتك", "Review your CV")}</Button>
          </Link>
        </DashboardHero>

        <StatsWidget compact />

        <div className="grid lg:grid-cols-3 gap-5 mt-6">
          <div className="lg:col-span-2 space-y-5">
            <PanelCard
              title={t("مسارك الحالي", "Your Current Path")}
              action={
                <Link href="/journey">
                  <Button variant="ghost" size="sm"><Route className="w-4 h-4" /> {t("التفاصيل", "Details")}</Button>
                </Link>
              }
            >
              <RoleJourneyTimeline steps={journeySteps} />
            </PanelCard>

            <PanelCard title={t("فرص مناسبة لك", "Opportunities That Match You")}>
              {jobsLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="nq-skeleton h-20" />
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={role.emptyStates.jobs.title}
                  description={role.emptyStates.jobs.description}
                  action={
                    <Link href="/jobs"><Button size="sm">{t("تصفح الوظائف", "Browse Jobs")}</Button></Link>
                  }
                />
              ) : (
                <>
                  <div className="space-y-2">
                    {recommendedJobs.map((job) => (
                      <JobCard key={job.id} job={job} company={job.company} compact />
                    ))}
                  </div>
                  <Link href="/jobs" className="block mt-4 text-sm font-semibold text-brand hover:underline">
                    {t("عرض كل الفرص", "View all opportunities")}
                  </Link>
                </>
              )}
            </PanelCard>
          </div>

          <div className="space-y-5">
            <ProfileCompletionWidget />
            <SkillsRadarWidget />
            <PanelCard title={t("أدوات مهنية", "Professional Tools")}>
              <div className="space-y-2">
                {[
                  { href: "/ai", label: t("الأدوات المهنية", "Professional Tools"), icon: Compass },
                  { href: "/ai/career-path", label: t("خارطة المسار المهني", "Career Path Map"), icon: Map },
                  { href: "/internships", label: t("فرص التدريب", "Internship Opportunities"), icon: Route },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nq-lift flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-hover/40"
                  >
                    <item.icon className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </PanelCard>
          </div>
        </div>
      </RoleWorkspace>
      </div>
    </DashboardLayout>
  );
}
