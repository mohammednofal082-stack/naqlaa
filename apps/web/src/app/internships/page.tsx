"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { InternshipCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/layout/page-header";
import { useInternships } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function InternshipsPage() {
  const { t } = useI18n();
  const { data: internships, loading } = useInternships();
  const list = internships ?? [];

  if (loading) {
    return (
      <PageLayout title={t("فرص التدريب", "Internships")} subtitle={t("فرص تدريب في شركات وجهات مختلفة", "Internship opportunities at various companies and organizations")}>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-36 rounded-xl" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("فرص التدريب", "Internships")}
      subtitle={t(`${list.length} فرصة في شركات وجهات مختلفة`, `${list.length} opportunities at various companies and organizations`)}
    >
      <div className="nq-page-enter">
        {list.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={t("لا توجد فرص تدريب حالياً", "No internships available right now")}
            description={t("تُضاف فرص جديدة باستمرار — تفقّد الوظائف المتاحة في هذه الأثناء", "New opportunities are added regularly — check out the available jobs in the meantime")}
            action={
              <Link href="/jobs" className="btn-ghost">{t("تصفّح الوظائف", "Browse jobs")}</Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {list.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} company={internship.company} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
