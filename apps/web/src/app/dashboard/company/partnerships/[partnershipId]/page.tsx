"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompanies, usePartnerships } from "@/hooks/data";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Handshake } from "lucide-react";

export default function CompanyPartnershipDetailPage({
  params,
}: {
  params: Promise<{ partnershipId: string }>;
}) {
  const { partnershipId } = use(params);
  const { t } = useI18n();
  const { data: partnerships, loading } = usePartnerships();
  const { data: companies } = useCompanies();
  const partnership = useMemo(
    () => (partnerships ?? []).find((p) => p.id === partnershipId),
    [partnerships, partnershipId]
  );
  const company = companies?.find((c) => c.id === partnership?.companyId);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("الشراكات", "Partnerships")}
        title={t("تفاصيل الشراكة", "Partnership details")}
        subtitle={company?.name ?? partnershipId}
        actions={
          <Link href="/dashboard/company/partnerships">
            <Button size="sm" variant="outline">{t("العودة", "Back")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="nq-skeleton h-48" />
        ) : !partnership ? (
          <EmptyState
            icon={Handshake}
            title={t("الشراكة غير موجودة", "Partnership not found")}
            description={t("تحقق من الرابط أو عد للقائمة.", "Check the link or go back to the list.")}
          />
        ) : (
          <PanelCard title={t("الحالة والتواريخ", "Status and dates")}>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                {t("الحالة:", "Status:")}{" "}
                <span
                  className={
                    partnership.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"
                  }
                >
                  {partnership.status === "active"
                    ? t("نشط", "Active")
                    : partnership.status === "expired"
                      ? t("منتهي", "Expired")
                      : t("معلق", "Pending")}
                </span>
              </p>
              <p>
                {t("الجامعة:", "University:")}{" "}
                <span className="text-text">{partnership.universityId}</span>
              </p>
              <p>
                {t("الشركة:", "Company:")}{" "}
                <span className="text-text">{company?.name ?? partnership.companyId}</span>
              </p>
              <p>
                {t("تاريخ البدء:", "Start date:")}{" "}
                <span className="text-text">{formatDate(partnership.startDate)}</span>
              </p>
              {partnership.endDate && (
                <p>
                  {t("تاريخ الانتهاء:", "End date:")}{" "}
                  <span className="text-text">{formatDate(partnership.endDate)}</span>
                </p>
              )}
            </div>
            {company && (
              <div className="mt-5">
                <Link href={`/companies/${company.id}`}>
                  <Button size="sm" variant="outline">{t("صفحة الشركة", "Company page")}</Button>
                </Link>
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
