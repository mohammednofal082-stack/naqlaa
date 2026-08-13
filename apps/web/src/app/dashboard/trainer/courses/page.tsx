"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/data";
import Link from "next/link";
import { BookOpen, Plus, Star, Users, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

type Lesson = { id: string; title: string; content: string; durationMinutes: number; sortOrder: number };
type Module = {
  id: string;
  courseId: string;
  title: string;
  sortOrder: number;
  lessonsCount: number;
  lessons: Lesson[];
};

export default function TrainerCoursesPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const { data: courses, loading, refetch } = useCourses(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("برمجة");
  const filtered = (courses ?? []).filter((c) => filter === "all" || c.status === filter);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonModuleId, setLessonModuleId] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const loadModules = async (courseId: string) => {
    setModulesLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/data/course-modules?courseId=${encodeURIComponent(courseId)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setModules(json.data ?? []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التحميل", "Load failed"));
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    if (openCourseId) void loadModules(openCourseId);
  }, [openCourseId]);

  const toggleModules = (courseId: string) => {
    setOpenCourseId((prev) => (prev === courseId ? null : courseId));
    setModuleTitle("");
    setLessonTitle("");
    setLessonModuleId("");
  };

  const addModule = async () => {
    if (!openCourseId || !moduleTitle.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/data/course-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: openCourseId,
          title: moduleTitle.trim(),
          sortOrder: modules.length + 1,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setModuleTitle("");
      await loadModules(openCourseId);
      setMsg(t("تمت إضافة الوحدة", "Module added"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async () => {
    if (!openCourseId || !lessonModuleId || !lessonTitle.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      const mod = modules.find((m) => m.id === lessonModuleId);
      const res = await fetch("/api/data/course-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson",
          moduleId: lessonModuleId,
          title: lessonTitle.trim(),
          sortOrder: (mod?.lessons.length ?? 0) + 1,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setLessonTitle("");
      await loadModules(openCourseId);
      setMsg(t("تمت إضافة الدرس", "Lesson added"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("بناء الكورسات", "Course Builder")}
        subtitle={t("إدارة الوحدات والدروس ونشر الكورسات", "Manage modules, lessons, and publish courses")}
        actions={
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4" /> {t("كورس جديد", "New course")}
          </Button>
        }
      >
        {showCreate && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-surface space-y-3">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={t("عنوان الكورس", "Course title")} />
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={t("وصف مختصر", "Short description")} />
            <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder={t("التصنيف", "Category")} />
            <Button
              size="sm"
              disabled={saving || !newTitle.trim()}
              onClick={() => {
                void (async () => {
                  setSaving(true);
                  setMsg("");
                  try {
                    const res = await fetch("/api/data/courses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: newTitle.trim(), description: newDesc, category: newCategory, status: "draft" }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || "FAILED");
                    setShowCreate(false);
                    setNewTitle("");
                    setNewDesc("");
                    await refetch();
                    setMsg(t("تم إنشاء الكورس — افتح المحرر لإضافة المحتوى", "Course created — open the builder to add content"));
                  } catch (e) {
                    setMsg(e instanceof Error ? e.message : t("فشل الإنشاء", "Create failed"));
                  } finally {
                    setSaving(false);
                  }
                })();
              }}
            >
              {t("إنشاء", "Create")}
            </Button>
          </div>
        )}
        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilter("all")}>{t("الكل", "All")}</Button>
          <Button variant={filter === "published" ? "primary" : "outline"} size="sm" onClick={() => setFilter("published")}>{t("منشور", "Published")}</Button>
          <Button variant={filter === "draft" ? "primary" : "outline"} size="sm" onClick={() => setFilter("draft")}>{t("مسودة", "Draft")}</Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="nq-skeleton h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={t("لا كورسات", "No Courses")}
            description={t("أنشئ كورساً جديداً أو غيّر الفلتر.", "Create a new course or change the filter.")}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((course) => {
              const open = openCourseId === course.id;
              return (
                <Card key={course.id} className="nq-lift">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-muted border border-border flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        <p className="text-sm text-text-secondary mt-1">{course.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-secondary">
                          <span>{course.category}</span>
                          <span>{course.level}</span>
                          <span>{course.duration}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledCount}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber" />{course.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={course.status === "published" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                        {course.status === "published" ? t("منشور", "Published") : t("مسودة", "Draft")}
                      </span>
                      <Link href={`/dashboard/trainer/courses/${course.id}/builder`}>
                        <Button size="sm">{t("المحرر", "Builder")}</Button>
                      </Link>
                      <Button size="sm" variant="outline" onClick={() => toggleModules(course.id)}>
                        {t("الوحدات", "Modules")}
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {modulesLoading ? (
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("جاري التحميل...", "Loading...")}
                        </div>
                      ) : modules.length === 0 ? (
                        <p className="text-sm text-text-muted">{t("لا وحدات بعد — أضف الأولى أدناه.", "No modules yet — add the first below.")}</p>
                      ) : (
                        <div className="space-y-3">
                          {modules.map((m) => (
                            <div key={m.id} className="rounded-lg border border-border p-3">
                              <p className="font-medium text-text text-sm">
                                {m.sortOrder}. {m.title}{" "}
                                <span className="text-text-muted font-normal">({m.lessons.length} {t("دروس", "lessons")})</span>
                              </p>
                              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                                {m.lessons.map((l) => (
                                  <li key={l.id}>— {l.title} ({l.durationMinutes} {t("د", "min")})</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs text-text-muted">{t("وحدة جديدة", "New module")}</label>
                          <div className="flex gap-2">
                            <Input
                              value={moduleTitle}
                              onChange={(e) => setModuleTitle(e.target.value)}
                              placeholder={t("عنوان الوحدة", "Module title")}
                            />
                            <Button size="sm" onClick={() => void addModule()} disabled={saving || !moduleTitle.trim()}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-text-muted">{t("درس جديد", "New lesson")}</label>
                          <select
                            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-text text-sm"
                            value={lessonModuleId}
                            onChange={(e) => setLessonModuleId(e.target.value)}
                          >
                            <option value="">{t("اختر الوحدة", "Select module")}</option>
                            {modules.map((m) => (
                              <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <Input
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                              placeholder={t("عنوان الدرس", "Lesson title")}
                            />
                            <Button size="sm" onClick={() => void addLesson()} disabled={saving || !lessonTitle.trim() || !lessonModuleId}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {msg && <p className="text-sm text-text-secondary">{msg}</p>}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
