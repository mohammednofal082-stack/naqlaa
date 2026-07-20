"use client";

import { useState } from "react";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/page-header";
import { useEvents, registerForEvent } from "@/hooks/data";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function EventsPage() {
  const { t } = useI18n();
  const eventTypeLabels: Record<string, string> = {
    career_day: t("يوم توظيف", "Career Day"),
    hackathon: t("هاكاثون", "Hackathon"),
    workshop: t("ورشة", "Workshop"),
    webinar: t("ندوة", "Webinar"),
  };
  const { data: events, loading, refetch } = useEvents();
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Record<string, boolean>>({ "event-3": true });
  const list = events ?? [];

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      await registerForEvent(eventId);
      setRegistered((prev) => ({ ...prev, [eventId]: true }));
      await refetch();
    } finally {
      setRegistering(null);
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

      <div className="nq-page-enter mt-6">
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
              const isRegistered = registered[event.id] ?? false;

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
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {isRegistered ? (
                        <>
                          <Button variant="outline">{t("عرض التذكرة", "View Ticket")}</Button>
                          {event.qrCode && (
                            <span className="text-xs text-center text-text-muted font-mono">{event.qrCode}</span>
                          )}
                        </>
                      ) : (
                        <Button onClick={() => handleRegister(event.id)} disabled={registering === event.id}>
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
