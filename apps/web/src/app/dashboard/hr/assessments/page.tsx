"use client";

import { useState } from "react";
import Link from "next/link";
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
  const { data: assessments, loading, refetch } = useAssessments();
  const { data: jobs } = useJobs();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const items = assessments ?? [];

  const typeLabels: Record<string, string> = {
    mcq: t("اختيار من متعدد", "Multiple Choice"),
    coding: t("مهمة برمجية", "Coding Task"),
  };

  const createAssessment = async (type: "mcq" | "coding") => {
    setMessage("");
    setError("");
    const jobId = jobs?.[0]?.id;
    if (!jobId) {
      setError(t("لا توجد وظيفة لإنشاء اختبار عليها", "No job available to create an assessment"));
      return;
    }
    const title =
      type === "mcq"
        ? t("اختبار MCQ جديد", "New MCQ Assessment")
        : t("مهمة برمجية جديدة", "New Coding Task");
    const deadline = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    try {
      const res = await fetch("/api/data/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, title, type, deadline, status: "active" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      const item = json.data as { id: string };
      await refetch();
      setExpandedId(item.id);
      setMessage(t("تم إنشاء الاختبار في قاعدة البيانات", "Assessment saved to database"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الإنشاء", "Create failed"));
    }
  };

  const saveEdit = async (id: string) => {
    const title = editTitle.trim();
    if (!title) return;
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/data/assessments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetch();
      setEditingId(null);
      setMessage(t("تم حفظ التعديل", "Edit saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("الاختبارات", "Assessments")}
        subtitle={t("اختبارات تقييم المرشحين", "Candidate evaluation assessments")}
      >
        {message && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

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
                const isExpanded = expandedId === assessment.id;
                const isEditing = editingId === assessment.id;

                return (
                  <div key={assessment.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Icon className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={assessment.title}
                      subtitle={`${job?.title ?? t("وظيفة عامة", "General job")} · ${typeLabels[assessment.type]}`}
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
                      <Link href={`/dashboard/hr/assessments/${assessment.id}/results`}>
                        <Button size="sm">{t("عرض النتائج", "View Results")}</Button>
                      </Link>
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button size="sm" variant="outline">{t("رابط المرشح", "Candidate link")}</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(isEditing ? null : assessment.id);
                          setEditTitle(assessment.title);
                          setExpandedId(assessment.id);
                        }}
                      >
                        {t("تعديل", "Edit")}
                      </Button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 mr-12 p-3 rounded-lg border border-border bg-surface text-sm space-y-2">
                        <p className="text-text-secondary">
                          {t("النوع:", "Type:")} {typeLabels[assessment.type]}
                        </p>
                        <p className="text-text-secondary">
                          {t("الحالة:", "Status:")} {assessment.status}
                        </p>
                        <p className="text-text-muted">
                          {t("لا نتائج مرشحين بعد — الاختبار جاهز للإرسال.", "No candidate results yet — assessment is ready to send.")}
                        </p>
                        {isEditing && (
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <Button size="sm" onClick={() => void saveEdit(assessment.id)}>{t("حفظ", "Save")}</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard title={t("إنشاء اختبار جديد", "Create New Assessment")} className="mt-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-auto py-4" onClick={() => void createAssessment("mcq")}>
              <FileQuestion className="w-5 h-5" />
              <div className="text-right">
                <p className="font-medium">{t("اختبار MCQ", "MCQ Assessment")}</p>
                <p className="text-xs text-text-secondary">{t("أسئلة اختيار من متعدد", "Multiple choice questions")}</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4" onClick={() => void createAssessment("coding")}>
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
