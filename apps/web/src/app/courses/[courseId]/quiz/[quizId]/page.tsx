"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

type Q = { prompt: string; options?: string[] };

export default function TakeQuizPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetch(`/api/data/quizzes?id=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((json) => {
        const quiz = json.data;
        if (!quiz) return;
        setTitle(String(quiz.title ?? ""));
        const qs = Array.isArray(quiz.questions) ? quiz.questions : [];
        setQuestions(qs.map((q: Q) => ({ prompt: q.prompt, options: q.options })));
        setAnswers(qs.map(() => ""));
      });
  }, [quizId]);

  const submit = async () => {
    setMsg("");
    try {
      const res = await fetch("/api/data/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", quizId, answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setResult({ score: Number(json.data.score), passed: Boolean(json.data.passed) });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الإرسال", "Submit failed"));
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("اختبار", "Quiz")}
        title={title || t("اختبار الكورس", "Course quiz")}
        actions={<Link href={`/courses/${courseId}/learn`}><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>}
      />
      <Card className="max-w-2xl space-y-4 mt-4">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="font-medium text-text">{i + 1}. {q.prompt}</p>
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
        {result ? (
          <p className="text-lg font-bold">{t("النتيجة", "Score")} {result.score}% — {result.passed ? t("ناجح", "Passed") : t("راسب", "Failed")}</p>
        ) : (
          <Button onClick={() => void submit()}>{t("إرسال", "Submit")}</Button>
        )}
        {msg && <p className="text-sm text-red-500">{msg}</p>}
      </Card>
    </DashboardLayout>
  );
}
