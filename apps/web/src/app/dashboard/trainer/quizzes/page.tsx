"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, X } from "lucide-react";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "naqlah-trainer-quizzes";

type QuizItem = {
  id: string;
  title: string;
  questions: number;
  pass: string;
  course: string;
};

const DEFAULT_QUIZZES: QuizItem[] = [
  { id: "q1", title: "React Fundamentals Quiz", questions: 15, pass: "70%", course: "React.js" },
  { id: "q2", title: "JavaScript ES6 Quiz", questions: 20, pass: "75%", course: "Node.js" },
  { id: "q3", title: "UI Principles Assessment", questions: 10, pass: "60%", course: "UI/UX" },
];

function loadQuizzes(): QuizItem[] {
  if (typeof window === "undefined") return DEFAULT_QUIZZES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuizItem[]) : DEFAULT_QUIZZES;
  } catch {
    return DEFAULT_QUIZZES;
  }
}

export default function TrainerQuizzesPage() {
  const { t } = useI18n();
  const [quizzes, setQuizzes] = useState<QuizItem[]>(DEFAULT_QUIZZES);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [questions, setQuestions] = useState(10);
  const [pass, setPass] = useState("70%");

  useEffect(() => {
    setQuizzes(loadQuizzes());
  }, []);

  const persist = (next: QuizItem[]) => {
    setQuizzes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openForm = () => {
    setTitle("");
    setCourse("");
    setQuestions(10);
    setPass("70%");
    setShowForm(true);
  };

  const addQuiz = () => {
    if (!title.trim()) return;
    const item: QuizItem = {
      id: `q-${Date.now()}`,
      title: title.trim(),
      questions: questions || 1,
      pass: pass.trim() || "70%",
      course: course.trim() || t("عام", "General"),
    };
    persist([item, ...quizzes]);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("بناء الاختبارات", "Quiz Builder")}
        subtitle={t("MCQ، صح/خطأ، وأسئلة قصيرة", "MCQ, true/false, and short-answer questions")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" /> {t("اختبار جديد", "New Quiz")}
          </Button>
        }
      >
        {showForm && (
          <PanelCard title={t("اختبار جديد", "New Quiz")} className="mb-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder={t("عنوان الاختبار", "Quiz title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                placeholder={t("الكورس", "Course")}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="number"
                min={1}
                placeholder={t("عدد الأسئلة", "Questions")}
                value={questions}
                onChange={(e) => setQuestions(Number(e.target.value) || 1)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                placeholder={t("نسبة النجاح", "Pass score")}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={addQuiz}>{t("إنشاء", "Create")}</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("الاختبارات المنشورة", "Published Quizzes")}>
          {quizzes.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={t("لا اختبارات", "No Quizzes")}
              description={t("أنشئ اختباراً جديداً لطلابك.", "Create a new quiz for your students.")}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("اختبار جديد", "New Quiz")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5 text-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{q.title}</p>
                      <p className="text-sm text-text-muted">
                        {q.course} · {t(`${q.questions} سؤال`, `${q.questions} questions`)} · {t("نجاح", "Pass")} {q.pass}
                      </p>
                    </div>
                  </div>
                  <span className="nq-chip nq-chip-emerald">{t("نشط", "Active")}</span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
