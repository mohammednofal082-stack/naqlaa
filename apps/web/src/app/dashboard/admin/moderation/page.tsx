"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare, Shield, User } from "lucide-react";
import { useI18n } from "@/i18n";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  profile: User,
  message: MessageSquare,
  job: AlertTriangle,
  post: MessageSquare,
  company: Shield,
  other: Shield,
};

type Report = {
  id: string;
  type: string;
  target: string;
  reporter: string;
  reason: string;
  status: "pending" | "reviewed" | "banned";
  date: string;
  link?: string;
};

export default function AdminModerationPage() {
  const { t } = useI18n();
  const typeLabels: Record<string, string> = {
    profile: t("ملف شخصي", "Profile"),
    message: t("رسالة", "Message"),
    job: t("وظيفة", "Job"),
    post: t("منشور", "Post"),
    company: t("شركة", "Company"),
    other: t("أخرى", "Other"),
  };

  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/reports");
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) setItems(json.data as Report[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: "reviewed" | "banned") => {
    setBusyId(id);
    setMsg("");
    try {
      const res = await fetch("/api/data/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      setMsg(
        status === "banned"
          ? t("تم الحظر وتسجيل الإجراء", "Banned and logged in audit")
          : t("تم تعليم البلاغ كمُعالَج", "Report marked as resolved")
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const pending = items.filter((i) => i.status === "pending");

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("الإشراف", "Moderation")}
        subtitle={t("مراجعة البلاغات والمحتوى", "Review reports and content")}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard title={t("بلاغات معلقة", "Pending Reports")} value={pending.length} icon={AlertTriangle} />
          <StatCard
            title={t("تمت المراجعة", "Reviewed")}
            value={items.filter((i) => i.status === "reviewed" || i.status === "banned").length}
            icon={Shield}
          />
          <StatCard title={t("إجمالي البلاغات", "Total Reports")} value={items.length} icon={MessageSquare} />
        </div>

        <PanelCard title={t("البلاغات", "Reports")}>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={t("لا بلاغات معلقة", "No Pending Reports")}
              description={t(
                "البلاغات من الفيد تظهر هنا بعد الإرسال.",
                "Reports submitted from the feed appear here."
              )}
            />
          ) : (
            <div className="space-y-2">
              {pending.map((report) => {
                const Icon = typeIcons[report.type] ?? Shield;
                return (
                  <div key={report.id} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Icon className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={report.target}
                      subtitle={report.reason}
                      meta={report.date}
                      badge={<span className="nq-chip">{typeLabels[report.type] ?? report.type}</span>}
                    />
                    <p className="text-xs text-text-muted mt-2 mr-12">
                      {t("بلّغ", "Reported by")} {report.reporter}
                    </p>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Link href={report.link ?? "/dashboard/admin/users"}>
                        <Button size="sm" variant="outline">
                          {t("عرض", "View")}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        disabled={busyId === report.id}
                        onClick={() => void updateStatus(report.id, "reviewed")}
                      >
                        {t("حل", "Resolve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === report.id}
                        onClick={() => void updateStatus(report.id, "banned")}
                      >
                        {t("حظر", "Ban")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
