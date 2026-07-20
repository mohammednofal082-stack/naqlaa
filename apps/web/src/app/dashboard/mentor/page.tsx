"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useMentors, useMentorshipSessions, useUsers } from "@/hooks/data";
import { Calendar, ClipboardList, Clock, Star } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { sessionStatusLabel } from "@/i18n/labels";

export default function MentorDashboard() {
  const { t } = useI18n();
  const availabilitySlots = [
    { day: t("الأحد", "Sunday"), slots: ["10:00", "14:00", "16:00"] },
    { day: t("الثلاثاء", "Tuesday"), slots: ["11:00", "15:00"] },
    { day: t("الخميس", "Thursday"), slots: ["09:00", "13:00", "17:00"] },
  ];
  const { data: mentors, loading: mentorsLoading } = useMentors();
  const { data: sessions, loading: sessionsLoading } = useMentorshipSessions();
  const { data: users, loading: usersLoading } = useUsers();
  const loading = mentorsLoading || sessionsLoading || usersLoading;
  const mentor = mentors?.[0];
  const allSessions = sessions ?? [];
  const getUser = (id: string) => users?.find((u) => u.id === id);

  const upcoming = allSessions.filter((s) => s.status === "accepted" || s.status === "requested");
  const requests = allSessions.filter((s) => s.status === "requested");

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="mentor"
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("مساحة الإرشاد", "Mentorship Workspace")}
        subtitle={mentor?.expertiseArea ?? t("إرشاد مهني", "Career Mentorship")}
        showScenarios
        secondaryCta={{ href: "/dashboard/mentor/sessions", label: t("الجلسات", "Sessions") }}
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="nq-skeleton h-56" />
                <div className="nq-skeleton h-40" />
              </div>
              <div className="nq-skeleton h-72" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title={t("جلسات قادمة", "Upcoming Sessions")} value={upcoming.length} icon={Calendar} accent="blue" />
              <StatCard title={t("طلبات جديدة", "New Requests")} value={requests.length} icon={ClipboardList} accent="amber" />
              <StatCard title={t("إجمالي الجلسات", "Total Sessions")} value={mentor?.sessionsCount ?? allSessions.length} icon={Clock} accent="purple" />
              <StatCard title={t("التقييم", "Rating")} value={mentor?.rating ?? 4.9} icon={Star} accent="emerald" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PanelCard title={t("الجلسات القادمة", "Upcoming Sessions")} action={<Link href="/dashboard/mentor/sessions"><Button variant="outline" size="sm">{t("عرض الكل", "View All")}</Button></Link>}>
                  {upcoming.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title={t("لا جلسات قادمة", "No Upcoming Sessions")}
                      description={t("عند قبول طلبات جديدة ستظهر الجلسات هنا.", "Once you accept new requests, sessions will appear here.")}
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map((session) => {
                        const mentee = getUser(session.menteeId);
                        return (
                          <div key={session.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                            <div>
                              <p className="font-semibold text-text">{session.topic}</p>
                              <p className="text-sm text-text-muted">{mentee?.firstName ?? t("متدرب", "Mentee")} · {session.durationMinutes} {t("دقيقة", "min")}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium text-blue">{formatDateTime(session.scheduledAt)}</p>
                              <span className="nq-chip">{sessionStatusLabel(session.status, t)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </PanelCard>

                <PanelCard title={t("طلبات الجلسات", "Session Requests")} action={<Link href="/dashboard/mentor/requests"><Button variant="outline" size="sm">{t("إدارة الطلبات", "Manage Requests")}</Button></Link>}>
                  {requests.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title={t("لا توجد طلبات جديدة", "No New Requests")}
                      description={t("الطلبات الجديدة من المتدربين ستظهر هنا.", "New requests from mentees will appear here.")}
                    />
                  ) : (
                    <div className="space-y-3">
                      {requests.map((session) => (
                        <div key={session.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                          <div>
                            <p className="font-semibold text-text">{session.topic}</p>
                            <p className="text-sm text-text-muted">{formatDateTime(session.scheduledAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">{t("قبول", "Accept")}</Button>
                            <Button size="sm" variant="outline">{t("رفض", "Decline")}</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PanelCard>
              </div>

              <PanelCard title={t("الأوقات المتاحة", "Available Times")} action={<Link href="/dashboard/mentor/availability"><Button variant="outline" size="sm">{t("تعديل", "Edit")}</Button></Link>}>
                <div className="space-y-4">
                  {availabilitySlots.map((day) => (
                    <div key={day.day} className="nq-lift p-3 rounded-lg border border-border bg-surface-hover/40">
                      <p className="text-sm font-semibold text-text mb-2">{day.day}</p>
                      <p className="text-sm text-text-muted">{day.slots.join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </PanelCard>
            </div>
          </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
