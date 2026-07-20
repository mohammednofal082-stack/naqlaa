"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerQuizzesPage() {
  const { t } = useI18n();
  const quizzes = [
    { id: "q1", title: t("اختبار React الأساسيات", "React Fundamentals Quiz"), questions: 15, pass: "70%", course: "React.js" },
    { id: "q2", title: t("اختبار JavaScript ES6", "JavaScript ES6 Quiz"), questions: 20, pass: "75%", course: "Node.js" },
    { id: "q3", title: t("تقييم UI Principles", "UI Principles Assessment"), questions: 10, pass: "60%", course: "UI/UX" },
  ];
  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("بناء الاختبارات", "Quiz Builder")}
        subtitle={t("MCQ، صح/خطأ، وأسئلة قصيرة", "MCQ, true/false, and short-answer questions")}
        actions={<Button size="sm"><Plus className="w-4 h-4" /> {t("اختبار جديد", "New Quiz")}</Button>}
      >
        <PanelCard title={t("الاختبارات المنشورة", "Published Quizzes")}>
          {quizzes.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={t("لا اختبارات", "No Quizzes")}
              description={t("أنشئ اختباراً جديداً لطلابك.", "Create a new quiz for your students.")}
              action={<Button size="sm"><Plus className="w-4 h-4" /> {t("اختبار جديد", "New Quiz")}</Button>}
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
                      <p className="text-sm text-text-muted">{q.course} · {t(`${q.questions} سؤال`, `${q.questions} questions`)} · {t("نجاح", "Pass")} {q.pass}</p>
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
