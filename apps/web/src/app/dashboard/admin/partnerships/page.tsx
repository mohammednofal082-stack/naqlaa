"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { Building2, CheckCircle, Handshake, Shield, GraduationCap, XCircle, Ban } from "lucide-react";

type PartnershipAccount = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
  organizationId?: string;
  avatar: string;
  createdAt: string;
  companyName?: string;
  universityName?: string;
};

export default function AdminPartnershipsPage() {
  const { t } = useI18n();
  const [pending, setPending] = useState<PartnershipAccount[]>([]);
  const [accounts, setAccounts] = useState<PartnershipAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/admin/partnerships");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setPending(json.data?.pending ?? []);
      setAccounts(json.data?.accounts ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحميل", "Failed to load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (userId: string, action: "approve" | "reject" | "suspend") => {
    setBusyId(userId);
    setMsg("");
    try {
      const res = await fetch("/api/data/admin/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setMsg(
        action === "approve"
          ? t("تمت الموافقة على الحساب", "Account approved")
          : action === "reject"
            ? t("تم رفض الحساب", "Account rejected")
            : t("تم تعليق الحساب", "Account suspended"),
      );
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const roleLabel = (roles: string[]) =>
    roles.includes("university")
      ? t("جامعة", "University")
      : t("شركة", "Company");

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("الشراكات الجديدة", "New Partnerships")}
        subtitle={t(
          "مراجعة حسابات الشركات والجامعات وإدارة صلاحيات دخولها",
          "Review company and university accounts and manage their access",
        )}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <PanelCard
              title={t(
                `${pending.length} طلب بانتظار الموافقة`,
                `${pending.length} request(s) awaiting approval`,
              )}
            >
              {pending.length === 0 ? (
                <EmptyState
                  icon={Handshake}
                  title={t("لا طلبات جديدة", "No new requests")}
                  description={t(
                    "عند تسجيل شركة أو جامعة جديدة ستظهر هنا للموافقة.",
                    "When a company or university registers, it will appear here for approval.",
                  )}
                />
              ) : (
                <div className="space-y-2">
                  {pending.map((item) => (
                    <div key={item.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                      <ActivityRow
                        avatar={
                          <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center overflow-hidden">
                            {item.roles.includes("university") ? (
                              <GraduationCap className="w-4 h-4 text-brand" />
                            ) : (
                              <Building2 className="w-4 h-4 text-brand" />
                            )}
                          </div>
                        }
                        title={item.companyName || item.universityName || item.fullName}
                        subtitle={`${roleLabel(item.roles)} · ${item.email}`}
                        meta={item.createdAt}
                        badge={
                          <span className="nq-chip flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {t("بانتظار الموافقة", "Pending approval")}
                          </span>
                        }
                      />
                      <div className="flex flex-wrap gap-2 mt-3 mr-12">
                        <Button size="sm" disabled={busyId === item.id} onClick={() => void act(item.id, "approve")}>
                          <CheckCircle className="w-4 h-4" />
                          {t("موافقة", "Approve")}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void act(item.id, "reject")}>
                          <XCircle className="w-4 h-4" />
                          {t("رفض", "Reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard title={t("إدارة حسابات الشراكات", "Partnership account management")}>
              {accounts.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title={t("لا حسابات بعد", "No accounts yet")}
                  description={t("ستظهر هنا كل حسابات الشركات والجامعات.", "All company and university accounts will appear here.")}
                />
              ) : (
                <div className="space-y-2">
                  {accounts.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.companyName || item.universityName || item.fullName}</p>
                        <p className="text-xs text-text-muted truncate">
                          {roleLabel(item.roles)} · {item.email} · {item.status}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {item.status !== "active" && item.status === "pending" && (
                          <Button size="sm" disabled={busyId === item.id} onClick={() => void act(item.id, "approve")}>
                            {t("تفعيل", "Activate")}
                          </Button>
                        )}
                        {item.status === "active" && (
                          <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void act(item.id, "suspend")}>
                            <Ban className="w-4 h-4" />
                            {t("تعليق", "Suspend")}
                          </Button>
                        )}
                        {item.status === "suspended" && (
                          <Button size="sm" disabled={busyId === item.id} onClick={() => void act(item.id, "approve")}>
                            {t("إعادة تفعيل", "Reactivate")}
                          </Button>
                        )}
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
