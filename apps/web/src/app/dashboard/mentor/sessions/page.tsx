"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorshipSessions } from "@/hooks/data";
import { Calendar, Clock, Video, Star } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { sessionStatusLabel } from "@/i18n/labels";

export default function MentorSessionsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { data: sessions, loading } = useMentorshipSessions();
  const allSessions = sessions ?? [];

  const upcoming = allSessions.filter((s) => s.status === "accepted" || s.status === "requested");
  const past = allSessions.filter((s) => s.status === "completed");
  const sessionList = tab === "upcoming" ? upcoming : past;

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("الجلسات", "Sessions")}
        subtitle={t("إدارة جلسات الإرشاد", "Manage mentorship sessions")}
      >
        <div className="flex gap-2 mb-6">
          <Button variant={tab === "upcoming" ? "primary" : "outline"} size="sm" onClick={() => setTab("upcoming")}>
            {t("قادمة", "Upcoming")} ({upcoming.length})
          </Button>
          <Button variant={tab === "past" ? "primary" : "outline"} size="sm" onClick={() => setTab("past")}>
            {t("سابقة", "Past")} ({past.length})
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : sessionList.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={tab === "upcoming" ? t("لا جلسات قادمة", "No Upcoming Sessions") : t("لا جلسات سابقة", "No Past Sessions")}
            description={t("عند جدولة أو إتمام جلسات ستظهر هنا.", "Scheduled or completed sessions will appear here.")}
          />
        ) : (
          <div className="space-y-4">
            {sessionList.map((session) => (
              <Card key={session.id} className="nq-lift">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{session.topic}</CardTitle>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(session.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.durationMinutes} {t("دقيقة", "min")}
                      </span>
                    </div>
                    <span className="nq-chip mt-2 inline-flex">{sessionStatusLabel(session.status, t)}</span>
                    {session.feedback && (
                      <p className="text-sm text-text-secondary mt-2 p-3 rounded-lg bg-surface-hover border border-border">{session.feedback}</p>
                    )}
                    {session.rating && (
                      <p className="text-sm text-amber mt-2 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {session.rating}/5
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {session.meetingLink && tab === "upcoming" && (
                      <Button size="sm">
                        <Video className="w-4 h-4" />
                        {t("انضم", "Join")}
                      </Button>
                    )}
                    {tab === "past" && (
                      <Button size="sm" variant="outline">{t("ملاحظات", "Notes")}</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
