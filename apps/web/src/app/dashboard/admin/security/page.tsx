"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Eye, Key, Lock, Shield } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";

type PolicyKey = "twoFactor" | "logIp" | "rateLimit" | "encryption";

const DEFAULT_POLICIES: Record<PolicyKey, boolean> = {
  twoFactor: true,
  logIp: true,
  rateLimit: true,
  encryption: true,
};

type SecurityEvent = {
  id: string;
  message: string;
  actor: string;
  entity: string;
  time: string;
  severity: string;
};

export default function AdminSecurityPage() {
  const { t } = useI18n();
  const [policies, setPolicies] = useState(DEFAULT_POLICIES);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [users, setUsers] = useState(0);
  const [alerts, setAlerts] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const severityLabels: Record<string, string> = {
    low: t("منخفض", "Low"),
    medium: t("متوسط", "Medium"),
    high: t("عالي", "High"),
  };

  const settings: { key: PolicyKey; label: string }[] = [
    { key: "twoFactor", label: t("المصادقة الثنائية إلزامية", "Two-factor authentication required") },
    { key: "logIp", label: t("تسجيل IP للجلسات", "Log session IP addresses") },
    { key: "rateLimit", label: t("حد معدل الطلبات API", "API request rate limiting") },
    { key: "encryption", label: t("تشفير البيانات الحساسة", "Sensitive data encryption") },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/security");
      const json = await res.json();
      if (res.ok && json.data) {
        setPolicies({ ...DEFAULT_POLICIES, ...(json.data.policies as Record<PolicyKey, boolean>) });
        setEvents((json.data.events as SecurityEvent[]) ?? []);
        setUsers(Number(json.data.stats?.users ?? 0));
        setAlerts(Number(json.data.stats?.alerts ?? 0));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (key: PolicyKey) => {
    setPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage("");
  };

  const savePolicies = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/data/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setMessage(t("تم حفظ سياسات الأمان في قاعدة البيانات", "Security policies saved to database"));
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("الأمان", "Security")}
        subtitle={t("مراقبة أمان المنصة وسجلات التدقيق", "Monitor platform security and audit logs")}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title={t("حالة النظام", "System Status")} value={t("آمن", "Secure")} icon={CheckCircle} />
          <StatCard title={t("المستخدمون", "Users")} value={users} icon={Eye} />
          <StatCard title={t("تنبيهات", "Alerts")} value={alerts} icon={AlertTriangle} />
          <StatCard
            title={t("سياسات مفعّلة", "Policies On")}
            value={`${Object.values(policies).filter(Boolean).length}/4`}
            icon={Lock}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <PanelCard title={t("أحداث الأمان / التدقيق", "Security / Audit Events")}>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="nq-skeleton h-14" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={Shield}
                title={t("لا أحداث بعد", "No events yet")}
                description={t("تظهر هنا سجلات التدقيق الحقيقية.", "Real audit logs appear here.")}
              />
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <ActivityRow
                    key={event.id}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                        <Shield className="w-4 h-4 text-brand" />
                      </div>
                    }
                    title={event.message}
                    subtitle={`${event.actor} · ${event.entity || "—"} · ${formatDateTime(event.time)}`}
                    badge={
                      <span
                        className={
                          event.severity === "high"
                            ? "nq-chip"
                            : event.severity === "medium"
                              ? "nq-chip"
                              : "nq-chip nq-chip-emerald"
                        }
                      >
                        {severityLabels[event.severity] ?? event.severity}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </PanelCard>

          <PanelCard title={t("إعدادات الأمان", "Security Settings")}>
            <div className="space-y-2">
              {settings.map((setting) => (
                <ActivityRow
                  key={setting.key}
                  avatar={
                    <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                      <Key className="w-4 h-4 text-brand" />
                    </div>
                  }
                  title={setting.label}
                  badge={
                    <button
                      type="button"
                      onClick={() => toggle(setting.key)}
                      className={
                        policies[setting.key]
                          ? "nq-chip nq-chip-emerald cursor-pointer"
                          : "nq-chip cursor-pointer"
                      }
                    >
                      {policies[setting.key] ? t("مفعّل", "Enabled") : t("معطّل", "Disabled")}
                    </button>
                  }
                />
              ))}
            </div>
            {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
            <Button className="w-full mt-4" disabled={saving} onClick={() => void savePolicies()}>
              {t("تحديث السياسات", "Update Policies")}
            </Button>
          </PanelCard>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
