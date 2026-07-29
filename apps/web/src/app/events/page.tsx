"use client";

import { useState } from "react";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/layout/page-header";
import { useEvents, registerForEvent, useDataApi } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Calendar, MapPin, Users, Loader2, QrCode, ScanLine } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/i18n";

type EventRegistration = {
  id: string;
  eventId: string;
  qrCode: string;
  checkedIn: boolean;
  eventTitle: string;
};

export default function EventsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const eventTypeLabels: Record<string, string> = {
    career_day: t("يوم توظيف", "Career Day"),
    hackathon: t("هاكاثون", "Hackathon"),
    workshop: t("ورشة", "Workshop"),
    webinar: t("ندوة", "Webinar"),
  };
  const { data: events, loading, refetch } = useEvents();
  const { data: myRegs, refetch: refetchRegs } = useDataApi<EventRegistration[]>("event-registrations");
  const [registering, setRegistering] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Record<string, string>>({});
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInMsg, setCheckInMsg] = useState("");
  const list = events ?? [];
  const canCheckIn = user?.role === "university" || user?.role === "admin" || user?.role === "company" || user?.role === "hr";

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const event = await registerForEvent(eventId);
      if (event?.qrCode) {
        setTickets((prev) => ({ ...prev, [eventId]: event.qrCode! }));
      }
      await refetch();
      await refetchRegs();
    } finally {
      setRegistering(null);
    }
  };

  const doCheckIn = async () => {
    setCheckInMsg("");
    try {
      const res = await fetch("/api/data/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-in", qrCode: checkInCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setCheckInMsg(t(`تم تسجيل الحضور: ${json.data.eventTitle}`, `Checked in: ${json.data.eventTitle}`));
      setCheckInCode("");
    } catch (e) {
      setCheckInMsg(e instanceof Error ? e.message : t("رمز غير صالح", "Invalid code"));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("الفعاليات", "Events")} subtitle={t("فعاليات وورش وأيام توظيف قادمة", "Upcoming events, workshops, and career days")} />
        <div className="space-y-4 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-32 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={t("الفعاليات", "Events")} subtitle={`${list.length} ${t("فعالية قادمة", "upcoming events")}`} />

      <div className="nq-page-enter mt-6 space-y-6">
        {canCheckIn && (
          <Card>
            <CardTitle className="mb-3 flex items-center gap-2">
              <ScanLine className="w-4 h-4" />
              {t("تسجيل حضور (QR)", "Check-in (QR)")}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder={t("الصق رمز التذكرة", "Paste ticket code")}
                value={checkInCode}
                onChange={(e) => setCheckInCode(e.target.value)}
              />
              <Button onClick={() => void doCheckIn()} disabled={!checkInCode.trim()}>
                {t("تأكيد الحضور", "Confirm check-in")}
              </Button>
            </div>
            {checkInMsg && <p className="text-sm text-text-secondary mt-2">{checkInMsg}</p>}
          </Card>
        )}

        {list.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={t("لا توجد فعاليات قادمة", "No upcoming events")}
            description={t("تُعلن فعاليات وورش جديدة باستمرار — عد للتحقق قريباً", "New events and workshops are announced regularly — check back soon")}
            action={
              <Link href="/feed" className="btn-ghost">{t("تصفّح المجتمع", "Browse Community")}</Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {list.map((event) => {
              const reg = (myRegs ?? []).find((r) => r.eventId === event.id);
              const qr = tickets[event.id] || reg?.qrCode;
              const isRegistered = Boolean(qr || reg);

              return (
                <Card key={event.id} className="nq-lift">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="nq-chip">{eventTypeLabels[event.type] ?? event.type}</span>
                      <CardTitle className="font-display font-bold mt-2">{event.title}</CardTitle>
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">{event.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateTime(event.startAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {event.registrationsCount} {t("مسجل", "registered")}
                        </span>
                      </div>
                      {isRegistered && qr && (
                        <div className="mt-3 p-3 rounded-lg border border-border bg-surface-hover/50">
                          <p className="text-xs font-semibold text-text flex items-center gap-1 mb-1">
                            <QrCode className="w-3.5 h-3.5" />
                            {t("تذكرتك", "Your ticket")}
                            {reg?.checkedIn ? ` · ${t("تم الحضور", "Checked in")}` : ""}
                          </p>
                          <p className="text-xs font-mono break-all text-text-muted">{qr}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {isRegistered ? (
                        <Button variant="outline" disabled>
                          {t("مسجّل", "Registered")}
                        </Button>
                      ) : (
                        <Button onClick={() => void handleRegister(event.id)} disabled={registering === event.id}>
                          {registering === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {t("التسجيل", "Register")}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
