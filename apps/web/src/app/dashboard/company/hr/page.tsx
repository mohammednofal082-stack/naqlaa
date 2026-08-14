"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { HR_MANAGEABLE_PERMISSIONS } from "@careerlink/shared";
import { Users, UserPlus, CheckCircle, Ban } from "lucide-react";

type HrAccount = {
  id: string;
  email: string;
  fullName: string;
  status: string;
  avatar: string;
  permissions: string[];
  createdAt: string;
};

export default function CompanyHrPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = useState<HrAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    permissions: HR_MANAGEABLE_PERMISSIONS.map((p) => p.code) as string[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/company/hr");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setAccounts(json.data?.accounts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل التحميل", "Failed to load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePermission = (code: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(code)
        ? prev.permissions.filter((c) => c !== code)
        : [...prev.permissions, code],
    }));
  };

  const createHr = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/data/company/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("فشل إنشاء الحساب", "Failed to create account"));
      setMsg(t("تم إنشاء حساب الموارد البشرية", "HR account created"));
      setForm({
        fullName: "",
        email: "",
        password: "",
        permissions: HR_MANAGEABLE_PERMISSIONS.map((p) => p.code),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل إنشاء الحساب", "Failed to create account"));
    } finally {
      setBusy(false);
    }
  };

  const updateAccount = async (userId: string, patch: { permissions?: string[]; status?: string }) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/data/company/hr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setMsg(t("تم تحديث الحساب", "Account updated"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company")}
        title={t("حسابات الموارد البشرية", "HR Accounts")}
        subtitle={t(
          "أنشئ حسابات HR وحدّد صلاحياتهم من صفحة الشركة",
          "Create HR accounts and set their permissions from the company page",
        )}
      >
        {(msg || error) && (
          <p className={`text-sm mb-4 ${error ? "text-red-600" : "text-emerald-700"}`}>{error || msg}</p>
        )}

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2">
            <PanelCard title={t("إنشاء حساب HR", "Create HR account")}>
              <form onSubmit={createHr} className="space-y-3">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">{t("الاسم الكامل", "Full name")}</label>
                  <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">{t("البريد", "Email")}</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">{t("كلمة المرور", "Password")}</label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-2">{t("الصلاحيات", "Permissions")}</p>
                  <div className="space-y-2">
                    {HR_MANAGEABLE_PERMISSIONS.map((p) => (
                      <label key={p.code} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={form.permissions.includes(p.code)}
                          onChange={() => togglePermission(p.code)}
                        />
                        <span>{t(p.nameAr, p.nameEn)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" loading={busy}>
                  <UserPlus className="w-4 h-4" />
                  {t("إنشاء الحساب", "Create account")}
                </Button>
              </form>
            </PanelCard>
          </div>

          <div className="lg:col-span-3">
            <PanelCard title={t(`${accounts.length} حساب HR`, `${accounts.length} HR account(s)`)}>
              {loading ? (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="nq-skeleton h-20" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={t("لا حسابات HR بعد", "No HR accounts yet")}
                  description={t("أنشئ أول حساب موارد بشرية من النموذج المجاور.", "Create the first HR account from the form.")}
                />
              ) : (
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="rounded-lg border border-border p-3 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{acc.fullName}</p>
                          <p className="text-xs text-text-muted truncate">{acc.email} · {acc.status}</p>
                        </div>
                        {acc.status === "active" ? (
                          <Button size="sm" variant="outline" disabled={busy} onClick={() => void updateAccount(acc.id, { status: "suspended" })}>
                            <Ban className="w-4 h-4" />
                            {t("تعليق", "Suspend")}
                          </Button>
                        ) : (
                          <Button size="sm" disabled={busy} onClick={() => void updateAccount(acc.id, { status: "active" })}>
                            <CheckCircle className="w-4 h-4" />
                            {t("تفعيل", "Activate")}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {HR_MANAGEABLE_PERMISSIONS.map((p) => {
                          const on = acc.permissions.includes(p.code);
                          return (
                            <button
                              key={p.code}
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                const next = on
                                  ? acc.permissions.filter((c) => c !== p.code)
                                  : [...acc.permissions, p.code];
                                void updateAccount(acc.id, { permissions: next });
                              }}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                                on
                                  ? "bg-brand/10 border-brand/30 text-brand"
                                  : "bg-surface-hover border-border text-text-muted"
                              }`}
                            >
                              {t(p.nameAr, p.nameEn)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>
          </div>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
