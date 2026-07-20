"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompanies, usePartnerships } from "@/hooks/data";
import { Handshake, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";

export default function UniversityPartnershipsPage() {
  const { t } = useI18n();
  const { data: partnerships, loading: partnershipsLoading } = usePartnerships();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const loading = partnershipsLoading || companiesLoading;
  const items = partnerships ?? [];

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الشراكات", "Partnerships")}
        subtitle={t("شراكات الجامعة مع الشركات", "University partnerships with companies")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("شراكة جديدة", "New Partnership")}
          </Button>
        }
      >
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="nq-skeleton h-36" />
            ))}
          </div>
        ) : (
          <PanelCard title={t("الشراكات النشطة", "Active Partnerships")}>
            {items.length === 0 ? (
              <EmptyState
                icon={Handshake}
                title={t("لا شراكات بعد", "No Partnerships Yet")}
                description={t("أضف شراكة جديدة مع شركة لتفعيل التدريبات.", "Add a new partnership with a company to enable internships.")}
                action={
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    {t("شراكة جديدة", "New Partnership")}
                  </Button>
                }
              />
            ) : (
              <div className="grid lg:grid-cols-2 gap-3">
                {items.map((partnership) => {
                  const company = companies?.find((c) => c.id === partnership.companyId);
                  return (
                    <div key={partnership.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                      <ActivityRow
                        avatar={
                          <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                            {company?.name[0]}
                          </div>
                        }
                        title={company?.name ?? ""}
                        subtitle={`${company?.industry} · ${company?.location}`}
                        badge={
                          <span className={partnership.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                            {partnership.status === "active" ? t("نشط", "Active") : t("معلق", "Pending")}
                          </span>
                        }
                      />
                      <p className="text-xs text-text-muted mt-3 mr-12">{t("منذ", "Since")} {formatDate(partnership.startDate)}</p>
                      <div className="flex gap-2 mt-3 mr-12">
                        <Button size="sm" variant="outline">
                          <Handshake className="w-4 h-4" />
                          {t("التفاصيل", "Details")}
                        </Button>
                        <Button size="sm">{t("التدريبات", "Internships")}</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
