"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/data";
import { Calendar, MapPin, Plus, Users, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { Event } from "@careerlink/shared";

export default function UniversityEventsPage() {
  const { t } = useI18n();
  const eventTypeLabels: Record<string, string> = {
    career_day: t("يوم توظيف", "Career Day"),
    hackathon: t("هاكاثون", "Hackathon"),
    workshop: t("ورشة", "Workshop"),
    webinar: t("ندوة", "Webinar"),
  };
  const [filter, setFilter] = useState<string>("all");
  const { data: events, loading, refetch } = useEvents();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [type, setType] = useState<Event["type"]>("workshop");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const universityEvents = (events ?? []).filter((e) => e.organizerType === "university");
  const filtered = filter === "all" ? universityEvents : universityEvents.filter((e) => e.type === filter);

  const openForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartAt("");
    setType("workshop");
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const createEvent = async () => {
    if (!title.trim() || !startAt) return;
    setSaving(true);
    setMessage("");
    setError("");
    const payload = {
      title: title.trim(),
      description: description.trim() || title.trim(),
      location: location.trim() || t("الحرم الجامعي", "Campus"),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(new Date(startAt).getTime() + 2 * 3600000).toISOString(),
      type,
      organizerType: "university" as const,
      organizerId: "university-1",
      status: "published" as const,
    };

    try {
      const res = await fetch("/api/data/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetch();
      setMessage(t("تم إنشاء الفعالية", "Event created"));
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الإنشاء", "Create failed"));
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/data/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: editTitle.trim(),
          location: editLocation.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetch();
      setExpandedId(null);
      setMessage(t("تم حفظ التعديل", "Edit saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={t("الفعاليات", "Events")}
        subtitle={t("فعاليات الجامعة", "University events")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" />
            {t("فعالية جديدة", "New Event")}
          </Button>
        }
      >
        {message && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {showForm && (
          <PanelCard title={t("فعالية جديدة", "New Event")} className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("العنوان", "Title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                placeholder={t("الموقع", "Location")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Event["type"])}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="workshop">{eventTypeLabels.workshop}</option>
                <option value="career_day">{eventTypeLabels.career_day}</option>
                <option value="hackathon">{eventTypeLabels.hackathon}</option>
                <option value="webinar">{eventTypeLabels.webinar}</option>
              </select>
              <textarea
                rows={2}
                placeholder={t("الوصف", "Description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="sm:col-span-2 px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => void createEvent()} disabled={saving}>
                {t("إنشاء", "Create")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>
            {t("الكل", "All")}
          </Button>
          <Button
            variant={filter === "career_day" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("career_day")}
          >
            {t("توظيف", "Recruitment")}
          </Button>
          <Button
            variant={filter === "workshop" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("workshop")}
          >
            {t("ورش", "Workshops")}
          </Button>
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
                action={
                  <Button size="sm" onClick={openForm}>
                    <Plus className="w-4 h-4" /> {t("فعالية جديدة", "New Event")}
                  </Button>
                }
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
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(event.startAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {t(`${event.registrationsCount} مسجل`, `${event.registrationsCount} registered`)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const open = expandedId === event.id;
                            setExpandedId(open ? null : event.id);
                            setEditTitle(event.title);
                            setEditLocation(event.location);
                          }}
                        >
                          {t("تعديل", "Edit")}
                        </Button>
                        <Link href={`/dashboard/university/events/${event.id}/registrants`}>
                          <Button size="sm">{t("المسجلون", "Registrants")}</Button>
                        </Link>
                      </div>
                    </div>
                    {expandedId === event.id && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <Button size="sm" onClick={() => void saveEdit(event.id)}>
                          {t("حفظ", "Save")}
                        </Button>
                      </div>
                    )}
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
