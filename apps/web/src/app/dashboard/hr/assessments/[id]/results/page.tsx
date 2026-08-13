"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { formatDateTime } from "@/lib/utils";

type Sub = {
  id: string;
  studentName: string;
  studentEmail: string;
  content: string;
  score: number | null;
  feedback: string | null;
  createdAt: string;
};

export default function AssessmentResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [rows, setRows] = useState<Sub[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch(`/api/data/assessment-submissions?assessmentId=${encodeURIComponent(id)}`);
    const json = await res.json();
    if (Array.isArray(json.data)) setRows(json.data as Sub[]);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const grade = async (subId: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/data/assessment-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subId, score: Number(scores[subId] || 0), feedback: feedback[subId] || "" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      await load();
      setMsg(t("تم حفظ التقييم", "Grade saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        title={t("نتائج الاختبار", "Assessment results")}
        actions={<Link href="/dashboard/hr/assessments"><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>}
      >
        {msg && <p className="text-sm mb-3">{msg}</p>}
        <PanelCard title={t(`${rows.length} تسليم`, `${rows.length} submissions`)}>
          <div className="space-y-3">
            {rows.length === 0 && <p className="text-sm text-text-muted">{t("لا تسليمات بعد", "No submissions yet")}</p>}
            {rows.map((r) => (
              <div key={r.id} className="border border-border rounded-lg p-3 space-y-2">
                <p className="font-medium">{r.studentName || r.studentEmail}</p>
                <p className="text-xs text-text-muted">{formatDateTime(r.createdAt)}</p>
                <pre className="text-xs whitespace-pre-wrap bg-surface-hover p-2 rounded">{r.content}</pre>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input type="number" value={scores[r.id] ?? String(r.score ?? "")} onChange={(e) => setScores((s) => ({ ...s, [r.id]: e.target.value }))} placeholder={t("الدرجة", "Score")} />
                  <Textarea rows={2} value={feedback[r.id] ?? r.feedback ?? ""} onChange={(e) => setFeedback((s) => ({ ...s, [r.id]: e.target.value }))} placeholder={t("ملاحظات", "Feedback")} />
                </div>
                <Button size="sm" onClick={() => void grade(r.id)}>{t("حفظ التقييم", "Save grade")}</Button>
              </div>
            ))}
          </div>
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
