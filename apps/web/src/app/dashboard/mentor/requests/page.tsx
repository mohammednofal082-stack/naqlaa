"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMentorshipSessions, updateMentorshipStatus } from "@/hooks/data";
import { Clock, Calendar, ClipboardList } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { sessionStatusLabel } from "@/i18n/labels";

export default function MentorRequestsPage() {
  const { t } = useI18n();
  const { data: sessions, loading, refetch } = useMentorshipSessions();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [suggestId, setSuggestId] = useState<string | null>(null);
  const [suggestAt, setSuggestAt] = useState("");
  const [msg, setMsg] = useState("");

  const requests = (sessions ?? []).filter((s) => s.status === "requested");

  const handleAction = async (id: string, status: "accepted" | "rejected", scheduledAt?: string) => {
    setBusyId(id);
    setMsg("");
    try {
      await updateMentorshipStatus(id, status, scheduledAt ? { scheduledAt } : undefined);
      setSuggestId(null);
      await refetch();
      setMsg(status === "accepted" ? t("تم القبول", "Accepted") : t("تم الرفض", "Declined"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحديث", "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("طلبات الجلسات", "Session Requests")}
        subtitle={t(`${requests.length} طلب جديد`, `${requests.length} new request(s)`)}
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}
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
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busyId === session.id} onClick={() => void handleAction(session.id, "accepted")}>
                      {t("قبول", "Accept")}
                    </Button>
                    <Button variant="outline" disabled={busyId === session.id} onClick={() => void handleAction(session.id, "rejected")}>
                      {t("رفض", "Decline")}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busyId === session.id}
                      onClick={() => {
                        setSuggestId(session.id);
                        setSuggestAt(session.scheduledAt.slice(0, 16));
                      }}
                    >
                      {t("اقتراح وقت", "Suggest Time")}
                    </Button>
                  </div>
                </div>
                {suggestId === session.id && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
                    <Input type="datetime-local" value={suggestAt} onChange={(e) => setSuggestAt(e.target.value)} />
                    <Button
                      disabled={!suggestAt || busyId === session.id}
                      onClick={() => void handleAction(session.id, "accepted", new Date(suggestAt).toISOString())}
                    >
                      {t("قبول بالوقت الجديد", "Accept with new time")}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
