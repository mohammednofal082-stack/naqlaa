"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Eye, Key, Lock, Shield } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AdminSecurityPage() {
  const { t } = useI18n();
  const securityEvents = [
    { id: "sec-1", type: "login", message: t("محاولة دخول فاشلة", "Failed login attempt"), ip: "192.168.1.45", time: "2025-06-22T08:30:00", severity: "medium" },
    { id: "sec-2", type: "permission", message: t("تغيير صلاحيات مستخدم", "User permissions changed"), ip: "10.0.0.12", time: "2025-06-21T14:00:00", severity: "low" },
    { id: "sec-3", type: "api", message: t("طلب API مشبوه", "Suspicious API request"), ip: "45.33.22.11", time: "2025-06-21T02:15:00", severity: "high" },
  ];

  const severityLabels: Record<string, string> = {
    low: t("منخفض", "Low"),
    medium: t("متوسط", "Medium"),
    high: t("عالي", "High"),
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("الأمان", "Security")}
        subtitle={t("مراقبة أمان المنصة", "Monitor platform security")}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title={t("حالة النظام", "System Status")} value={t("آمن", "Secure")} icon={CheckCircle} />
          <StatCard title={t("جلسات نشطة", "Active Sessions")} value="1,234" icon={Eye} />
          <StatCard title={t("تنبيهات", "Alerts")} value="3" icon={AlertTriangle} />
          <StatCard title={t("2FA مفعّل", "2FA Enabled")} value="89%" icon={Lock} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <PanelCard title={t("أحداث الأمان", "Security Events")}>
            <div className="space-y-2">
              {securityEvents.map((event) => (
                <ActivityRow
                  key={event.id}
                  avatar={
                    <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                      <Shield className="w-4 h-4 text-brand" />
                    </div>
                  }
                  title={event.message}
                  subtitle={event.ip}
                  badge={
                    <span className={event.severity === "high" ? "nq-chip" : event.severity === "medium" ? "nq-chip" : "nq-chip nq-chip-emerald"}>
                      {severityLabels[event.severity]}
                    </span>
                  }
                />
              ))}
            </div>
          </PanelCard>

          <PanelCard title={t("إعدادات الأمان", "Security Settings")}>
            <div className="space-y-2">
              {[
                { label: t("المصادقة الثنائية إلزامية", "Two-factor authentication required"), enabled: true },
                { label: t("تسجيل IP للجلسات", "Log session IP addresses"), enabled: true },
                { label: t("حد معدل الطلبات API", "API request rate limiting"), enabled: true },
                { label: t("تشفير البيانات الحساسة", "Sensitive data encryption"), enabled: true },
              ].map((setting) => (
                <ActivityRow
                  key={setting.label}
                  avatar={
                    <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                      <Key className="w-4 h-4 text-brand" />
                    </div>
                  }
                  title={setting.label}
                  badge={
                    <span className={setting.enabled ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                      {setting.enabled ? t("مفعّل", "Enabled") : t("معطّل", "Disabled")}
                    </span>
                  }
                />
              ))}
            </div>
            <Button className="w-full mt-4">{t("تحديث السياسات", "Update Policies")}</Button>
          </PanelCard>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
