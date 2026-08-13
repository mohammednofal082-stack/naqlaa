"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

type Q = { prompt: string; answer: string; options?: string[] };

export default function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState<Q[]>([{ prompt: "", answer: "" }]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetch(`/api/data/quizzes?id=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((json) => {
        const quiz = json.data;
        if (!quiz) return;
        setTitle(String(quiz.title ?? ""));
        setPassScore(Number(quiz.pass_score ?? 70));
        const qs = Array.isArray(quiz.questions) ? quiz.questions : [];
        setQuestions(qs.length ? qs : [{ prompt: "", answer: "" }]);
      });
  }, [quizId]);

  const save = async () => {
    setMsg("");
    try {
      const res = await fetch("/api/data/quizzes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quizId, title, passScore, questions: questions.filter((q) => q.prompt.trim()) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setMsg(t("تم الحفظ", "Saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        title={t("تعديل الاختبار", "Edit quiz")}
        actions={
          <div className="flex gap-2">
            <Link href={`/dashboard/trainer/quizzes/${quizId}/results`}><Button size="sm" variant="outline">{t("النتائج", "Results")}</Button></Link>
            <Link href="/dashboard/trainer/quizzes"><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>
          </div>
        }
      >
        {msg && <p className="text-sm mb-3">{msg}</p>}
        <PanelCard title={t("الأسئلة", "Questions")}>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("العنوان", "Title")} />
            <Input type="number" value={passScore} onChange={(e) => setPassScore(Number(e.target.value) || 70)} />
          </div>
          {questions.map((q, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2 mb-3">
              <Input value={q.prompt} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, prompt: e.target.value } : r))} placeholder={t("سؤال", "Question")} />
              <Input value={q.answer} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, answer: e.target.value } : r))} placeholder={t("الإجابة", "Answer")} />
              <Input className="sm:col-span-2" value={(q.options ?? []).join(", ")} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : r))} placeholder={t("خيارات مفصولة بفاصلة (اختياري)", "Comma-separated options (optional)")} />
            </div>
          ))}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setQuestions((rows) => [...rows, { prompt: "", answer: "" }])}>{t("سؤال جديد", "New question")}</Button>
            <Button size="sm" onClick={() => void save()}>{t("حفظ", "Save")}</Button>
          </div>
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
