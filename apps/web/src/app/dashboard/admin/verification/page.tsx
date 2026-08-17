"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompanies, useDataApi, verifyEntity } from "@/hooks/data";
import { Building2, CheckCircle, GraduationCap, Shield, XCircle } from "lucide-react";
import { useI18n } from "@/i18n";

type PendingAccount = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
  organizationId?: string;
};

export default function AdminVerificationPage() {
  const { t } = useI18n();
  const { data: companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const {
    data: partnerships,
    loading: partnershipsLoading,
    refetch: refetchPartnerships,
  } = useDataApi<{ pending: PendingAccount[] }>("admin/partnerships");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingCompanies = (companies ?? []).filter((c) => !c.verified);
  const pendingUniversities = (partnerships?.pending ?? []).filter((item) =>
    item.roles.includes("university"),
  );
  const loading = companiesLoading || partnershipsLoading;

  const handleCompany = async (id: string, status: "approved" | "rejected") => {
    setBusyId(id);
    setError("");
    try {
      await verifyEntity({ entityType: "company", entityId: id, status });
      await Promise.all([refetchCompanies(), refetchPartnerships()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل التحقق", "Verification failed"));
    } finally {
      setBusyId(null);
    }
  };

  const handleUniversity = async (userId: string, action: "approve" | "reject") => {
    setBusyId(userId);
    setError("");
    try {
      const res = await fetch("/api/data/admin/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetchPartnerships();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل التحقق", "Verification failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("قائمة الموافقات", "Approval Queue")}
        subtitle={t("التحقق من الشركات والجامعات والحسابات", "Verify companies, universities, and accounts")}
      >
        {error ? <p className="text-sm text-red-500 mb-4">{error}</p> : null}
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <PanelCard title={t(`${pendingCompanies.length} شركات بانتظار المراجعة`, `${pendingCompanies.length} compan${pendingCompanies.length === 1 ? "y" : "ies"} pending`)}>
              {pendingCompanies.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title={t("لا شركات بانتظار المراجعة", "No Companies Pending Review")}
                  description={t("جميع الشركات تمت مراجعتها.", "All companies have been reviewed.")}
                />
              ) : (
                <div className="space-y-2">
                  {pendingCompanies.map((company) => (
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
                        <Button size="sm" disabled={busyId === company.id} onClick={() => void handleCompany(company.id, "approved")}>
                          <CheckCircle className="w-4 h-4" />
                          {t("موافقة", "Approve")}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === company.id} onClick={() => void handleCompany(company.id, "rejected")}>
                          <XCircle className="w-4 h-4" />
                          {t("رفض", "Reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard title={t(`${pendingUniversities.length} جامعات بانتظار المراجعة`, `${pendingUniversities.length} universit${pendingUniversities.length === 1 ? "y" : "ies"} pending`)}>
              {pendingUniversities.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title={t("لا جامعات بانتظار المراجعة", "No Universities Pending Review")}
                  description={t("جميع حسابات الجامعات تمت مراجعتها.", "All university accounts have been reviewed.")}
                />
              ) : (
                <div className="space-y-2">
                  {pendingUniversities.map((item) => (
                    <div key={item.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                      <ActivityRow
                        avatar={
                          <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-brand" />
                          </div>
                        }
                        title={item.fullName}
                        subtitle={item.email}
                        meta={item.organizationId || t("جامعة جديدة", "New university")}
                        badge={
                          <span className="nq-chip flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {t("بانتظار التحقق", "Pending Verification")}
                          </span>
                        }
                      />
                      <div className="flex gap-2 mt-3 mr-12">
                        <Button size="sm" disabled={busyId === item.id} onClick={() => void handleUniversity(item.id, "approve")}>
                          <CheckCircle className="w-4 h-4" />
                          {t("موافقة", "Approve")}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void handleUniversity(item.id, "reject")}>
                          <XCircle className="w-4 h-4" />
                          {t("رفض", "Reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
