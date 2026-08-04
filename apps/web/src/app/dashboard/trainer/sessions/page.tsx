"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Users, X } from "lucide-react";
import { useI18n } from "@/i18n";

type SessionItem = {
  id: string;
  title: string;
  date: string;
  attendees: number;
  status: "scheduled" | "completed" | string;
  meetingUrl?: string;
};

export default function TrainerSessionsPage() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [attendees, setAttendees] = useState(10);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/data/trainer-sessions");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setSessions(Array.isArray(json.data) ? (json.data as SessionItem[]) : []);
    } catch (e) {
      setSessions([]);
      setError(e instanceof Error ? e.message : t("فشل التحميل", "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openForm = () => {
    setTitle("");
    setDate("");
    setAttendees(10);
    setMeetingUrl("");
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const addSession = async () => {
    if (!title.trim() || !date.trim()) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/data/trainer-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          attendees: attendees || 0,
          status: "scheduled",
          meetingUrl: meetingUrl.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      setShowForm(false);
      setMessage(t("تم حفظ الجلسة في قاعدة البيانات", "Session saved to database"));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("الجلسات المباشرة", "Live Sessions")}
        subtitle={t("جدولة وجدولة حضور الطلاب", "Schedule sessions and manage student attendance")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" /> {t("جلسة جديدة", "New Session")}
          </Button>
        }
      >
        {message && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {showForm && (
          <PanelCard title={t("جلسة جديدة", "New Session")} className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("عنوان الجلسة", "Session title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="number"
                min={0}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value) || 0)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="url"
                placeholder={t("رابط الاجتماع", "Meeting URL")}
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => void addSession()}>{t("إنشاء", "Create")}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("الجلسات", "Sessions")}>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={Mic}
              title={t("لا جلسات بعد", "No sessions yet")}
              description={t("أنشئ جلسة مباشرة جديدة.", "Create a new live session.")}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("جلسة جديدة", "New Session")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-text-muted mt-1">{s.date}</p>
                    {s.meetingUrl && (
                      <a
                        href={s.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand mt-1 inline-block hover:underline"
                      >
                        {t("رابط الاجتماع", "Meeting link")}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {s.attendees}
                    </span>
                    <span className={s.status === "completed" ? "nq-chip" : "nq-chip nq-chip-emerald"}>
                      {s.status === "completed" ? t("مكتملة", "Completed") : t("مجدولة", "Scheduled")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
