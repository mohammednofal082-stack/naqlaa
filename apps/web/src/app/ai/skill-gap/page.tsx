"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { analyzeSkillGapClient } from "@/lib/ai/client-api";
import {
  ROLE_OPTIONS,
  buildUserSkills,
  analyzeSkillGap,
} from "@careerlink/shared";
import { useProfile } from "@/hooks/data";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, BookOpen, FolderGit2, Lightbulb } from "lucide-react";
import { useI18n } from "@/i18n";

export default function SkillGapPage() {
  const { t } = useI18n();
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [loading, setLoading] = useState(false);
  const { data: profileData } = useProfile();
  const userSkills = profileData
    ? buildUserSkills(profileData.profile.skills, profileData.skillLevels)
    : buildUserSkills([], []);
  const localGap = analyzeSkillGap(targetRole, userSkills);
  const [gap, setGap] = useState(localGap);

  const runAnalysis = async (role: string) => {
    setLoading(true);
    try {
      const result = await analyzeSkillGapClient({
        targetRole: role,
        skills: userSkills.map((s) => ({ name: s.name, level: s.level })),
      });
      setGap({
        targetRole: role,
        roleLabel: ROLE_OPTIONS.find((r) => r.labelEn === role || r.label === role)?.label ?? localGap.roleLabel,
        matchScore: result.matchScore,
        marketReadiness: result.matchScore,
        strong: result.strong,
        weak: result.weak,
        missing: result.missing,
        recommendedCourses: result.courses,
        recommendedProjects: result.projects,
      });
    } catch {
      setGap(analyzeSkillGap(role, userSkills));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(targetRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <Header
        title={t("تحليل فجوة المهارات", "Skill Gap Analysis")}
        subtitle={t(
          "خوارزمية مطابقة بين مهاراتك ومتطلبات سوق العمل",
          "A matching algorithm between your skills and labor market requirements"
        )}
      />

      <div className="nq-page-enter mt-6 grid lg:grid-cols-3 gap-5 items-start">
        <Card className="lg:col-span-1">
          <CardTitle className="font-display mb-4">{t("الدور المستهدف", "Target Role")}</CardTitle>
          <div className="space-y-2 mb-6">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setTargetRole(role.labelEn);
                  runAnalysis(role.labelEn);
                }}
                className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-colors ${
                  targetRole === role.labelEn
                    ? "border-brand bg-brand-muted text-brand font-semibold"
                    : "border-border hover:border-brand/30"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
          <Link href="/ai/recommendations">
            <Button className="w-full" variant="outline">
              <Lightbulb className="w-4 h-4 ml-2" />
              {t("التوصيات المخصّصة", "Recommendations")}
            </Button>
          </Link>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="nq-skeleton h-28 rounded-xl" />
                <div className="nq-skeleton h-28 rounded-xl" />
              </div>
              <div className="nq-skeleton h-24 rounded-xl" />
              <div className="nq-skeleton h-24 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="nq-gradient-panel flex items-center gap-4">
                  <ProgressRing value={gap.matchScore} size={72} />
                  <div>
                    <p className="text-text-muted text-xs">{t("نسبة الجاهزية", "Readiness Score")}</p>
                    <p className="text-2xl font-bold gradient-text tabular-nums">{gap.matchScore}%</p>
                    <p className="text-text-muted text-xs">{gap.roleLabel}</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-muted flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-emerald" />
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">{t("تغطية السوق", "Market Coverage")}</p>
                    <p className="text-2xl font-bold text-text tabular-nums">{gap.marketReadiness}%</p>
                    <p className="text-text-muted text-xs">{t("مقارنة بمتطلبات الدور", "Compared to role requirements")}</p>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-emerald" />
                  <CardTitle className="font-display">{t("نقاط القوة", "Strengths")}</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gap.strong.map((s) => (
                    <span key={s} className="nq-chip-emerald nq-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>

              {gap.weak.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber" />
                    <CardTitle className="font-display">{t("تحتاج تطوير", "Needs Development")}</CardTitle>
                  </div>
                  <ul className="space-y-2">
                    {gap.weak.map((w) => (
                      <li key={w} className="text-sm text-text-secondary">
                        {w}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {gap.missing.length > 0 && (
                <Card>
                  <CardTitle className="font-display mb-3">{t("مهارات ناقصة", "Missing Skills")}</CardTitle>
                  <ul className="space-y-1.5">
                    {gap.missing.map((m) => (
                      <li key={m} className="text-sm text-text-secondary flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-text-muted shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-blue" />
                    <CardTitle className="font-display">{t("كورسات مقترحة", "Suggested Courses")}</CardTitle>
                  </div>
                  <ul className="space-y-2">
                    {gap.recommendedCourses.map((c) => (
                      <motion.li key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-text-secondary">
                        {c}
                      </motion.li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <FolderGit2 className="w-4 h-4 text-purple" />
                    <CardTitle className="font-display">{t("مشاريع عملية", "Practical Projects")}</CardTitle>
                  </div>
                  <ul className="space-y-2">
                    {gap.recommendedProjects.map((p) => (
                      <li key={p} className="text-sm text-text-secondary">
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
