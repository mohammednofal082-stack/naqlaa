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
import { skillAnalysis, dashboardStats } from "@careerlink/shared";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";

export function ProfileCompletionWidget() {
  const { t } = useI18n();
  return (
    <Card>
      <CardTitle className="mb-4 text-base">{t("اكتمال الملف", "Profile completion")}</CardTitle>
      <div className="flex items-center gap-5">
        <ProgressRing value={dashboardStats.profileCompletion} size={88} />
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
  const stats = [
    { label: t("وظائف مقترحة", "Recommended jobs"), value: dashboardStats.recommendedJobs },
    { label: t("طلبات نشطة", "Active applications"), value: dashboardStats.applications },
    { label: t("مقابلات", "Interviews"), value: dashboardStats.upcomingInterviews },
    { label: t("رسائل", "Messages"), value: dashboardStats.newMessages },
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
  return (
    <Card>
      <CardTitle className="mb-3 text-base">{t("ملخص المهارات", "Skills summary")}</CardTitle>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={skillAnalysis}>
          <PolarGrid stroke={chart.grid} />
          <PolarAngleAxis dataKey="skill" tick={{ fill: chart.tick, fontSize: 10 }} />
          <Radar dataKey="value" stroke={chart.emerald} fill={chart.emerald} fillOpacity={0.15} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function InterviewWidget() {
  const { t, isRTL } = useI18n();
  return (
    <Card>
      <CardTitle className="mb-2 text-base">{t("محاكاة المقابلة", "Interview Simulation")}</CardTitle>
      <p className="text-text-secondary text-sm mb-4 leading-relaxed">
        {t("تدرّب على أسئلة حقيقية واحصل على تقييم فوري.", "Practice with real questions and get instant feedback.")}
      </p>
      <Link href="/ai/interview">
        <Button className="w-full" size="sm">
          <Mic className="w-4 h-4" />
          {t("ابدأ الجلسة", "Start session")}
          {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Button>
      </Link>
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
