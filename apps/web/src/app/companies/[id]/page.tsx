"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { useCompany, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { Globe, MapPin, Users, Briefcase, Calendar, Loader2 } from "lucide-react";

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const { data: company, loading } = useCompany(id);
  const { data: jobs } = useJobs();
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/data/company-follows?companyId=" + encodeURIComponent(id))
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setFollowing(Boolean(json.data.following));
          setFollowers(Number(json.data.followers ?? 0));
        }
      })
      .catch(() => {});
  }, [id]);

  if (!loading && !company) notFound();
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === id);

  const toggleFollow = async () => {
    if (!user) {
      router.push("/auth/login?redirect=" + encodeURIComponent("/companies/" + id));
      return;
    }
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setFollowers((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const res = await fetch("/api/data/company-follows", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: id }),
      });
      if (!res.ok) {
        setFollowing(!next);
        setFollowers((n) => Math.max(0, n + (next ? -1 : 1)));
      }
    } catch {
      setFollowing(!next);
      setFollowers((n) => Math.max(0, n + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !company) {
    return (
      <PageLayout>
        <div className="nq-skeleton h-48 rounded-2xl" />
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
                {company.verified && (
                  <span className="text-base font-normal text-text-muted"> · {t("موثقة", "Verified")}</span>
                )}
              </h1>
              <p className="text-text-secondary text-sm mt-1">{company.industry}</p>
              <p className="text-xs text-text-muted mt-1">{t(`${followers} متابع`, `${followers} followers`)}</p>
            </div>
            <Button className="shrink-0" disabled={busy} onClick={() => void toggleFollow()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {following ? t("إلغاء المتابعة", "Unfollow") : t("متابعة", "Follow")}
            </Button>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="font-display font-bold text-lg text-text mb-3">{t("عن الشركة", "About the company")}</h2>
              <p className="text-text-secondary leading-relaxed">{company.about}</p>
            </Card>
            <div>
              <h2 className="font-display font-bold text-lg text-text mb-4">
                {t(`الوظائف المتاحة (${companyJobs.length})`, `Open positions (${companyJobs.length})`)}
              </h2>
              <div className="space-y-4">
                {companyJobs.map((job) => (
                  <JobCard key={job.id} job={job} company={company} compact />
                ))}
              </div>
            </div>
          </div>
          <Card>
            <h3 className="font-display font-bold text-text mb-4">{t("معلومات", "Information")}</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {company.location}</div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {company.website}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {t(`${company.employees} موظف`, `${company.employees} employees`)}</div>
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {t(`${company.activeJobs} وظيفة نشطة`, `${company.activeJobs} active jobs`)}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {t(`تأسست ${company.founded}`, `Founded ${company.founded}`)}</div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
