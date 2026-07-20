"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { generateCareerPathClient } from "@/lib/ai/client-api";
import type { CareerRoadmap, CareerRoadmapStep } from "@careerlink/shared";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, BookOpen, Loader2, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const statusIcons = {
  completed: CheckCircle,
  "in-progress": Clock,
  upcoming: Circle,
};

const statusColors = {
  completed: "text-emerald",
  "in-progress": "text-blue",
  upcoming: "text-text-muted",
};

export default function CareerPathPage() {
  const { t } = useI18n();
  const GOALS = [
    "Full Stack Developer",
    "Frontend Developer",
    "DevOps Engineer",
    "Data Scientist",
    t("مطور تطبيقات جوال", "Mobile App Developer"),
  ];
  const [goal, setGoal] = useState(GOALS[0]);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRoadmap = async (selectedGoal: string) => {
    setLoading(true);
    setError("");
    try {
      const { roadmap: result } = await generateCareerPathClient({ goal: selectedGoal });
      setRoadmap(result);
      setGoal(result.goal);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل إنشاء المسار", "Failed to generate the path"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap(goal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("الأدوات المهنية", "Career Tools")}
        title={t("خارطة المسار المهني", "Career Path")}
        subtitle={
          roadmap
            ? `${t("الهدف:", "Goal:")} ${roadmap.goal}`
            : t("خطط تعلم مخصصة حسب هدفك المهني", "Personalized learning plans based on your career goal")
        }
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="nq-page-enter grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading && !roadmap ? (
            <div className="space-y-4">
              <div className="nq-skeleton h-28 rounded-xl" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : roadmap ? (
            <>
              <div className="nq-gradient-panel p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle>{t("التقدم الكلي", "Overall Progress")}</CardTitle>
                    <p className="text-text-muted text-sm">{t("المدة المتوقعة:", "Estimated duration:")} {roadmap.estimatedDuration}</p>
                  </div>
                  <span className="text-3xl font-bold gradient-text tabular-nums">{roadmap.progress}%</span>
                </div>
                <ProgressBar value={roadmap.progress} />
              </div>

              <div className="relative">
                <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {roadmap.steps.map((step: CareerRoadmapStep, i: number) => {
                    const Icon = statusIcons[step.status];
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                      >
                        <Card className={cn("nq-lift", step.status === "in-progress" && "border-brand/30")}>
                          <div className="flex gap-4">
                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                              step.status === "completed" ? "bg-emerald/20" :
                              step.status === "in-progress" ? "bg-brand-muted border border-brand/20" : "bg-cream border border-border"
                            }`}>
                              <Icon className={`w-6 h-6 ${statusColors[step.status]}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold">{step.title}</h3>
                                <span className={step.status === "completed" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                                  {step.status === "completed" ? t("مكتمل", "Completed") :
                                   step.status === "in-progress" ? t("قيد التنفيذ", "In Progress") : t("قادم", "Upcoming")}
                                </span>
                              </div>
                              <p className="text-text-muted text-sm mb-2">{step.description}</p>
                              <p className="text-xs text-text-muted mb-3">{step.duration}</p>
                              <div className="flex flex-wrap gap-2">
                                {step.resources.map((r) => (
                                  <span key={r} className="inline-flex items-center gap-1 text-xs text-brand">
                                    <BookOpen className="w-3 h-3" />
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">{t("أهداف مهنية", "Career Goals")}</CardTitle>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setGoal(g);
                    loadRoadmap(g);
                  }}
                  className={cn(
                    "nq-lift w-full text-right px-4 py-3 rounded-xl text-sm transition-all disabled:opacity-50 border",
                    g === goal
                      ? "bg-brand-muted text-brand border-brand/30 font-medium"
                      : "hover:bg-surface-hover text-text-muted border-border"
                  )}
                >
                  {loading && g === goal ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {g}
                    </span>
                  ) : g}
                </button>
              ))}
            </div>
          </Card>

          <div className="nq-gradient-panel p-5">
            <CardTitle className="mb-3 flex items-center gap-2 text-base">
              <Route className="w-4 h-4 text-brand" />
              {t("مسار مخصص", "Custom Path")}
            </CardTitle>
            <p className="text-sm text-text-muted mb-4">{t("اكتب هدفك بدقة وسنولّد خطة تعلم لك", "Describe your goal precisely and we will generate a learning plan for you")}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const custom = String(fd.get("customGoal") || "").trim();
                if (custom) loadRoadmap(custom);
              }}
              className="space-y-3"
            >
              <input
                name="customGoal"
                placeholder={t("مثال: مهندس سحابة AWS", "e.g. AWS Cloud Engineer")}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm"
              />
              <Button type="submit" className="w-full" size="sm" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("إنشاء المسار", "Generate Path")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
