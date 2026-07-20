"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompanies, verifyEntity } from "@/hooks/data";
import { Building2, CheckCircle, Shield, XCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AdminVerificationPage() {
  const { t } = useI18n();
  const { data: companies, loading, refetch } = useCompanies();
  const [removed, setRemoved] = useState<string[]>([]);

  const items = (companies ?? [])
    .filter((c) => !c.verified && !removed.includes(c.id))
    .slice(0, 4);

  const handleVerify = async (id: string, status: "approved" | "rejected") => {
    try {
      await verifyEntity({ entityType: "company", entityId: id, status });
      setRemoved((prev) => [...prev, id]);
      await refetch();
    } catch {
      setRemoved((prev) => [...prev, id]);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("قائمة الموافقات", "Approval Queue")}
        subtitle={t("التحقق من الشركات والحسابات", "Verify companies and accounts")}
      >
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${items.length} طلبات بانتظار المراجعة`, `${items.length} request(s) pending review`)}>
            {items.length === 0 ? (
              <EmptyState
                icon={Shield}
                title={t("لا طلبات بانتظار المراجعة", "No Requests Pending Review")}
                description={t("جميع الشركات تمت مراجعتها.", "All companies have been reviewed.")}
              />
            ) : (
              <div className="space-y-2">
                {items.map((company) => (
                  <div key={company.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={company.name}
                      subtitle={`${company.industry} · ${company.location}`}
                      meta={company.email}
                      badge={
                        <span className="nq-chip flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {t("بانتظار التحقق", "Pending Verification")}
                        </span>
                      }
                    />
                    <div className="flex gap-2 mt-3 mr-12">
                      <Button size="sm" onClick={() => handleVerify(company.id, "approved")}>
                        <CheckCircle className="w-4 h-4" />
                        {t("موافقة", "Approve")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleVerify(company.id, "rejected")}>
                        <XCircle className="w-4 h-4" />
                        {t("رفض", "Reject")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
