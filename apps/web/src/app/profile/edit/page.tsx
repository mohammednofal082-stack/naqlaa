"use client";

import { useEffect, useState } from "react";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile, updateProfile } from "@/hooks/data";
import { Save, Plus, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";

export default function ProfileEditPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: profileData, refetch } = useProfile();
  const profile = profileData?.profile;
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [careerGoal, setCareerGoal] = useState("frontend");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState<{ university: string; major: string; degree: string; startYear: number; endYear: number; gpa?: number }[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string; description: string; technologies: string[]; image: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!profile || hydrated) return;
    setHeadline(profile.headline ?? "");
    setAbout(profile.about ?? "");
    setLocation(profile.location ?? "");
    setSkills(profile.skills ?? []);
    setEducation(profile.education ?? []);
    setProjects(profile.projects?.length ? profile.projects : [{ id: `proj-${Date.now()}`, title: "", description: "", technologies: [], image: "" }]);
    setHydrated(true);
  }, [profile, hydrated]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const note = [portfolio.trim() && `Portfolio: ${portfolio.trim()}`, careerGoal && `Goal: ${careerGoal}`]
        .filter(Boolean)
        .join(" · ");
      await updateProfile({
        headline: headline.trim(),
        about: note ? `${about.trim()}${about.trim() ? "\n\n" : ""}${note}` : about.trim(),
        location: location.trim(),
        skills,
        education,
        projects: projects.filter((p) => p.title.trim()),
      });
      await refetch();
      router.push("/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل حفظ الملف", "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <Header title={t("بناء ملفك المهني", "Build Your Professional Profile")} subtitle={t("كل حقل تملأه يزيد فرص ظهورك للشركات", "Every field you complete increases your visibility to companies")} />
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="nq-skeleton h-64 rounded-xl" />
            <div className="nq-skeleton h-40 rounded-xl" />
          </div>
          <div className="nq-skeleton h-72 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header
        title={t("بناء ملفك المهني", "Build Your Professional Profile")}
        subtitle={t("كل حقل تملأه يزيد فرص ظهورك للشركات", "Every field you complete increases your visibility to companies")}
        actions={<Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4" /> {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ ومعاينة", "Save & Preview")}</Button>}
      />

      {error && (
        <p className="mt-4 text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      <div className="nq-page-enter grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardTitle className="font-display mb-4">{t("المعلومات الأساسية", "Basic Information")}</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-2 block">{t("العنوان المهني", "Professional Headline")}</label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={t("مثال: مطور Full Stack طموح", "e.g., Aspiring Full Stack Developer")} />
              </div>
              <div>
                <label className="text-sm text-text-muted mb-2 block">{t("نبذة عنك", "About You")}</label>
                <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t("احكِ قصتك المهنية باختصار...", "Briefly tell your professional story...")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-2 block">{t("الموقع", "Location")}</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-2 block">{t("رابط Portfolio", "Portfolio Link")}</label>
                  <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://github.com/..." />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("التعليم", "Education")}</CardTitle>
            {education.map((edu, idx) => (
              <div key={`${edu.university}-${idx}`} className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border last:border-0">
                <Input value={edu.university} onChange={(e) => setEducation((rows) => rows.map((r, i) => i === idx ? { ...r, university: e.target.value } : r))} placeholder={t("الجامعة", "University")} />
                <Input value={edu.major} onChange={(e) => setEducation((rows) => rows.map((r, i) => i === idx ? { ...r, major: e.target.value } : r))} placeholder={t("التخصص", "Major")} />
                <Input value={edu.degree} onChange={(e) => setEducation((rows) => rows.map((r, i) => i === idx ? { ...r, degree: e.target.value } : r))} placeholder={t("الدرجة", "Degree")} />
                <Input type="number" value={edu.startYear || ""} onChange={(e) => setEducation((rows) => rows.map((r, i) => i === idx ? { ...r, startYear: Number(e.target.value) || 0 } : r))} placeholder={t("سنة البداية", "Start Year")} />
                <Input type="number" value={edu.endYear || ""} onChange={(e) => setEducation((rows) => rows.map((r, i) => i === idx ? { ...r, endYear: Number(e.target.value) || 0 } : r))} placeholder={t("سنة التخرج", "Graduation Year")} />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEducation((rows) => [...rows, { university: "", major: "", degree: "", startYear: new Date().getFullYear(), endYear: new Date().getFullYear() }])}
            >
              <Plus className="w-4 h-4" /> {t("إضافة تعليم", "Add education")}
            </Button>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("المشاريع", "Projects")}</CardTitle>
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="space-y-3 mb-4 pb-4 border-b border-border last:border-0">
                <Input value={proj.title} onChange={(e) => setProjects((rows) => rows.map((r, i) => i === idx ? { ...r, title: e.target.value } : r))} placeholder={t("اسم المشروع", "Project Name")} />
                <Textarea rows={3} value={proj.description} onChange={(e) => setProjects((rows) => rows.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))} placeholder={t("ماذا بنيت؟ ما التقنيات؟ ما النتيجة؟", "What did you build? Which technologies? What was the outcome?")} />
                <Input
                  value={proj.technologies.join(", ")}
                  onChange={(e) => setProjects((rows) => rows.map((r, i) => i === idx ? { ...r, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : r))}
                  placeholder={t("تقنيات مفصولة بفاصلة", "Comma-separated technologies")}
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProjects((rows) => [...rows, { id: `proj-${Date.now()}`, title: "", description: "", technologies: [], image: "" }])}
            >
              <Plus className="w-4 h-4" /> {t("إضافة مشروع", "Add project")}
            </Button>
          </Card>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24">
          <Card>
            <CardTitle className="font-display mb-4">{t("المهارات", "Skills")}</CardTitle>
            <ul className="space-y-2 mb-4">
              {skills.map((s) => (
                <li key={s} className="flex items-center justify-between text-sm text-text-secondary rounded-lg border border-border px-3 py-1.5">
                  <span>{s}</span>
                  <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-text-muted hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={t("مهارة جديدة", "New Skill")} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
              <Button variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
            </div>
          </Card>

          <Card>
            <CardTitle className="font-display mb-4">{t("الهدف المهني", "Career Goal")}</CardTitle>
            <Select value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)}>
              <option value="frontend">{t("مطور Frontend", "Frontend Developer")}</option>
              <option value="backend">{t("مطور Backend", "Backend Developer")}</option>
              <option value="fullstack">{t("Full Stack", "Full Stack")}</option>
              <option value="ux">{t("مصمم UX/UI", "UX/UI Designer")}</option>
              <option value="data">{t("محلل بيانات", "Data Analyst")}</option>
            </Select>
            <p className="text-xs text-text-muted mt-2">{t("يُستخدم لتوصية الفرص وتحليل الفجوة", "Used to recommend opportunities and analyze skill gaps")}</p>
          </Card>

          <Card className="nq-gradient-panel">
            <p className="text-sm font-semibold text-text mb-2">{t("نصيحة نقلة", "Naqla Tip")}</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              {t("الملفات التي تحتوي مشروعاً حقيقياً + 5 مهارات محددة تحصل على تطابق أعلى بـ 40% مع الفرص.", "Profiles with a real project and 5 specific skills achieve 40% higher matching with opportunities.")}
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
