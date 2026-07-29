"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Plus, X } from "lucide-react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-mentor-notes";

type NoteItem = {
  id: string;
  student: string;
  session: string;
  date: string;
  preview: string;
  full: string;
};

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: "n1",
    student: "Ameer Abu Shams",
    session: "CV Review",
    date: "2025-06-22",
    preview: "Needs to improve the projects section and add metrics...",
    full: "Needs to improve the projects section and add metrics. Ask for quantified impact (users, performance, revenue). Also tighten the summary to 3 lines.",
  },
  {
    id: "n2",
    student: "Layla Ahmed",
    session: "Career Path",
    date: "2025-06-20",
    preview: "Focus on Frontend first, then transition to Full Stack...",
    full: "Focus on Frontend first, then transition to Full Stack. Recommended path: React → TypeScript → Node basics → portfolio project.",
  },
  {
    id: "n3",
    student: "Mohamed Omar",
    session: "Mock Interview",
    date: "2025-06-18",
    preview: "Good communication skills; needs more preparation for technical questions...",
    full: "Good communication skills; needs more preparation for technical questions. Practice system design light + common JS/React interview prompts twice a week.",
  },
];

function loadNotes(): NoteItem[] {
  if (typeof window === "undefined") return DEFAULT_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NoteItem[]) : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

export default function MentorNotesPage() {
  const { t } = useI18n();
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [student, setStudent] = useState("");
  const [session, setSession] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const persist = (next: NoteItem[]) => {
    setNotes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openForm = () => {
    setStudent("");
    setSession("");
    setBody("");
    setShowForm(true);
  };

  const addNote = () => {
    if (!student.trim() || !body.trim()) return;
    const full = body.trim();
    const item: NoteItem = {
      id: `n-${Date.now()}`,
      student: student.trim(),
      session: session.trim() || t("جلسة عامة", "General session"),
      date: new Date().toISOString().slice(0, 10),
      preview: full.length > 80 ? `${full.slice(0, 80)}...` : full,
      full,
    };
    persist([item, ...notes]);
    setShowForm(false);
    setExpandedId(item.id);
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("ملاحظات الجلسات", "Session Notes")}
        subtitle={t("ملاحظات وخطوات عمل لكل متدرب", "Notes and action items for each mentee")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" /> {t("ملاحظة جديدة", "New Note")}
          </Button>
        }
      >
        {showForm && (
          <PanelCard title={t("ملاحظة جديدة", "New Note")} className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder={t("اسم المتدرب", "Student name")}
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                placeholder={t("موضوع الجلسة", "Session topic")}
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <textarea
              rows={4}
              placeholder={t("نص الملاحظة", "Note content")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={addNote}>{t("حفظ", "Save")}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("الملاحظات المحفوظة", "Saved Notes")}>
          {notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("لا ملاحظات", "No Notes")}
              description={t("أضف ملاحظات بعد كل جلسة إرشادية.", "Add notes after each mentorship session.")}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("ملاحظة جديدة", "New Note")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="nq-lift p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="font-semibold text-text">
                      {n.student} — {n.session}
                    </p>
                    <span className="nq-chip shrink-0">{n.date}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {expandedId === n.id ? n.full || n.preview : n.preview}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                  >
                    <FileText className="w-4 h-4" />{" "}
                    {expandedId === n.id ? t("إخفاء", "Hide") : t("عرض كامل", "View Full")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
