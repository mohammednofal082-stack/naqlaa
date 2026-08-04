"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAllApplications, updateApplicationStatus } from "@/hooks/data";
import { Calendar, Clock, Plus, Star, Video } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

export default function HRInterviewsPage() {
  const { t } = useI18n();
  const [view, setView] = useState<"calendar" | "list">("list");
  const { data: applications, loading, refetch } = useAllApplications();
  const apps = applications ?? [];
  const interviews = apps.filter((a) => a.interviewDate || a.status === "interview_scheduled");
  const candidates = apps.filter((a) =>
    ["applied", "under_review", "shortlisted"].includes(a.status)
  );

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [evalId, setEvalId] = useState<string | null>(null);
  const [score, setScore] = useState("7");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [recommendation, setRecommendation] = useState("hire");
  const [notes, setNotes] = useState("");

  const schedule = async () => {
    if (!selectedId) return;
    setBusy(true);
    setMsg("");
    try {
      await updateApplicationStatus(
        selectedId,
        "interview_scheduled",
        when ? new Date(when).toISOString() : undefined,
      );
      setOpen(false);
      setSelectedId("");
      setWhen("");
      await refetch();
      setMsg(t("تمت جدولة المقابلة", "Interview scheduled"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الجدولة", "Schedule failed"));
    } finally {
      setBusy(false);
    }
  };

  const saveEval = async () => {
    if (!evalId) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/data/interview-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: evalId,
          score: Number(score),
          strengths,
          weaknesses,
          recommendation,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setEvalId(null);
      setMsg(t("تم حفظ تقييم المقابلة", "Interview evaluation saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الموارد البشرية", "HR Dashboard")}
        title={t("جدولة المقابلات", "Interview Scheduling")}
        subtitle={t(`${interviews.length} مقابلة`, `${interviews.length} interviews`)}
        actions={
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            <Plus className="w-4 h-4" />
            {t("جدولة جديدة", "New Schedule")}
          </Button>
        }
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}

        {open && (
          <PanelCard title={t("جدولة مقابلة", "Schedule interview")} className="mb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-text text-sm"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">{t("اختر مرشحاً", "Select candidate")}</option>
                {candidates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.student?.firstName} {a.student?.lastName} — {a.job?.title}
                  </option>
                ))}
              </select>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {t(
                "المقابلات تُجدول خارج المنصة (بريد/رابط خارجي) — لا مقابلات فيديو داخلية.",
                "Interviews are scheduled off-platform (email/external link) — no in-app video."
              )}
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" disabled={busy || !selectedId} onClick={() => void schedule()}>
                {t("تأكيد", "Confirm")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        {evalId && (
          <PanelCard title={t("تقييم المقابلة", "Interview evaluation")} className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                max={10}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder={t("الدرجة /10", "Score /10")}
              />
              <select
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-text text-sm"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
              >
                <option value="hire">{t("توظيف", "Hire")}</option>
                <option value="maybe">{t("ربما", "Maybe")}</option>
                <option value="reject">{t("رفض", "Reject")}</option>
              </select>
              <Textarea
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder={t("نقاط القوة", "Strengths")}
              />
              <Textarea
                rows={2}
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder={t("نقاط الضعف", "Weaknesses")}
              />
              <Textarea
                rows={2}
                className="sm:col-span-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("ملاحظات", "Notes")}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" disabled={busy} onClick={() => void saveEval()}>
                {t("حفظ التقييم", "Save evaluation")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEvalId(null)}>
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <div className="flex gap-2 mb-6">
          <Button variant={view === "list" ? "primary" : "outline"} size="sm" onClick={() => setView("list")}>
            {t("قائمة", "List")}
          </Button>
          <Button
            variant={view === "calendar" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            {t("تقويم", "Calendar")}
          </Button>
        </div>

        {view === "calendar" ? (
          <PanelCard title={t("تقويم المقابلات", "Interview Calendar")}>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {[
                t("أحد", "Sun"),
                t("إثن", "Mon"),
                t("ثلا", "Tue"),
                t("أرب", "Wed"),
                t("خم", "Thu"),
                t("جم", "Fri"),
                t("سب", "Sat"),
              ].map((day) => (
                <div key={day} className="p-2 font-medium text-text-secondary">
                  {day}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => {
                const dayInterviews = interviews.filter((iv) => {
                  if (!iv.interviewDate) return false;
                  return new Date(iv.interviewDate).getDate() === i + 1;
                });
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border border-border min-h-[80px]",
                      dayInterviews.length ? "bg-brand-muted border-brand/30" : "bg-surface-hover/40"
                    )}
                  >
                    <span className="text-sm text-text-secondary">{i + 1}</span>
                    {dayInterviews[0] && (
                      <p className="text-xs mt-1 text-brand truncate">{dayInterviews[0].student?.firstName}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </PanelCard>
        ) : (
          <PanelCard title={t("المقابلات المجدولة", "Scheduled Interviews")}>
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="nq-skeleton h-28" />
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={t("لا مقابلات مجدولة", "No Scheduled Interviews")}
                description={t(
                  "ابدأ بجدولة مقابلة جديدة مع أحد المرشحين.",
                  "Start by scheduling a new interview with a candidate."
                )}
                action={
                  <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4" /> {t("جدولة جديدة", "New Schedule")}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {interviews.map((item) => (
                  <div key={item.id} className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40">
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-sm font-bold text-brand">
                          {item.student?.firstName?.[0]}
                        </div>
                      }
                      title={`${item.student?.firstName} ${item.student?.lastName}`}
                      subtitle={item.job?.title}
                      badge={<span className="nq-chip">{applicationStatusLabel(item.status, t)}</span>}
                    />
                    <div className="flex items-center gap-4 mt-3 mr-12 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.interviewDate ? formatDateTime(item.interviewDate) : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t("60 دقيقة", "60 minutes")}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Button
                        size="sm"
                        onClick={() => {
                          window.location.href = `mailto:${item.student?.email ?? ""}?subject=${encodeURIComponent(
                            t("مقابلة نقلة", "Naqla Interview")
                          )}`;
                        }}
                      >
                        <Video className="w-4 h-4" />
                        {t("دعوة بريد", "Email invite")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEvalId(item.id);
                          setScore("7");
                          setStrengths("");
                          setWeaknesses("");
                          setNotes("");
                          setRecommendation("hire");
                        }}
                      >
                        <Star className="w-4 h-4" />
                        {t("تقييم", "Evaluate")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOpen(true);
                          setSelectedId(item.id);
                          setWhen(item.interviewDate ? item.interviewDate.slice(0, 16) : "");
                        }}
                      >
                        {t("تعديل", "Edit")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/hr/pipeline" className="inline-block mt-4 text-sm text-brand hover:underline">
              {t("فتح قمع التوظيف", "Open recruitment funnel")}
            </Link>
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
