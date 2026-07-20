"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/data";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";

export default function UniversityEventsPage() {
  const { t } = useI18n();
  const eventTypeLabels: Record<string, string> = {
    career_day: t("يوم توظيف", "Career Day"),
    hackathon: t("هاكاثون", "Hackathon"),
    workshop: t("ورشة", "Workshop"),
  };
  const [filter, setFilter] = useState<string>("all");
  const { data: events, loading } = useEvents();
  const universityEvents = (events ?? []).filter((e) => e.organizerType === "university");
  const filtered = filter === "all" ? universityEvents : universityEvents.filter((e) => e.type === filter);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الفعاليات", "Events")}
        subtitle={t("فعاليات الجامعة", "University events")}
        actions={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            {t("فعالية جديدة", "New Event")}
          </Button>
        }
      >
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>{t("الكل", "All")}</Button>
          <Button variant={filter === "career_day" ? "primary" : "outline"} size="sm" onClick={() => setFilter("career_day")}>{t("توظيف", "Recruitment")}</Button>
          <Button variant={filter === "workshop" ? "primary" : "outline"} size="sm" onClick={() => setFilter("workshop")}>{t("ورش", "Workshops")}</Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : (
          <PanelCard title={t(`${filtered.length} فعاليات`, `${filtered.length} events`)}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t("لا فعاليات", "No Events")}
                description={t("أنشئ فعالية جديدة لتظهر في هذه القائمة.", "Create a new event to display it in this list.")}
                action={<Button size="sm"><Plus className="w-4 h-4" /> {t("فعالية جديدة", "New Event")}</Button>}
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((event) => (
                  <div key={event.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-1">
                          <span className="nq-chip">{eventTypeLabels[event.type] ?? event.type}</span>
                          <span className={event.status === "published" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                            {event.status === "published" ? t("منشور", "Published") : t("مسودة", "Draft")}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-text">{event.title}</p>
                        <p className="text-sm text-text-secondary mt-1">{event.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-secondary">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDateTime(event.startAt)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.location}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4" />{t(`${event.registrationsCount} مسجل`, `${event.registrationsCount} registered`)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm">{t("تعديل", "Edit")}</Button>
                        <Button size="sm">{t("المسجلون", "Registrants")}</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
