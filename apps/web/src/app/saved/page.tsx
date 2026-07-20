"use client";

import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { JobCard, CompanyCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/layout/page-header";
import { useSaved } from "@/hooks/data";
import { Bookmark } from "lucide-react";
import { useI18n } from "@/i18n";

export default function SavedPage() {
  const { t } = useI18n();
  const { data, loading } = useSaved();
  const savedJobs = data?.jobs ?? [];
  const savedCompanies = data?.companies ?? [];

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("المحفوظات", "Saved")} subtitle={t("وظائف وشركات حفظتها للرجوع إليها", "Jobs and companies you saved to revisit later")} />
        <div className="space-y-4 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-28 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const isEmpty = savedJobs.length === 0 && savedCompanies.length === 0;

  return (
    <DashboardLayout>
      <Header title={t("المحفوظات", "Saved")} subtitle={t(`${savedJobs.length} وظيفة · ${savedCompanies.length} شركة`, `${savedJobs.length} jobs · ${savedCompanies.length} companies`)} />

      <div className="nq-page-enter mt-6">
        {isEmpty ? (
          <EmptyState
            icon={Bookmark}
            title={t("لا محفوظات بعد", "No saved items yet")}
            description={t("احفظ الوظائف والشركات التي تهمك لتعود إليها بسهولة في أي وقت", "Save the jobs and companies that interest you to easily return to them anytime")}
            action={
              <Link href="/jobs" className="btn-primary">{t("تصفّح الوظائف", "Browse Jobs")}</Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {savedJobs.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-text mb-4">{t("وظائف محفوظة", "Saved Jobs")}</h2>
                <div className="grid gap-4">
                  {savedJobs.map((job) => (
                    <JobCard key={job.id} job={job} company={job.company} compact />
                  ))}
                </div>
              </div>
            )}
            {savedCompanies.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-text mb-4">{t("شركات متابعة", "Followed Companies")}</h2>
                <div className="grid gap-4">
                  {savedCompanies.map((c) => (
                    <CompanyCard key={c.id} company={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
