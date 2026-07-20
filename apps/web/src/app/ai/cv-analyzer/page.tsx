"use client";

import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { analyzeCvClient } from "@/lib/ai/client-api";
import { uploadCvPdf } from "@/lib/ai/cv-upload";
import type { CVAnalysis } from "@careerlink/shared";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle,
  XCircle,
  Lightbulb,
  FileText,
  Loader2,
  FileUp,
} from "lucide-react";
import { useI18n } from "@/i18n";

export default function CVAnalyzerPage() {
  const { t } = useI18n();
  const SAMPLE_CV = t(
    `محمد نوفل — مطور واجهات أمامية
البريد: ahmed@example.com | غزة، فلسطين

الملخص: مطور React بخبرة 2 سنة في بناء تطبيقات ويب تفاعلية.

المهارات: React, TypeScript, Next.js, Tailwind CSS, Git

الخبرة:
- شركة تقنية — مطور Frontend (2023-حتى الآن)
  بناء لوحات تحكم وتحسين الأداء 30%

التعليم: بكالوريوس هندسة حاسوب — جامعة النجاح الوطنية`,
    `Mohammed Nofal — Frontend Developer
Email: ahmed@example.com | Gaza, Palestine

Summary: React developer with 2 years of experience building interactive web applications.

Skills: React, TypeScript, Next.js, Tailwind CSS, Git

Experience:
- Tech Company — Frontend Developer (2023–Present)
  Built dashboards and improved performance by 30%

Education: Bachelor of Computer Engineering — An-Najah National University`
  );
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState(t("مطور Frontend", "Frontend Developer"));
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async (text?: string) => {
    const content = (text ?? cvText).trim() || SAMPLE_CV;
    setLoading(true);
    setError("");
    try {
      const { analysis: result } = await analyzeCvClient({ cvText: content, targetRole });
      setAnalysis(result);
      if (!cvText.trim()) setCvText(content);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل التحليل", "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploading(true);
    setError("");
    setFileName(null);
    try {
      const { text, fileName: name } = await uploadCvPdf(file);
      setCvText(text);
      setFileName(name);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل رفع الملف", "File upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
    e.target.value = "";
  };

  return (
    <DashboardLayout>
      <PageHeader
        meta={t("الأدوات المهنية", "Career Tools")}
        title={t("تحليل السيرة الذاتية", "CV Analysis")}
        subtitle={t(
          "ارفع ملف PDF أو الصق النص — تحليل ATS ودرجة جاهزية فورية",
          "Upload a PDF file or paste text — ATS analysis and an instant readiness score"
        )}
      />

      <div className="nq-page-enter grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
          {loading && !analysis ? (
            <div className="space-y-4">
              <div className="nq-skeleton h-48 rounded-xl" />
              <div className="nq-skeleton h-32 rounded-xl" />
              <div className="nq-skeleton h-12 w-40 rounded-xl" />
            </div>
          ) : !analysis ? (
            <Card className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={onFileChange}
              />

              <div
                className="nq-lift border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand/40 hover:bg-brand-muted/20 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handlePdfUpload(file);
                }}
              >
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto mb-3" />
                ) : (
                  <FileUp className="w-10 h-10 text-brand mx-auto mb-3" />
                )}
                <p className="font-semibold text-text mb-1">
                  {uploading
                    ? t("جاري قراءة الملف...", "Reading file...")
                    : t("اسحب ملف PDF أو انقر للرفع", "Drag a PDF file or click to upload")}
                </p>
                <p className="text-sm text-text-muted">{t("PDF فقط — حتى ٥ ميجابايت", "PDF only — up to 5 MB")}</p>
                {fileName && (
                  <p className="text-sm text-emerald mt-3 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {t("تم رفع:", "Uploaded:")} {fileName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">{t("أو الصق النص", "Or paste text")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={t("الدور المستهدف (مثال: مطور Full Stack)", "Target role (e.g. Full Stack Developer)")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text mb-3 focus:outline-none focus:border-brand/50"
              />
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={t("الصق نص سيرتك الذاتية هنا بعد الرفع أو يدوياً...", "Paste your CV text here after uploading, or manually...")}
                className="w-full h-40 px-4 py-3 rounded-lg border border-border bg-background text-text placeholder:text-text-muted focus:outline-none focus:border-brand/50 resize-none"
              />

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={() => handleAnalyze()} disabled={loading || uploading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {loading ? t("جاري التحليل...", "Analyzing...") : t("تحليل السيرة الآن", "Analyze CV Now")}
                </Button>
                <Button variant="outline" onClick={() => handleAnalyze(SAMPLE_CV)} disabled={loading || uploading}>
                  {t("تجربة بسيرة نموذجية", "Try a Sample CV")}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="nq-lift p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-brand" />
                    <div>
                      <p className="font-medium">{t("تحليل السيرة —", "CV Analysis —")} {targetRole}</p>
                      <p className="text-sm text-text-muted">{t("تم التحليل بنجاح", "Analysis completed successfully")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setAnalysis(null); setFileName(null); }}>
                    {t("تحليل جديد", "New Analysis")}
                  </Button>
                </div>
              </Card>

              <Card className="p-5">
                <CardTitle className="mb-4 flex items-center gap-2 text-base">
                  <CheckCircle className="w-5 h-5 text-emerald" />
                  {t("نقاط القوة", "Strengths")}
                </CardTitle>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald mt-0.5 shrink-0" />
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <CardTitle className="mb-4 flex items-center gap-2 text-base">
                  <XCircle className="w-5 h-5 text-red-400" />
                  {t("نقاط التحسين", "Areas for Improvement")}
                </CardTitle>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-text-secondary">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5">
                <CardTitle className="mb-4 flex items-center gap-2 text-base">
                  <Lightbulb className="w-5 h-5 text-amber" />
                  {t("اقتراحات التحسين", "Improvement Suggestions")}
                </CardTitle>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-text-secondary">
                      <Lightbulb className="w-4 h-4 text-amber mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-4">
          {analysis ? (
            <>
              <div className="nq-gradient-panel p-5 text-center">
                <CardTitle className="mb-4 text-base">{t("درجة ATS", "ATS Score")}</CardTitle>
                <ProgressRing value={analysis.atsScore} size={140} />
                <p className="text-text-muted text-sm mt-4">
                  {analysis.atsScore >= 80
                    ? t("ممتاز — سيرتك متوافقة مع أنظمة ATS", "Excellent — your CV is compatible with ATS systems")
                    : t("جيد — يمكن تحسينها", "Good — it can be improved")}
                </p>
              </div>
              <Card className="p-5">
                <CardTitle className="mb-3 text-base">{t("مهارات ناقصة", "Missing Skills")}</CardTitle>
                <p className="text-sm text-text-secondary">{analysis.missingSkills.join(" · ")}</p>
              </Card>
            </>
          ) : (
            <div className="nq-gradient-panel p-5">
              <p className="text-sm font-semibold text-text mb-2">{t("نصائح الرفع", "Upload Tips")}</p>
              <ul className="text-xs text-text-muted space-y-2 leading-relaxed">
                <li>• {t("استخدم PDF بنص قابل للنسخ (ليس صورة ممسوحة)", "Use a PDF with selectable text (not a scanned image)")}</li>
                <li>• {t("حدّد الدور المستهدف قبل التحليل", "Specify the target role before analyzing")}</li>
                <li>• {t("يمكنك تعديل النص بعد الاستخراج", "You can edit the text after extraction")}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
