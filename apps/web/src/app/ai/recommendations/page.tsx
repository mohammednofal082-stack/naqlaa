"use client";

import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { JobCard } from "@/components/jobs/job-card";
import { useRecommendations } from "@/hooks/data";
import { Briefcase, GraduationCap, BookOpen, Users, Target, Star } from "lucide-react";
import { useI18n } from "@/i18n";

export default function RecommendationsPage() {
  const { t } = useI18n();
  const { data: rec, loading } = useRecommendations();

  if (loading || !rec) {
    return (
      <DashboardLayout>
        <Header
          title={t("التوصيات المخصّصة", "Recommendations")}
          subtitle={t(
            "محرك توصيات يعتمد على فجوة المهارات ونسبة التطابق",
            "A recommendation engine based on your skill gap and match rate"
          )}
        />
        <div className="mt-6 space-y-5">
          <div className="nq-skeleton h-20 rounded-xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-48 rounded-xl" />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="nq-skeleton h-28 rounded-xl" />
            <div className="nq-skeleton h-28 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title={t("التوصيات المخصّصة", "Recommendations")}
        subtitle={t(
          "محرك توصيات يعتمد على فجوة المهارات ونسبة التطابق مع الفرص",
          "A recommendation engine based on your skill gap and match rate with opportunities"
        )}
      />

      <div className="nq-page-enter mt-6">
      <div className="nq-gradient-panel p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-muted flex items-center justify-center">
            <Target className="w-6 h-6 text-brand" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-display font-bold text-text">{rec.gap.roleLabel}</p>
            <p className="text-sm text-text-secondary mt-0.5">
              {t("جاهزية", "Readiness")} {rec.gap.matchScore}% · {rec.gap.missing.length} {t("مهارات ناقصة", "missing skills")}
            </p>
          </div>
          <Link href="/ai/skill-gap" className="text-sm font-semibold text-brand hover:underline">
            {t("تحليل الفجوة", "Gap Analysis")}
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-brand" />
          <h2 className="font-display font-bold text-lg text-text">{t("وظائف مناسبة لك", "Jobs Suited to You")}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rec.jobs.map((job) => (
            <JobCard key={job.id} job={job} company={job.company} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-emerald" />
          <h2 className="font-display font-bold text-lg">{t("تدريب موصى به", "Recommended Internships")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {rec.internships.map((int) => (
            <Card key={int.id}>
              <CardTitle className="text-base mb-1">{int.title}</CardTitle>
              <p className="text-sm text-text-muted mb-2">{int.company.name}</p>
              <p className="text-sm font-semibold text-brand">{t("تطابق", "Match")} {int.matchPercentage}%</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue" />
            <h2 className="font-display font-bold text-lg">{t("كورسات لسد الفجوة", "Courses to Close the Gap")}</h2>
          </div>
          <div className="space-y-3">
            {rec.courses.map((c) => (
              <Card key={c.id}>
                <CardTitle className="text-base">{c.title}</CardTitle>
                <p className="text-sm text-text-muted mt-1">{c.description}</p>
                <p className="text-xs text-text-muted mt-2 inline-flex items-center gap-1">
                  {c.duration}
                  <span aria-hidden>·</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {c.rating}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple" />
            <h2 className="font-display font-bold text-lg">{t("مرشدون مقترحون", "Suggested Mentors")}</h2>
          </div>
          <div className="space-y-3">
            {rec.mentors.map((m) => (
              <Card key={m.userId}>
                <CardTitle className="text-base">{m.currentTitle}</CardTitle>
                <p className="text-sm text-text-muted">{m.expertiseArea}</p>
                <p className="text-xs text-text-muted mt-2 inline-flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {m.rating}
                  <span aria-hidden>·</span>
                  {m.sessionsCount} {t("جلسة", "sessions")}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
}
