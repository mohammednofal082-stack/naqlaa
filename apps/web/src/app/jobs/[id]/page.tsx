"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { useApp } from "@/contexts/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useJob, applyToJob } from "@/hooks/data";
import { formatDate, formatSalary } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { workTypeLabel, experienceLabel } from "@/i18n/labels";
import { MapPin, Clock, Users, ArrowRight, ArrowLeft, Share2, Loader2, CheckCircle } from "lucide-react";
import { notFound } from "next/navigation";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, isRTL } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const { data: job, loading } = useJob(id);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`);
      return;
    }
    setApplying(true);
    setError("");
    try {
      await applyToJob(id);
      setApplied(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل التقديم", "Application failed"));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="nq-skeleton h-6 w-32 rounded-lg" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="nq-skeleton h-44 rounded-xl" />
              <div className="nq-skeleton h-64 rounded-xl" />
            </div>
            <div className="nq-skeleton h-80 rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!job) notFound();
  const company = job.company;

  return (
    <PageLayout>
      <div className="nq-page-enter">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t("العودة للوظائف", "Back to jobs")}
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="nq-gradient-panel p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface shrink-0 shadow-soft">
                <Image src={company.logo} alt={company.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold text-text leading-snug">{job.title}</h1>
                <p className="text-text-secondary text-sm mt-1">{company.name} · {company.industry}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{workTypeLabel(job.workType, t)}</span>
                  {job.matchPercentage != null && (
                    <span className="nq-chip-emerald nq-chip tabular-nums">{t(`تطابق ${job.matchPercentage}%`, `${job.matchPercentage}% match`)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <h2 className="font-display font-bold text-text mb-3">{t("عن الوظيفة", "About the job")}</h2>
            <p className="text-text-secondary leading-relaxed">{job.description}</p>
            <div className="mt-6">
              <h3 className="font-display font-bold text-text mb-2">{t("المتطلبات", "Requirements")}</h3>
              <ul className="list-disc list-inside text-sm text-text-secondary space-y-1.5">
                {job.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="font-display font-bold text-text mb-3">{t("المهارات المطلوبة", "Required skills")}</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="nq-chip">{s}</span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <p className="text-xs text-text-muted mb-1">{t("الراتب المتوقع", "Expected salary")}</p>
            <p className="font-display text-xl font-bold text-text">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</p>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p>{experienceLabel(job.experienceLevel, t)}</p>
              <p className="text-text-muted text-xs">{t(`نُشر ${formatDate(job.postedAt)}`, `Posted ${formatDate(job.postedAt)}`)}</p>
              <p className="flex items-center gap-1.5 text-text-muted text-xs">
                <Users className="w-3.5 h-3.5" />
                {t(`${job.applicants} متقدم`, `${job.applicants} applicants`)}
              </p>
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            {applied ? (
              <Button className="w-full mt-5" disabled>
                <CheckCircle className="w-4 h-4" />
                {t("تم التقديم", "Applied")}
              </Button>
            ) : (
              <Button className="w-full mt-5" onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {user ? t("تقديم الآن", "Apply now") : t("سجّل دخول للتقديم", "Sign in to apply")}
              </Button>
            )}
            <Link href="/applications" className="block mt-2">
              <Button variant="outline" className="w-full">{t("متابعة طلباتي", "Track my applications")}</Button>
            </Link>
            <Button variant="outline" className="w-full mt-2">
              <Share2 className="w-4 h-4" /> {t("مشاركة", "Share")}
            </Button>
          </Card>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}
