"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageSquare, Shield, User } from "lucide-react";
import { useI18n } from "@/i18n";

const typeIcons: Record<string, React.ComponentType<{ className?: string }> > = {
  profile: User,
  message: MessageSquare,
  job: AlertTriangle,
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
  const initial: Report[] = [
    { id: "mod-1", type: "profile", target: t("حساب مشبوه", "Suspicious account"), reporter: t("سارة خليل", "Sara Khalil"), reason: t("معلومات غير دقيقة", "Inaccurate information"), status: "pending", date: "2025-06-20", link: "/dashboard/admin/users" },
    { id: "mod-2", type: "message", target: t("رسالة مسيئة", "Abusive message"), reporter: t("أمير أبو شمس", "Ameer Abu Shams"), reason: t("محتوى غير لائق", "Inappropriate content"), status: "pending", date: "2025-06-19", link: "/messages" },
    { id: "mod-3", type: "job", target: t("وظيفة مزيفة", "Fake job posting"), reporter: t("مدير النظام", "System Administrator"), reason: t("شركة غير موثقة", "Unverified company"), status: "reviewed", date: "2025-06-18", link: "/dashboard/admin/companies" },
  ];

  const typeLabels: Record<string, string> = {
    profile: t("ملف شخصي", "Profile"),
    message: t("رسالة", "Message"),
    job: t("وظيفة", "Job"),
  };

  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState("");

  const resolve = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "reviewed" } : item)));
    setMsg(t("تم تعليم البلاغ كمُعالَج", "Report marked as resolved"));
  };

  const ban = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "banned" } : item)));
    setMsg(t("تم حظر الهدف وربطه بقائمة الشركات/المستخدمين للمراجعة", "Target banned — review companies/users list"));
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("الإشراف", "Moderation")}
        subtitle={t("مراجعة البلاغات والمحتوى", "Review reports and content")}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard title={t("بلاغات معلقة", "Pending Reports")} value={items.filter((i) => i.status === "pending").length} icon={AlertTriangle} />
          <StatCard title={t("تمت المراجعة", "Reviewed")} value={items.filter((i) => i.status === "reviewed" || i.status === "banned").length} icon={Shield} />
          <StatCard title={t("إجمالي البلاغات", "Total Reports")} value={items.length} icon={MessageSquare} />
        </div>

        <PanelCard title={t("البلاغات", "Reports")}>
          {items.filter((i) => i.status === "pending").length === 0 ? (
            <EmptyState
              icon={Shield}
              title={t("لا بلاغات معلقة", "No Pending Reports")}
              description={t("جميع البلاغات تمت معالجتها. أحسنت!", "All reports have been handled. Well done!")}
            />
          ) : (
            <div className="space-y-2">
              {items.filter((i) => i.status === "pending").map((report) => {
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
                      badge={<span className="nq-chip">{typeLabels[report.type]}</span>}
                    />
                    <p className="text-xs text-text-muted mt-2 mr-12">{t("بلّغ", "Reported by")} {report.reporter}</p>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Link href={report.link ?? "/dashboard/admin/verification"}>
                        <Button size="sm" variant="outline">{t("عرض", "View")}</Button>
                      </Link>
                      <Button size="sm" onClick={() => resolve(report.id)}>{t("حل", "Resolve")}</Button>
                      <Button size="sm" variant="danger" onClick={() => ban(report.id)}>{t("حظر", "Ban")}</Button>
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
