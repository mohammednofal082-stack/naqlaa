"use client";

import { use } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { useCompany, useJobs } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { Globe, MapPin, Users, Briefcase, Calendar } from "lucide-react";
import { notFound } from "next/navigation";

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const { data: company, loading } = useCompany(id);
  const { data: jobs } = useJobs();

  if (!loading && !company) notFound();

  const companyJobs = (jobs ?? []).filter((j) => j.companyId === id);

  if (loading || !company) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="nq-skeleton h-48 rounded-2xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="nq-skeleton h-40 rounded-xl" />
              <div className="nq-skeleton h-64 rounded-xl" />
            </div>
            <div className="nq-skeleton h-72 rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="nq-page-enter">
      <div className="nq-gradient-panel overflow-hidden mb-6">
        <div className="relative h-44 md:h-52">
          <Image src={company.coverImage} alt={company.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />
        </div>
        <div className="flex flex-wrap items-end gap-5 px-6 pb-6 -mt-12 relative z-10">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-surface shadow-card shrink-0">
            <Image src={company.logo} alt={company.name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              {company.name}
              {company.verified && <span className="text-base font-normal text-text-muted"> · {t("موثقة", "Verified")}</span>}
            </h1>
            <p className="text-text-secondary text-sm mt-1">{company.industry}</p>
          </div>
          <Button className="shrink-0">{t("متابعة", "Follow")}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display font-bold text-lg text-text mb-3">{t("عن الشركة", "About the company")}</h2>
            <p className="text-text-secondary leading-relaxed">{company.about}</p>
          </Card>
          <div>
            <h2 className="font-display font-bold text-lg text-text mb-4">{t(`الوظائف المتاحة (${companyJobs.length})`, `Open positions (${companyJobs.length})`)}</h2>
            <div className="space-y-4">
              {companyJobs.map((job) => (
                <JobCard key={job.id} job={job} company={company} compact />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <h3 className="font-display font-bold text-text mb-4">{t("معلومات", "Information")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="w-4 h-4 text-text-muted" /> {company.location}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Globe className="w-4 h-4 text-text-muted" /> {company.website}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Users className="w-4 h-4 text-text-muted" /> {t(`${company.employees} موظف`, `${company.employees} employees`)}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Briefcase className="w-4 h-4 text-text-muted" /> {t(`${company.activeJobs} وظيفة نشطة`, `${company.activeJobs} active jobs`)}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4 text-text-muted" /> {t(`تأسست ${company.founded}`, `Founded ${company.founded}`)}
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-display font-bold text-text mb-3">{t("إحصائيات", "Statistics")}</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="nq-stat">
                <p className="text-2xl font-bold text-blue tabular-nums">{company.followers.toLocaleString()}</p>
                <p className="text-xs text-text-muted mt-0.5">{t("متابع", "Followers")}</p>
              </div>
              <div className="nq-stat">
                <p className="text-2xl font-bold text-emerald tabular-nums">{company.activeJobs}</p>
                <p className="text-xs text-text-muted mt-0.5">{t("وظيفة", "Jobs")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}
