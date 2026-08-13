"use client";

import { use, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import type { Assessment } from "@careerlink/shared";

export default function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [item, setItem] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    void fetch(`/api/data/assessments?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        const a = json.data as Assessment | null;
        setItem(a);
        setAnswers((a?.questions ?? []).map(() => ""));
      });
  }, [id]);

  const submit = async () => {
    setMsg("");
    try {
      const payload = item?.questions?.length ? JSON.stringify(answers) : content;
      const res = await fetch("/api/data/assessment-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: id, content: payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setDone(true);
      setMsg(t("تم إرسال الإجابة", "Submission sent"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الإرسال", "Submit failed"));
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title={item?.title ?? t("اختبار", "Assessment")} subtitle={item?.description} />
      <Card className="max-w-2xl mt-4 space-y-4">
        {(item?.questions ?? []).map((q, i) => (
          <div key={i}>
            <p className="font-medium mb-2">{i + 1}. {q.prompt}</p>
            {q.options?.length ? (
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm" value={answers[i] ?? ""} onChange={(e) => setAnswers((prev) => prev.map((a, idx) => idx === i ? e.target.value : a))}>
                <option value="">{t("اختر", "Choose")}</option>
                {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <Input value={answers[i] ?? ""} onChange={(e) => setAnswers((prev) => prev.map((a, idx) => idx === i ? e.target.value : a))} />
            )}
          </div>
        ))}
        {(!item?.questions || item.questions.length === 0) && (
          <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("اكتب إجابتك", "Write your answer")} />
        )}
        {!done && <Button onClick={() => void submit()}>{t("إرسال", "Submit")}</Button>}
        {msg && <p className="text-sm">{msg}</p>}
      </Card>
    </DashboardLayout>
  );
}
