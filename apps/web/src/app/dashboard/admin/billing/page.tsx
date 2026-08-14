"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { BillingWorkspace } from "@/components/billing/billing-workspace";
import { Button } from "@/components/ui/button";
import { useDataApi } from "@/hooks/data";
import type { BillingOverview } from "@careerlink/shared";
import { useI18n } from "@/i18n";

export default function AdminBillingPage() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useDataApi<BillingOverview>("billing?scope=admin");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  const onPay = useCallback(
    async (invoiceId: string) => {
      setBusyId(invoiceId);
      setFlash("");
      try {
        const res = await fetch("/api/data/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pay", invoiceId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "FAILED");
        setFlash(t("تم تسجيل التسديد", "Payment recorded"));
        await refetch();
      } catch {
        setFlash(t("تعذر تسجيل التسديد", "Could not record payment"));
      } finally {
        setBusyId(null);
      }
    },
    [refetch, t]
  );

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Dashboard")}
        title={t("الفوترة والرسوم", "Billing & Fees")}
        subtitle={t(
          "إيرادات المنصة، الفواتير، كتالوج الرسوم، والاشتراكات",
          "Platform revenue, invoices, fee catalog, and subscriptions"
        )}
        actions={
          <Link href="/dashboard/admin/reports">
            <Button variant="outline" size="sm">
              {t("التقارير", "Reports")}
            </Button>
          </Link>
        }
      >
        {flash && <p className="mb-4 text-sm text-emerald">{flash}</p>}
        {loading ? (
          <div className="space-y-4">
            <div className="nq-skeleton h-16" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-24" />
              ))}
            </div>
            <div className="nq-skeleton h-72" />
          </div>
        ) : error || !data ? (
          <p className="text-sm text-red-600">{error ?? t("تعذر التحميل", "Failed to load")}</p>
        ) : (
          <BillingWorkspace data={data} variant="admin" onPay={onPay} busyId={busyId} />
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
