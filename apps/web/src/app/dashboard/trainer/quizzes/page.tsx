"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/data";
import Link from "next/link";
import { CheckSquare, Plus } from "lucide-react";
import { useI18n } from "@/i18n";

type QuizRow = {
  id: string;
  title: string;
  course_id: string;
  pass_score: number;
  questions: unknown[];
};

export default function TrainerQuizzesPage() {
  const { t } = useI18n();
  const { data: courses } = useCourses(true);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState([{ prompt: "", answer: "", options: "" }]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/quizzes");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setQuizzes(json.data ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحميل", "Load failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createQuiz = async () => {
    if (!title.trim() || !courseId) return;
    setMsg("");
    try {
      const res = await fetch("/api/data/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: title.trim(),
          passScore,
          questions: questions
            .filter((q) => q.prompt.trim())
            .map((q) => ({
              prompt: q.prompt.trim(),
              answer: q.answer.trim(),
              options: q.options.split(",").map((s) => s.trim()).filter(Boolean),
            })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setShowForm(false);
      setTitle("");
      setQuestions([{ prompt: "", answer: "", options: "" }]);
      await load();
      setMsg(t("تم إنشاء الاختبار في قاعدة البيانات", "Quiz created in database"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الإنشاء", "Create failed"));
    }
  };

  const courseTitle = (id: string) => courses?.find((c) => c.id === id)?.title ?? id;

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("الاختبارات", "Quizzes")}
        subtitle={t("إنشاء وتصحيح اختبارات الكورسات", "Create and grade course quizzes")}
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4" /> {t("اختبار جديد", "New Quiz")}
          </Button>
        }
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {showForm && (
          <PanelCard title={t("إنشاء اختبار", "Create quiz")} className="mb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("عنوان الاختبار", "Quiz title")} />
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-sm"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">{t("اختر كورس", "Select course")}</option>
                {(courses ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <Input type="number" value={passScore} onChange={(e) => setPassScore(Number(e.target.value) || 70)} placeholder="Pass %" />
            </div>
            {questions.map((q, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-2 mt-3">
                <Input value={q.prompt} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, prompt: e.target.value } : r))} placeholder={t("سؤال", "Question")} />
                <Input value={q.answer} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, answer: e.target.value } : r))} placeholder={t("الإجابة الصحيحة", "Correct answer")} />
                <Input className="sm:col-span-2" value={q.options} onChange={(e) => setQuestions((rows) => rows.map((r, idx) => idx === i ? { ...r, options: e.target.value } : r))} placeholder={t("خيارات مفصولة بفاصلة", "Comma-separated options")} />
              </div>
            ))}
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setQuestions((rows) => [...rows, { prompt: "", answer: "", options: "" }])}>
              {t("سؤال إضافي", "Add question")}
            </Button>
            <div className="mt-3">
              <Button className="mt-3" size="sm" onClick={() => void createQuiz()} disabled={!title.trim() || !courseId}>
                {t("حفظ", "Save")}
              </Button>
            </div>
          </PanelCard>
        )}

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="nq-skeleton h-20" />)}</div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={t("لا اختبارات", "No quizzes")}
            description={t("أنشئ اختباراً جديداً أو نفّذ migration 009.", "Create a quiz or run migration 009.")}
          />
        ) : (
          <PanelCard title={t(`${quizzes.length} اختبار`, `${quizzes.length} quiz(zes)`)}>
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-semibold text-text">{q.title}</p>
                    <p className="text-sm text-text-muted">
                      {courseTitle(q.course_id)} · {(q.questions as unknown[])?.length ?? 0} {t("أسئلة", "questions")} · {t("نجاح", "pass")} {q.pass_score}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/trainer/quizzes/${q.id}`}><Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button></Link>
                    <Link href={`/dashboard/trainer/quizzes/${q.id}/results`}><Button size="sm">{t("نتائج", "Results")}</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
