"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Users, X } from "lucide-react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-trainer-sessions";

type SessionItem = {
  id: string;
  title: string;
  date: string;
  attendees: number;
  status: "scheduled" | "completed";
};

const DEFAULT_SESSIONS: SessionItem[] = [
  { id: "s1", title: "React Projects Review", date: "2025-06-25 14:00", attendees: 12, status: "scheduled" },
  { id: "s2", title: "Q&A — Node.js APIs", date: "2025-06-27 16:00", attendees: 8, status: "scheduled" },
  { id: "s3", title: "Portfolio Review Workshop", date: "2025-06-20 11:00", attendees: 15, status: "completed" },
];

function loadSessions(): SessionItem[] {
  if (typeof window === "undefined") return DEFAULT_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionItem[]) : DEFAULT_SESSIONS;
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export default function TrainerSessionsPage() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<SessionItem[]>(DEFAULT_SESSIONS);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [attendees, setAttendees] = useState(10);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const persist = (next: SessionItem[]) => {
    setSessions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openForm = () => {
    setTitle("");
    setDate("");
    setAttendees(10);
    setShowForm(true);
  };

  const addSession = () => {
    if (!title.trim() || !date.trim()) return;
    const item: SessionItem = {
      id: `s-${Date.now()}`,
      title: title.trim(),
      date: date.trim(),
      attendees: attendees || 0,
      status: "scheduled",
    };
    persist([item, ...sessions]);
    setShowForm(false);
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
        {showForm && (
          <PanelCard title={t("جلسة جديدة", "New Session")} className="mb-6">
            <div className="grid sm:grid-cols-3 gap-3">
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
                placeholder={t("عدد الحضور المتوقع", "Expected attendees")}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value) || 0)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={addSession}>{t("إضافة", "Add")}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("الجلسات", "Sessions")}>
          {sessions.length === 0 ? (
            <EmptyState
              icon={Mic}
              title={t("لا جلسات", "No Sessions")}
              description={t("أنشئ جلسة مباشرة أولى لطلابك.", "Create your first live session for your students.")}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("جلسة جديدة", "New Session")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-cyan" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{s.title}</p>
                      <p className="text-sm text-text-muted">{s.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {s.attendees}
                    </span>
                    <span className={s.status === "completed" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
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
