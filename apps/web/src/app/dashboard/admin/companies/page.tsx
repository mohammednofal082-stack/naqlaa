"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { CompanyCard } from "@/components/jobs/job-card";
import { useCompanies, verifyEntity } from "@/hooks/data";
import { Button } from "@/components/ui/button";
import { Building2, Check, X } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AdminCompaniesPage() {
  const { t } = useI18n();
  const { data: companies, loading, refetch } = useCompanies();
  const items = companies ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const handleVerify = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    setMsg("");
    try {
      await verifyEntity({ entityType: "company", entityId: id, status });
      await refetch();
      setMsg(status === "approved" ? t("تمت الموافقة", "Approved") : t("تم الرفض", "Rejected"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("إدارة الشركات", "Company Management")}
        subtitle={t("الموافقة على الشركات الجديدة", "Approve new companies")}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-32" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${items.length} شركة`, `${items.length} compan${items.length === 1 ? "y" : "ies"}`)}>
            {items.length === 0 ? (
              <EmptyState
                icon={Building2}
                title={t("لا شركات بعد", "No Companies Yet")}
                description={t("عند تسجيل شركات جديدة ستظهر للموافقة هنا.", "When new companies register, they will appear here for approval.")}
              />
            ) : (
              <div className="space-y-4">
                {items.map((company) => (
                  <div key={company.id} className="nq-lift relative rounded-xl">
                    <CompanyCard company={company} />
                    {!company.verified && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Button size="sm" variant="secondary" disabled={busyId === company.id} onClick={() => void handleVerify(company.id, "approved")}>
                          <Check className="w-4 h-4" /> {t("موافقة", "Approve")}
                        </Button>
                        <Button size="sm" variant="danger" disabled={busyId === company.id} onClick={() => void handleVerify(company.id, "rejected")}>
                          <X className="w-4 h-4" /> {t("رفض", "Reject")}
                        </Button>
                      </div>
                    )}
                    {company.verified && (
                      <span className="absolute top-4 left-4 nq-chip nq-chip-emerald">{t("موثّقة", "Verified")}</span>
                    )}
                    <div className="p-3">
                      <Link href={`/companies/${company.id}`} className="text-sm text-brand hover:underline">
                        {t("عرض التفاصيل", "View details")}
                      </Link>
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
