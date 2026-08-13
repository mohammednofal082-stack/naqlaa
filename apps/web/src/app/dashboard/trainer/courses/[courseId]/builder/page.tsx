"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { Loader2, Plus, Save } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  durationMinutes: number;
  sortOrder: number;
};
type Module = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
};

export default function CourseBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("draft");
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonDraft, setLessonDraft] = useState({ moduleId: "", title: "", content: "", videoUrl: "", durationMinutes: 10 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [cRes, mRes] = await Promise.all([
      fetch("/api/data/courses?mine=1"),
      fetch(`/api/data/course-modules?courseId=${encodeURIComponent(courseId)}`),
    ]);
    const cJson = await cRes.json();
    const course = Array.isArray(cJson.data) ? cJson.data.find((c: { id: string }) => c.id === courseId) : null;
    if (course) {
      setTitle(course.title ?? "");
      setDescription(course.description ?? "");
      setCategory(course.category ?? "");
      setLevel(course.level ?? "beginner");
      setDuration(course.duration ?? "");
      setStatus(course.status ?? "draft");
    }
    const mJson = await mRes.json();
    setModules(mJson.data ?? []);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const saveCourse = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/data/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: courseId,
          title,
          description,
          category,
          level,
          duration,
          status,
          modulesCount: modules.length,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setMsg(t("تم حفظ الكورس", "Course saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const addModule = async () => {
    if (!moduleTitle.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/data/course-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title: moduleTitle.trim(), sortOrder: modules.length + 1 }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "FAILED");
      setModuleTitle("");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const addLesson = async () => {
    if (!lessonDraft.moduleId || !lessonDraft.title.trim()) return;
    setBusy(true);
    try {
      const mod = modules.find((m) => m.id === lessonDraft.moduleId);
      const res = await fetch("/api/data/course-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson",
          moduleId: lessonDraft.moduleId,
          title: lessonDraft.title.trim(),
          content: lessonDraft.content,
          videoUrl: lessonDraft.videoUrl || null,
          durationMinutes: lessonDraft.durationMinutes,
          sortOrder: (mod?.lessons.length ?? 0) + 1,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "FAILED");
      setLessonDraft({ moduleId: lessonDraft.moduleId, title: "", content: "", videoUrl: "", durationMinutes: 10 });
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const saveLesson = async (lesson: Lesson) => {
    setBusy(true);
    try {
      const res = await fetch("/api/data/course-modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson",
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          durationMinutes: lesson.durationMinutes,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "FAILED");
      setMsg(t("تم حفظ الدرس", "Lesson saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("بناء الكورسات", "Course Builder")}
        title={title || t("محرر الكورس", "Course editor")}
        subtitle={t("وحدات، محتوى الدروس، فيديو، ونشر", "Modules, lesson content, video, and publish")}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/trainer/courses">
              <Button size="sm" variant="outline">{t("العودة", "Back")}</Button>
            </Link>
            <Button size="sm" disabled={busy} onClick={() => void saveCourse()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("حفظ / نشر", "Save / Publish")}
            </Button>
          </div>
        }
      >
        {msg && <p className="text-sm text-text-secondary mb-4">{msg}</p>}
        <PanelCard title={t("بيانات الكورس", "Course details")} className="mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("العنوان", "Title")} />
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("التصنيف", "Category")} />
            <select className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="beginner">{t("مبتدئ", "Beginner")}</option>
              <option value="intermediate">{t("متوسط", "Intermediate")}</option>
              <option value="advanced">{t("متقدم", "Advanced")}</option>
            </select>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={t("المدة", "Duration")} />
            <select className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">{t("مسودة", "Draft")}</option>
              <option value="published">{t("منشور", "Published")}</option>
            </select>
            <Textarea className="sm:col-span-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("الوصف", "Description")} />
          </div>
        </PanelCard>

        <PanelCard title={t("الوحدات والدروس", "Modules and lessons")}>
          <div className="space-y-4">
            {modules.map((m) => (
              <div key={m.id} className="rounded-lg border border-border p-4 space-y-3">
                <p className="font-semibold text-text">{m.sortOrder}. {m.title}</p>
                {m.lessons.map((l) => (
                  <div key={l.id} className="rounded-md border border-border p-3 space-y-2">
                    <Input
                      value={l.title}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((mod) =>
                            mod.id !== m.id
                              ? mod
                              : { ...mod, lessons: mod.lessons.map((x) => (x.id === l.id ? { ...x, title: e.target.value } : x)) }
                          )
                        )
                      }
                    />
                    <Textarea
                      rows={3}
                      value={l.content}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((mod) =>
                            mod.id !== m.id
                              ? mod
                              : { ...mod, lessons: mod.lessons.map((x) => (x.id === l.id ? { ...x, content: e.target.value } : x)) }
                          )
                        )
                      }
                      placeholder={t("محتوى الدرس", "Lesson content")}
                    />
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Input
                        value={l.videoUrl ?? ""}
                        onChange={(e) =>
                          setModules((prev) =>
                            prev.map((mod) =>
                              mod.id !== m.id
                                ? mod
                                : { ...mod, lessons: mod.lessons.map((x) => (x.id === l.id ? { ...x, videoUrl: e.target.value } : x)) }
                            )
                          )
                        }
                        placeholder={t("رابط فيديو (YouTube / Vimeo)", "Video URL (YouTube / Vimeo)")}
                      />
                      <Input
                        type="number"
                        value={l.durationMinutes}
                        onChange={(e) =>
                          setModules((prev) =>
                            prev.map((mod) =>
                              mod.id !== m.id
                                ? mod
                                : { ...mod, lessons: mod.lessons.map((x) => (x.id === l.id ? { ...x, durationMinutes: Number(e.target.value) || 10 } : x)) }
                            )
                          )
                        }
                      />
                    </div>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void saveLesson(l)}>
                      {t("حفظ الدرس", "Save lesson")}
                    </Button>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex gap-2">
              <Input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder={t("وحدة جديدة", "New module")} />
              <Button size="sm" disabled={busy || !moduleTitle.trim()} onClick={() => void addModule()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <select
                className="px-3 py-2.5 rounded-lg border border-border bg-surface text-sm"
                value={lessonDraft.moduleId}
                onChange={(e) => setLessonDraft((d) => ({ ...d, moduleId: e.target.value }))}
              >
                <option value="">{t("اختر الوحدة", "Select module")}</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <Input value={lessonDraft.title} onChange={(e) => setLessonDraft((d) => ({ ...d, title: e.target.value }))} placeholder={t("عنوان الدرس", "Lesson title")} />
              <Textarea className="sm:col-span-2" rows={2} value={lessonDraft.content} onChange={(e) => setLessonDraft((d) => ({ ...d, content: e.target.value }))} placeholder={t("محتوى", "Content")} />
              <Input value={lessonDraft.videoUrl} onChange={(e) => setLessonDraft((d) => ({ ...d, videoUrl: e.target.value }))} placeholder={t("رابط فيديو", "Video URL")} />
              <Button size="sm" disabled={busy || !lessonDraft.moduleId || !lessonDraft.title.trim()} onClick={() => void addLesson()}>
                {t("إضافة درس", "Add lesson")}
              </Button>
            </div>
          </div>
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
