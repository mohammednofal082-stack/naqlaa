"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorshipSessions } from "@/hooks/data";
import { Clock, Calendar, ClipboardList } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { sessionStatusLabel } from "@/i18n/labels";

export default function MentorRequestsPage() {
  const { t } = useI18n();
  const { data: sessions, loading } = useMentorshipSessions();
  const [removed, setRemoved] = useState<string[]>([]);

  const requests = (sessions ?? [])
    .filter((s) => s.status === "requested" && !removed.includes(s.id));

  const handleAction = (id: string) => {
    setRemoved((prev) => [...prev, id]);
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("طلبات الجلسات", "Session Requests")}
        subtitle={t(`${requests.length} طلب جديد`, `${requests.length} new request(s)`)}
      >
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={t("لا توجد طلبات جديدة", "No New Requests")}
            description={t("الطلبات الجديدة من المتدربين ستظهر هنا للموافقة.", "New requests from mentees will appear here for approval.")}
          />
        ) : (
          <div className="space-y-4">
            {requests.map((session) => (
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
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction(session.id)}>{t("قبول", "Accept")}</Button>
                    <Button variant="outline" onClick={() => handleAction(session.id)}>{t("رفض", "Decline")}</Button>
                    <Button variant="secondary">{t("اقتراح وقت", "Suggest Time")}</Button>
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
