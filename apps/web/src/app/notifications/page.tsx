"use client";

import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/page-header";
import { useNotifications } from "@/hooks/data";
import { Bell, Briefcase, MessageSquare, Calendar, Building2, CheckCheck, BookOpen, Handshake, GraduationCap, PartyPopper, Shield } from "lucide-react";
import type { NotificationType } from "@careerlink/shared";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";

const typeIcons: Record<NotificationType, typeof Bell> = {
  "job-recommendation": Briefcase,
  message: MessageSquare,
  interview: Calendar,
  "application-update": Bell,
  "company-update": Building2,
  course: BookOpen,
  mentorship: Handshake,
  internship: GraduationCap,
  event: PartyPopper,
  system: Shield,
  verification: Shield,
};

export default function NotificationsPage() {
  const { t } = useI18n();
  const { data, loading } = useNotifications();
  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read);

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("الإشعارات", "Notifications")} subtitle={t("آخر التحديثات والتنبيهات", "Latest updates and alerts")} />
        <div className="space-y-3 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="nq-skeleton h-24 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={t("الإشعارات", "Notifications")} subtitle={`${unread.length} ${t("إشعارات جديدة", "new notifications")}`} />

      <div className="nq-page-enter mt-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t("لا إشعارات بعد", "No notifications yet")}
            description={t("ستصلك هنا تنبيهات الوظائف والرسائل والمقابلات فور حدوثها", "Job, message, and interview alerts will appear here as they happen")}
            action={
              <Link href="/jobs" className="btn-ghost">{t("تصفّح الوظائف", "Browse Jobs")}</Link>
            }
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 text-sm font-medium text-blue hover:underline">
                <CheckCheck className="w-4 h-4" />
                {t("تحديد الكل كمقروء", "Mark all as read")}
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => {
                const Icon = typeIcons[notif.type];
                return (
                  <Link key={notif.id} href={notif.link || "#"} className="block">
                    <Card
                      hover
                      className={`nq-lift flex items-start gap-4 ${!notif.read ? "border-blue/20 bg-blue/5" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !notif.read ? "bg-blue/20" : "bg-cream border border-border"
                      }`}>
                        <Icon className={`w-5 h-5 ${!notif.read ? "text-blue" : "text-text-muted"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${!notif.read ? "text-brand" : "text-text"}`}>{notif.title}</p>
                        <p className="text-sm text-text-secondary mt-1">{notif.message}</p>
                        <p className="text-text-muted text-xs mt-2">{formatDate(notif.timestamp)}</p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
