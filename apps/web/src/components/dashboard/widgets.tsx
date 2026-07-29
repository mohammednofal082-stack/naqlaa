"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Mic, ArrowLeft, ArrowRight } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";
import { useApplications, useJobs, useNotifications, useProfile } from "@/hooks/data";

export function ProfileCompletionWidget() {
  const { t } = useI18n();
  const { data: profileData } = useProfile();
  const completion = profileData?.profile.profileCompletion ?? 0;

  return (
    <Card>
      <CardTitle className="mb-4 text-base">{t("اكتمال الملف", "Profile completion")}</CardTitle>
      <div className="flex items-center gap-5">
        <ProgressRing value={completion} size={88} />
        <div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("أكمل ملفك لزيادة ظهورك أمام الشركات والجامعات.", "Complete your profile to increase your visibility to companies and universities.")}
          </p>
          <Link href="/profile" className="inline-block mt-3">
            <Button variant="outline" size="sm">{t("إكمال الملف", "Complete profile")}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function StatsWidget({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const { data: jobs } = useJobs();
  const { data: apps } = useApplications();
  const { data: notifs } = useNotifications();

  const recommended = (jobs ?? []).filter((j) => (j.matchPercentage ?? 0) >= 70).length;
  const activeApps = (apps ?? []).filter((a) => a.status !== "rejected" && a.status !== "withdrawn").length;
  const interviews = (apps ?? []).filter((a) => a.status === "interview_scheduled").length;
  const unread = (notifs ?? []).filter((n) => !n.read).length;

  const stats = [
    { label: t("وظائف مقترحة", "Recommended jobs"), value: recommended },
    { label: t("طلبات نشطة", "Active applications"), value: activeApps },
    { label: t("مقابلات", "Interviews"), value: interviews },
    { label: t("إشعارات", "Notifications"), value: unread },
  ];

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-4")}>
      {stats.map((stat) => (
        <Card key={stat.label} className="py-4 px-4 nq-stat-glow">
          <p className="font-display text-2xl font-bold text-text tabular-nums">{stat.value}</p>
          <p className="text-text-muted text-xs mt-1 font-medium">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}

export function SkillsRadarWidget() {
  const chart = useChartTheme();
  const { t } = useI18n();
  const { data: profileData } = useProfile();
  const skillAnalysis = (profileData?.skillLevels ?? []).map((s) => ({
    skill: s.skill,
    value: s.value,
  }));

  return (
    <Card>
      <CardTitle className="mb-3 text-base">{t("ملخص المهارات", "Skills summary")}</CardTitle>
      {skillAnalysis.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">
          {t("أضف مهاراتك من الملف الشخصي لعرض التحليل.", "Add skills from your profile to see the analysis.")}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={skillAnalysis}>
            <PolarGrid stroke={chart.grid} />
            <PolarAngleAxis dataKey="skill" tick={{ fill: chart.tick, fontSize: 10 }} />
            <Radar dataKey="value" stroke={chart.emerald} fill={chart.emerald} fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function InterviewWidget() {
  const { t, isRTL } = useI18n();
  return (
    <Card className="bg-gradient-to-l from-brand/10 to-transparent border-brand/20">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
          <Mic className="w-5 h-5 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base mb-1">{t("محاكاة المقابلة", "Interview simulation")}</CardTitle>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("تدرب على أسئلة المقابلات الشائعة واحصل على تغذية راجعة فورية.", "Practice common interview questions and get instant feedback.")}
          </p>
          <Link href="/ai/interview" className="inline-block mt-3">
            <Button size="sm">
              {t("ابدأ التدريب", "Start practice")}
              {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "blue" | "emerald" | "purple" | "amber" | "cyan";
}) {
  return (
    <Card className="py-4 nq-stat-glow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text-muted text-xs font-medium">{title}</p>
          <p className="font-display text-2xl font-bold text-text mt-1 tabular-nums truncate">{value}</p>
          {change && <p className="text-emerald text-xs mt-1 font-semibold">{change}</p>}
        </div>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-muted border border-brand/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand" />
        </div>
      </div>
    </Card>
  );
}
