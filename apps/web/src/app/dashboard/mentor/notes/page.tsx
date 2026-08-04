"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FileText, Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export default function MentorNotesPage() {
  const { t } = useI18n();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/mentor-notes");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setNotes(json.data ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحميل", "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addNote = async () => {
    if (!title.trim() || !body.trim()) return;
    try {
      const res = await fetch("/api/data/mentor-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setTitle("");
      setBody("");
      setShowForm(false);
      await load();
      setMsg(t("تم حفظ الملاحظة", "Note saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("ملاحظات الجلسات", "Session Notes")}
        subtitle={t("سجّل ملاحظاتك بعد كل جلسة", "Save notes after each session")}
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4" /> {t("ملاحظة جديدة", "New Note")}
          </Button>
        }
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {showForm && (
          <PanelCard title={t("ملاحظة جديدة", "New note")} className="mb-6">
            <Input className="mb-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("العنوان", "Title")} />
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("المحتوى", "Content")} />
            <Button className="mt-3" size="sm" onClick={() => void addNote()}>{t("حفظ", "Save")}</Button>
          </PanelCard>
        )}

        {loading ? (
          <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="nq-skeleton h-24" />)}</div>
        ) : notes.length === 0 ? (
          <EmptyState icon={FileText} title={t("لا ملاحظات", "No notes")} description={t("أضف أول ملاحظة بعد جلسة.", "Add your first note after a session.")} />
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <PanelCard key={n.id} title={n.title}>
                <p className="text-xs text-text-muted mb-2">{formatDate(n.createdAt)}</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {expanded === n.id ? n.body : `${n.body.slice(0, 120)}${n.body.length > 120 ? "…" : ""}`}
                </p>
                {n.body.length > 120 && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
                    {expanded === n.id ? t("طي", "Collapse") : t("عرض كامل", "View Full")}
                  </Button>
                )}
              </PanelCard>
            ))}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
