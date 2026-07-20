"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { evaluateInterviewClient, startInterviewClient } from "@/lib/ai/client-api";
import type { InterviewQuestion } from "@careerlink/shared";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, MicOff, Send, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

interface Feedback {
  score: number;
  feedback: string;
  tips: string[];
}

export default function InterviewPage() {
  const { t, isRTL } = useI18n();
  const [jobTitle, setJobTitle] = useState(t("مطور Frontend", "Frontend Developer"));
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [done, setDone] = useState(false);

  const question = questions[currentQ];

  const startSession = async (title?: string) => {
    setLoading(true);
    setDone(false);
    setCurrentQ(0);
    setScores([]);
    setFeedback(null);
    setAnswer("");
    try {
      const { questions: qs } = await startInterviewClient({ jobTitle: title || jobTitle, level: "mid" });
      setQuestions(qs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!question || !answer.trim()) return;
    setEvaluating(true);
    try {
      const result = await evaluateInterviewClient({
        question: question.question,
        answer,
        type: question.type,
        jobTitle,
      });
      setFeedback({ score: result.score, feedback: result.feedback, tips: result.tips });
      setScores((prev) => [...prev, result.score]);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer("");
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setDone(true);
    }
  };

  const overallScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader meta={t("الأدوات المهنية", "Career Tools")} title={t("محاكاة المقابلة", "Interview Simulation")} subtitle={t("جاري تحضير الأسئلة...", "Preparing questions...")} />
        <div className="nq-page-enter max-w-3xl mx-auto space-y-4">
          <div className="nq-skeleton h-20 rounded-xl" />
          <div className="nq-skeleton h-8 rounded-xl" />
          <div className="nq-skeleton h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("الأدوات المهنية", "Career Tools")}
        title={t("محاكاة المقابلة", "Interview Simulation")}
        subtitle={question ? `${jobTitle} — ${t("سؤال", "Question")} ${currentQ + 1}/${questions.length}` : jobTitle}
      />

      <div className="nq-page-enter max-w-3xl mx-auto">
        <Card className="mb-6">
          <label className="text-sm text-text-muted block mb-2">{t("المسمى الوظيفي للمحاكاة", "Job title for the simulation")}</label>
          <div className="flex gap-2">
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-surface border border-border"
            />
            <Button variant="outline" onClick={() => startSession(jobTitle)}>
              {t("جلسة جديدة", "New Session")}
            </Button>
          </div>
        </Card>

        {!done && question && (
          <>
            <div className="flex gap-2 mb-8">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= currentQ ? "bg-brand" : "bg-border"
                  }`}
                />
              ))}
            </div>

            <Card className="mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-muted flex items-center justify-center">
                  <Bot className="w-10 h-10 text-brand" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {t("مساعد المقابلة", "Interview Assistant")}
                    <span className="nq-chip ms-2 font-normal">
                      {question.type === "technical" ? t("تقني", "Technical") : question.type === "hr" ? t("موارد بشرية", "Human Resources") : t("سلوكي", "Behavioral")}
                    </span>
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-xl leading-relaxed mb-8">{question.question}</p>
                </motion.div>
              </AnimatePresence>

              {feedback ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-emerald/10 border border-emerald/30 space-y-3"
                >
                  <p className="font-medium text-emerald">{t("تقييم:", "Evaluation:")} {feedback.score}/100</p>
                  <p className="text-sm text-text-muted">{feedback.feedback}</p>
                  {feedback.tips.length > 0 && (
                    <ul className="text-xs text-text-muted list-disc list-inside">
                      {feedback.tips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                  <Button onClick={handleNext} className="mt-2">
                    {currentQ < questions.length - 1 ? t("السؤال التالي", "Next Question") : t("عرض النتيجة النهائية", "View Final Result")}
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={t("اكتب إجابتك هنا...", "Write your answer here...")}
                    className="w-full h-32 px-4 py-3 rounded-xl bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 resize-none"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isRecording ? "danger" : "outline"}
                      onClick={() => setIsRecording(!isRecording)}
                      type="button"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? t("إيقاف", "Stop") : t("تسجيل صوتي", "Voice Recording")}
                    </Button>
                    {isRecording && (
                      <div className="flex-1 flex items-center gap-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-brand rounded-full"
                            animate={{ height: [4, 20, 4] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={handleSubmit}
                      disabled={!answer.trim() || evaluating}
                      className="mr-auto"
                    >
                      {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {t("إرسال الإجابة", "Submit Answer")}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {done && (
          <div className="nq-gradient-panel p-8 text-center">
            <CardTitle className="mb-4">{t("انتهت المحاكاة!", "Simulation Complete!")}</CardTitle>
            <p className="text-4xl font-bold gradient-text mb-2 tabular-nums">{overallScore}/100</p>
            <p className="text-text-muted mb-6">
              {overallScore >= 80
                ? t("أداء ممتاز! استمر بالتدريب", "Excellent performance! Keep practicing")
                : t("جيد — راجع الملاحظات وحاول مجدداً", "Good — review the feedback and try again")}
            </p>
            <Button onClick={() => startSession(jobTitle)}>
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {t("إعادة المحاكاة", "Restart Simulation")}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
