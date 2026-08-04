"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useProfile } from "@/hooks/data";
import { Download, FileText } from "lucide-react";
import { useI18n } from "@/i18n";

const TEMPLATES = [
  { id: "classic", labelAr: "كلاسيكي", labelEn: "Classic" },
  { id: "modern", labelAr: "حديث", labelEn: "Modern" },
  { id: "compact", labelAr: "مختصر", labelEn: "Compact" },
] as const;

export default function CvBuilderPage() {
  const { t } = useI18n();
  const { data } = useProfile();
  const profile = data?.profile;
  const user = data?.user;

  const [template, setTemplate] = useState<(typeof TEMPLATES)[number]["id"]>("classic");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!profile || !user || hydrated) return;
    setFullName(`${user.firstName} ${user.lastName}`.trim());
    setHeadline(profile.headline ?? "");
    setAbout(profile.about ?? "");
    setSkills((profile.skills ?? []).join(" · "));
    setHydrated(true);
  }, [profile, user, hydrated]);

  const html = useMemo(() => {
    const accent = template === "modern" ? "#2563EB" : template === "compact" ? "#0f766e" : "#0f172a";
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"/><title>CV - ${fullName}</title>
<style>
  body{font-family:Cairo,Tahoma,sans-serif;color:#0f172a;margin:0;padding:32px;background:#fff}
  .wrap{max-width:800px;margin:0 auto;border:1px solid #e2e8f0;padding:${template === "compact" ? "24px" : "40px"};border-radius:${template === "modern" ? "16px" : "4px"}}
  h1{margin:0;color:${accent};font-size:${template === "compact" ? "22px" : "28px"}}
  .headline{color:#475569;margin-top:6px}
  h2{border-bottom:2px solid ${accent};padding-bottom:6px;font-size:16px;margin-top:28px}
  p,li{line-height:1.7;color:#334155}
  .skills{display:flex;flex-wrap:wrap;gap:8px}
  .skill{border:1px solid #cbd5e1;border-radius:999px;padding:4px 10px;font-size:12px}
</style></head>
<body><div class="wrap">
  <h1>${fullName || "—"}</h1>
  <div class="headline">${headline || ""}</div>
  <h2>نبذة</h2><p>${about || "—"}</p>
  <h2>المهارات</h2>
  <div class="skills">${(skills || "").split("·").map((s) => s.trim()).filter(Boolean).map((s) => `<span class="skill">${s}</span>`).join("") || "—"}</div>
  <h2>التعليم</h2>
  <ul>${(profile?.education ?? []).map((e) => `<li>${e.university} — ${e.major} (${e.startYear}-${e.endYear})</li>`).join("") || "<li>—</li>"}</ul>
  <h2>مشاريع</h2>
  <ul>${(profile?.projects ?? []).map((p) => `<li><strong>${p.title}</strong>: ${p.description}</li>`).join("") || "<li>—</li>"}</ul>
</div></body></html>`;
  }, [about, fullName, headline, profile?.education, profile?.projects, skills, template]);

  const download = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naqla-cv-${template}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("التطوير المهني", "Professional Development")}
        title={t("بناء السيرة الذاتية", "CV Builder")}
        subtitle={t("قوالب جاهزة + تصدير للطباعة/PDF", "Ready templates + print/PDF export")}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={download}><Download className="w-4 h-4" /> HTML</Button>
            <Button size="sm" onClick={printPdf}><FileText className="w-4 h-4" /> {t("طباعة / PDF", "Print / PDF")}</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-5 space-y-4">
          <CardTitle>{t("المحتوى", "Content")}</CardTitle>
          <Select value={template} onChange={(e) => setTemplate(e.target.value as typeof template)}>
            {TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>{t(tpl.labelAr, tpl.labelEn)}</option>
            ))}
          </Select>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("الاسم", "Name")} />
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={t("العنوان المهني", "Headline")} />
          <Textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t("نبذة", "About")} />
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={t("مهارات مفصولة بـ ·", "Skills separated by ·")} />
        </Card>
        <Card className="p-0 overflow-hidden">
          <iframe title="cv-preview" className="w-full min-h-[640px] bg-white" srcDoc={html} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
