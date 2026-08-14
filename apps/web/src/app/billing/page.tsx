"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { BillingWorkspace } from "@/components/billing/billing-workspace";
import { Button } from "@/components/ui/button";
import { useDataApi } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import type { BillingOverview } from "@careerlink/shared";
import { useI18n } from "@/i18n";

export default function AccountBillingPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const role = user?.role;
  const scope = useMemo(() => {
    if (role === "admin") return "admin";
    if (role === "company" || role === "hr") return "company";
    return "me";
  }, [role]);
  const variant = scope === "admin" ? "admin" : scope === "company" ? "company" : "account";
  const { data, loading, error, refetch } = useDataApi<BillingOverview>(`billing?scope=${scope}`);
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

  const onChangePlan = useCallback(
    async (planId: string) => {
      setBusyId(planId);
      setFlash("");
      try {
        const res = await fetch("/api/data/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "change_plan", planId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "FAILED");
        setFlash(t("تم تحديث الباقة", "Plan updated"));
        await refetch();
      } catch {
        setFlash(t("فشل تحديث الباقة", "Plan update failed"));
      } finally {
        setBusyId(null);
      }
    },
    [refetch, t]
  );

  const title =
    variant === "admin"
      ? t("الفوترة والرسوم", "Billing & Fees")
      : variant === "company"
        ? t("الفوترة والاشتراك", "Billing & Subscription")
        : t("الرسوم والفواتير", "Fees & Invoices");

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("حسابي", "My Account")}
        title={title}
        subtitle={t(
          "معاينة الفواتير والرسوم والاشتراكات",
          "Preview invoices, fees, and subscriptions"
        )}
        actions={
          <Link href="/settings">
            <Button variant="outline" size="sm">
              {t("الإعدادات", "Settings")}
            </Button>
          </Link>
        }
      >
        {flash && <p className="mb-4 text-sm text-emerald">{flash}</p>}
        {loading ? (
          <div className="space-y-4">
            <div className="nq-skeleton h-16" />
            <div className="nq-skeleton h-72" />
          </div>
        ) : error || !data ? (
          <p className="text-sm text-red-600">{error ?? t("تعذر التحميل", "Failed to load")}</p>
        ) : (
          <BillingWorkspace
            data={data}
            variant={variant}
            onPay={onPay}
            onChangePlan={variant === "company" ? onChangePlan : undefined}
            busyId={busyId}
          />
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
