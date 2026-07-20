"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { useApp } from "@/contexts/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInternship, applyToInternship } from "@/hooks/data";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { workTypeLabel } from "@/i18n/labels";
import { MapPin, Clock, ArrowRight, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { notFound } from "next/navigation";

export default function InternshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, isRTL } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const { data: internship, loading } = useInternship(id);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/internships/${id}`)}`);
      return;
    }
    setApplying(true);
    try {
      await applyToInternship(id);
      setApplied(true);
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
              <div className="nq-skeleton h-40 rounded-xl" />
              <div className="nq-skeleton h-56 rounded-xl" />
            </div>
            <div className="nq-skeleton h-64 rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!internship) notFound();
  const { company } = internship;

  return (
    <PageLayout>
      <div className="nq-page-enter">
      <Link href="/internships" className="inline-flex items-center gap-2 text-text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t("العودة للتدريب", "Back to internships")}
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="nq-gradient-panel p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-surface shrink-0 shadow-soft">
                <Image src={company.logo} alt={company.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold text-text leading-snug">{internship.title}</h1>
                <p className="text-text-secondary text-sm mt-1">{company.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{internship.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{internship.duration}</span>
                  {internship.matchPercentage != null && (
                    <span className="nq-chip-emerald nq-chip tabular-nums">{t(`تطابق ${internship.matchPercentage}%`, `${internship.matchPercentage}% match`)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <h2 className="font-display font-bold text-text mb-3">{t("عن التدريب", "About the internship")}</h2>
            <p className="text-text-secondary leading-relaxed">{internship.description}</p>
            <div className="mt-6">
              <h3 className="font-display font-bold text-text mb-2">{t("المتطلبات", "Requirements")}</h3>
              <ul className="list-disc list-inside text-sm text-text-secondary space-y-1.5">
                {internship.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <p className="text-xs text-text-muted mb-1">{t("المكافأة", "Stipend")}</p>
            <p className="font-display text-xl font-bold text-text">{internship.paid ? t(`${internship.salary}$ / شهر`, `$${internship.salary} / month`) : t("غير مدفوع", "Unpaid")}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-text-secondary">{workTypeLabel(internship.workType, t)}</p>
              <p className="text-text-muted text-xs">{t(`نُشر ${formatDate(internship.postedAt)}`, `Posted ${formatDate(internship.postedAt)}`)}</p>
            </div>
            {applied ? (
              <Button className="w-full mt-5" disabled><CheckCircle className="w-4 h-4" /> {t("تم التقديم", "Applied")}</Button>
            ) : (
              <Button className="w-full mt-5" onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {t("تقديم على التدريب", "Apply for internship")}
              </Button>
            )}
          </Card>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}
