"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader, EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/data";
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n";
import { notFound } from "next/navigation";

type Lesson = { id: string; title: string; content?: string; videoUrl?: string };
type Module = { id: string; title: string; lessons?: Lesson[] };

export default function CourseLearnPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { t, isRTL } = useI18n();
  const { data: courses, loading } = useCourses();
  const course = (courses ?? []).find((c) => c.id === courseId);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    void fetch(`/api/data/course-modules?courseId=${encodeURIComponent(courseId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          setModules(json.data as Module[]);
          const first = (json.data as Module[])[0]?.lessons?.[0];
          if (first) setActiveLessonId(first.id);
        }
      })
      .catch(() => {});
    void fetch(`/api/data/quizzes?courseId=${encodeURIComponent(courseId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) setQuizzes(json.data as { id: string; title: string }[]);
      })
      .catch(() => {});
  }, [courseId]);

  if (!loading && !course) notFound();

  const title = course?.title ?? t("كورس", "Course");
  const allLessons = modules.flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, moduleTitle: m.title })));
  const active = allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0];
  const progress = allLessons.length
    ? Math.round((done.size / allLessons.length) * 100)
    : course?.progress ?? 0;

  const markDone = () => {
    if (!active) return;
    const next = new Set(done);
    next.add(active.id);
    setDone(next);
    const pct = allLessons.length ? Math.round((next.size / allLessons.length) * 100) : 0;
    void fetch("/api/data/course-enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, progress: pct }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.error) setMsg(t("تم حفظ التقدم", "Progress saved"));
        else setMsg(String(json.error));
      })
      .catch(() => setMsg(t("تعذّر حفظ التقدم", "Could not save progress")));
  };

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("التعلم", "Learning")}
        title={title}
        subtitle={t(`التقدم ${progress}%`, `Progress ${progress}%`)}
        actions={
          <Link href="/courses">
            <Button variant="outline" size="sm">
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {t("كل الكورسات", "All courses")}
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="nq-skeleton h-80 lg:col-span-1" />
          <div className="nq-skeleton h-80 lg:col-span-2" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <Card className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
            <CardTitle className="text-base">{t("المنهج", "Curriculum")}</CardTitle>
            {modules.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={t("لا دروس بعد", "No lessons yet")}
                description={t("سيضيف المدرب الوحدات قريباً.", "The trainer will add modules soon.")}
              />
            ) : (
              modules.map((m) => (
                <div key={m.id} className="space-y-1">
                  <p className="text-xs font-semibold text-text-muted">{m.title}</p>
                  {(m.lessons ?? []).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setActiveLessonId(l.id)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm border ${
                        active?.id === l.id
                          ? "border-brand bg-brand-muted text-brand"
                          : "border-border hover:bg-surface-hover"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {done.has(l.id) ? <CheckCircle className="w-3.5 h-3.5 text-emerald" /> : null}
                        {l.title}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </Card>

          <Card className="lg:col-span-2 p-5 space-y-4">
            {active ? (
              <>
                <h2 className="font-display font-bold text-xl text-text">{active.title}</h2>
                <p className="text-sm text-text-muted">{(active as { moduleTitle?: string }).moduleTitle}</p>
                {active.videoUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                    <iframe
                      src={active.videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={active.title}
                    />
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed min-h-[120px]">
                  {active.content ||
                    t(
                      "محتوى الدرس سيظهر هنا. أكمل الدرس لتحديث نسبة التقدم.",
                      "Lesson content will appear here. Complete the lesson to update progress."
                    )}
                </div>
                {quizzes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{t("اختبارات الكورس", "Course quizzes")}</p>
                    {quizzes.map((q) => (
                      <Link key={q.id} href={`/courses/${courseId}/quiz/${q.id}`}>
                        <Button size="sm" variant="outline">{q.title}</Button>
                      </Link>
                    ))}
                  </div>
                )}
                {msg && <p className="text-sm text-emerald-600">{msg}</p>}
                <Button onClick={() => void markDone()} disabled={done.has(active.id)}>
                  <CheckCircle className="w-4 h-4" />
                  {done.has(active.id) ? t("مكتمل", "Completed") : t("تعليم كمكتمل", "Mark complete")}
                </Button>
              </>
            ) : (
              <EmptyState icon={BookOpen} title={t("اختر درساً", "Select a lesson")} description="" />
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
