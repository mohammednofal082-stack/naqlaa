"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { universities } from "@careerlink/shared";
import { useCompanies, usePartnerships } from "@/hooks/data";
import { Handshake, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";

export default function CompanyPartnershipsPage() {
  const { t } = useI18n();
  const { data: partnerships, loading } = usePartnerships();
  const { data: companies } = useCompanies();
  const items = partnerships ?? [];

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("الشراكات", "Partnerships")}
        subtitle={t("شراكات مع الجامعات والمؤسسات", "Partnerships with universities and institutions")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("طلب شراكة", "Request Partnership")}
          </Button>
        }
      >
        <PanelCard title={t("الشراكات النشطة", "Active Partnerships")}>
          {loading ? (
            <div className="grid lg:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-36" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title={t("لا شراكات بعد", "No Partnerships Yet")}
              description={t("اطلب شراكة مع جامعة لبناء قنوات توظيف مبكرة.", "Request a partnership with a university to build early recruitment channels.")}
              action={<Button size="sm"><Plus className="w-4 h-4" /> {t("طلب شراكة", "Request Partnership")}</Button>}
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {items.map((partnership) => {
                const company = companies?.find((c) => c.id === partnership.companyId);
                const university = universities.find((u) => u.id === partnership.universityId);

                return (
                  <div key={partnership.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Handshake className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={university?.name ?? ""}
                      subtitle={`${company?.name} × ${university?.city}`}
                      badge={
                        <span className={partnership.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                          {partnership.status === "active" ? t("نشط", "Active") : t("معلق", "Pending")}
                        </span>
                      }
                    />
                    <p className="text-xs text-text-muted mt-3 mr-12">{t(`بدأت ${formatDate(partnership.startDate)}`, `Started ${formatDate(partnership.startDate)}`)}</p>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Button size="sm" variant="outline">{t("التفاصيل", "Details")}</Button>
                      <Button size="sm">{t("الفعاليات المشتركة", "Joint Events")}</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
