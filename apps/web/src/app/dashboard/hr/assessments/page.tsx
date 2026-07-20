"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAssessments, useJobs } from "@/hooks/data";
import { CheckSquare, Clock, Code, FileQuestion } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mcq: FileQuestion,
  coding: Code,
};

export default function HRAssessmentsPage() {
  const { t } = useI18n();
  const { data: assessments, loading } = useAssessments();
  const { data: jobs } = useJobs();
  const items = assessments ?? [];

  const typeLabels: Record<string, string> = {
    mcq: t("اختيار من متعدد", "Multiple Choice"),
    coding: t("مهمة برمجية", "Coding Task"),
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("الاختبارات", "Assessments")}
        subtitle={t("اختبارات تقييم المرشحين", "Candidate evaluation assessments")}
      >
        <PanelCard title={t("الاختبارات النشطة", "Active Assessments")}>
          {loading ? (
            <div className="grid lg:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-32" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={t("لا اختبارات بعد", "No Assessments Yet")}
              description={t("أنشئ اختباراً جديداً لتقييم المرشحين على وظائفك.", "Create a new assessment to evaluate candidates for your jobs.")}
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {items.map((assessment) => {
                const job = jobs?.find((j) => j.id === assessment.jobId);
                const Icon = typeIcons[assessment.type] ?? CheckSquare;

                return (
                  <div key={assessment.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Icon className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={assessment.title}
                      subtitle={`${job?.title} · ${typeLabels[assessment.type]}`}
                      badge={
                        <span className={assessment.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                          {assessment.status === "active" ? t("نشط", "Active") : t("منتهي", "Ended")}
                        </span>
                      }
                    />
                    <p className="text-xs text-text-muted mt-2 mr-12 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t("موعد نهائي", "Deadline")} {formatDate(assessment.deadline)}
                    </p>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Button size="sm">{t("عرض النتائج", "View Results")}</Button>
                      <Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard title={t("إنشاء اختبار جديد", "Create New Assessment")} className="mt-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-auto py-4">
              <FileQuestion className="w-5 h-5" />
              <div className="text-right">
                <p className="font-medium">{t("اختبار MCQ", "MCQ Assessment")}</p>
                <p className="text-xs text-text-secondary">{t("أسئلة اختيار من متعدد", "Multiple choice questions")}</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Code className="w-5 h-5" />
              <div className="text-right">
                <p className="font-medium">{t("مهمة برمجية", "Coding Task")}</p>
                <p className="text-xs text-text-secondary">{t("تحدي كود عملي", "Practical coding challenge")}</p>
              </div>
            </Button>
          </div>
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
