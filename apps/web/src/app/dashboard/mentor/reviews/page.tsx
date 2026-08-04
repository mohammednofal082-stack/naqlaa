"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FileText, MessageSquare, Plus } from "lucide-react";
import { useI18n } from "@/i18n";

type Note = {
  id: string;
  title: string;
  body: string;
  menteeId: string | null;
  createdAt: string;
};

export default function MentorReviewsPage() {
  const { t } = useI18n();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/mentor-notes");
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) setNotes(json.data as Note[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/data/mentor-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setShowForm(false);
      setTitle("");
      setBody("");
      setMsg(t("تم حفظ المراجعة", "Review saved"));
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المرشد", "Mentor Panel")}
        title={t("مراجعة الملفات", "Document Reviews")}
        subtitle={t("مراجعات محفوظة من ملاحظات المرشد", "Reviews saved from mentor notes")}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/mentor/notes">
              <Button size="sm" variant="outline">
                {t("كل الملاحظات", "All notes")}
              </Button>
            </Link>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <Plus className="w-4 h-4" /> {t("مراجعة جديدة", "New review")}
            </Button>
          </div>
        }
      >
        {msg && <p className="mb-4 text-sm text-text-secondary">{msg}</p>}

        {showForm && (
          <PanelCard title={t("مراجعة جديدة", "New review")} className="mb-6">
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("عنوان المراجعة (CV / Portfolio / مقابلة)", "Review title (CV / Portfolio / Interview)")}
              />
              <Textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("محتوى المراجعة والملاحظات", "Review content and notes")}
              />
              <div className="flex gap-2">
                <Button size="sm" disabled={busy} onClick={() => void create()}>
                  {t("حفظ", "Save")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  {t("إلغاء", "Cancel")}
                </Button>
              </div>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("طلبات المراجعة", "Review Requests")}>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("لا طلبات مراجعة", "No Review Requests")}
              description={t(
                "أنشئ مراجعة جديدة أو أضف ملاحظات من صفحة الملاحظات.",
                "Create a new review or add notes from the notes page."
              )}
              action={
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4" /> {t("مراجعة جديدة", "New review")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {notes.map((r) => (
                <div key={r.id} className="nq-lift p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center font-bold text-purple">
                        {r.title[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{r.title}</p>
                        <p className="text-sm text-text-muted">{String(r.createdAt).slice(0, 10)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      <MessageSquare className="w-4 h-4" /> {t("عرض", "View")}
                    </Button>
                  </div>
                  {expandedId === r.id && (
                    <p className="mt-3 text-sm text-text-secondary leading-relaxed border-t border-border pt-3 whitespace-pre-wrap">
                      {r.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
