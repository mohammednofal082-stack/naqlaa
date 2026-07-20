"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/hooks/data";
import { formatDateTime } from "@/lib/utils";
import { FileText } from "lucide-react";
import { useI18n } from "@/i18n";

export default function AdminLogsPage() {
  const { t } = useI18n();
  const actionLabels: Record<string, string> = {
    VERIFY_COMPANY: t("تحقق شركة", "Verify Company"),
    STATUS_CHANGE: t("تغيير حالة", "Status Change"),
    APPROVE_INTERNSHIP: t("موافقة تدريب", "Approve Internship"),
  };

  const entityLabels: Record<string, string> = {
    company: t("شركة", "Company"),
    application: t("طلب", "Application"),
    internship: t("تدريب", "Internship"),
  };

  const [filter, setFilter] = useState<string>("all");
  const { data: auditLogs, loading } = useAuditLogs();
  const logs = auditLogs ?? [];
  const filtered = filter === "all" ? logs : logs.filter((l) => l.entityType === filter);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("سجل العمليات", "Audit Log")}
        subtitle={t("تتبع نشاط المنصة", "Track platform activity")}
      >
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>{t("الكل", "All")}</Button>
          <Button variant={filter === "company" ? "primary" : "outline"} size="sm" onClick={() => setFilter("company")}>{t("شركات", "Companies")}</Button>
          <Button variant={filter === "application" ? "primary" : "outline"} size="sm" onClick={() => setFilter("application")}>{t("طلبات", "Applications")}</Button>
          <Button variant={filter === "internship" ? "primary" : "outline"} size="sm" onClick={() => setFilter("internship")}>{t("تدريبات", "Internships")}</Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="nq-skeleton h-16" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${filtered.length} عملية`, `${filtered.length} operation(s)`)}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={t("لا عمليات", "No Operations")}
                description={t("لا توجد سجلات مطابقة لهذا الفلتر.", "No records match this filter.")}
              />
            ) : (
              <div className="space-y-2">
                {filtered.map((log) => (
                  <ActivityRow
                    key={log.id}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                        <FileText className="w-4 h-4 text-brand" />
                      </div>
                    }
                    title={actionLabels[log.action] ?? log.action}
                    subtitle={`${entityLabels[log.entityType] ?? log.entityType} · ${log.entityId}`}
                    meta={formatDateTime(log.createdAt)}
                    badge={<span className="nq-chip">{log.entityType}</span>}
                  />
                ))}
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
