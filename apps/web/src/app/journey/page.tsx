"use client";

import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { RoleIdentityBanner, RoleJourneyTimeline } from "@/components/role/role-ui";
import { getRoleExperience } from "@/components/role/role-experience";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { ProgressRing } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardStats, skillAnalysis } from "@careerlink/shared";
import { useProfile } from "@/hooks/data";
import Link from "next/link";
import { Briefcase, BookOpen, Handshake, FileText, Mic, Award, Check } from "lucide-react";
import { useI18n } from "@/i18n";

export default function JourneyPage() {
  const { t } = useI18n();
  const role = getRoleExperience("student", t);
  const { data: profileData } = useProfile();
  const profileCompletion = profileData?.profile.profileCompletion ?? dashboardStats.profileCompletion;

  const milestones = [
    { icon: FileText, label: t("CV جاهز", "CV Ready"), done: true, href: "/ai/cv-analyzer" },
    { icon: BookOpen, label: t("كورس نشط", "Active Course"), done: true, href: "/courses" },
    { icon: Briefcase, label: t("تقديم مُرسَل", "Application Sent"), done: false, href: "/applications" },
    { icon: Handshake, label: t("جلسة إرشاد", "Mentorship Session"), done: false, href: "/mentorship" },
    { icon: Mic, label: t("محاكاة مقابلة", "Interview Simulation"), done: false, href: "/ai/interview" },
    { icon: Award, label: t("شهادة مهارة", "Skill Certificate"), done: false, href: "/courses" },
  ];

  const fullJourney = [
    { label: t("التسجيل واختيار الجامعة", "Registration and university selection"), status: "done" as const, detail: profileData?.profile.university ?? t("بيرزيت · علوم حاسوب", "Birzeit · Computer Science") },
    { label: t("بناء البروفايل والمهارات", "Building your profile and skills"), status: "done" as const, detail: t(`${profileCompletion}% اكتمال`, `${profileCompletion}% complete`) },
    { label: t("تحليل فجوة المهارات", "Skill gap analysis"), status: "done" as const, detail: t(`${skillAnalysis.filter((s) => s.value < 70).length} مهارات للتطوير`, `${skillAnalysis.filter((s) => s.value < 70).length} skills to develop`) },
    { label: t("كورسات ومشاريع عملية", "Courses and practical projects"), status: "current" as const, detail: t("React + مشروع تخرج", "React + graduation project") },
    { label: t("تدريب عملي معتمد", "Accredited practical training"), status: "upcoming" as const, detail: t("2 فرص تدريب مناسبة", "2 suitable training opportunities") },
    { label: t("مقابلات واختبارات", "Interviews and assessments"), status: "upcoming" as const },
    { label: t("أول وظيفة أو عرض", "First job or offer"), status: "upcoming" as const },
  ];

  return (
    <DashboardLayout>
      <Header title={t("رحلتي المهنية", "My Career Journey")} subtitle={t("من طالب إلى محترف — كل مرحلة لها معنى", "From student to professional — every stage has meaning")} />

      <div className="nq-page-enter mt-6">
      <RoleIdentityBanner role={role} />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <PanelCard title={t("المسار الكامل", "The Full Path")}>
            <RoleJourneyTimeline steps={fullJourney} />
          </PanelCard>
        </div>

        <div className="space-y-5">
          <Card className="nq-gradient-panel flex flex-col items-center text-center">
            <p className="text-sm font-semibold text-text-secondary mb-4">{t("جاهزية سوق العمل", "Job Market Readiness")}</p>
            <ProgressRing value={68} label={t("جاهز", "Ready")} />
            <p className="text-text-muted text-xs mt-4">{t("أكمل 3 مهارات + مشروع واحد للوصول لـ 80%", "Complete 3 skills + one project to reach 80%")}</p>
          </Card>

          <PanelCard title={t("معالم الرحلة", "Journey Milestones")}>
            <div className="grid grid-cols-2 gap-3">
              {milestones.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.label}
                    href={m.href}
                    className={`nq-lift p-4 rounded-xl border text-center transition-all ${
                      m.done
                        ? "border-emerald/30 bg-emerald/10"
                        : "border-border bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${m.done ? "text-emerald" : "text-text-muted"}`} />
                    <p className="text-xs font-semibold text-text">{m.label}</p>
                    {m.done && <span className="text-[10px] text-emerald inline-flex items-center gap-0.5"><Check className="w-3 h-3" />{t("مكتمل", "Complete")}</span>}
                  </Link>
                );
              })}
            </div>
          </PanelCard>

          <Link href="/jobs" className="block">
            <Button className="w-full">{t("ابدأ رحلتك — استكشف الفرص", "Start your journey — explore opportunities")}</Button>
          </Link>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
