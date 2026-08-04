"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { updateJob, useJob } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { Briefcase, X } from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-muted mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const emptyForm = {
  title: "",
  description: "",
  location: "",
  skills: "",
  requirements: "",
  workType: "hybrid",
  experienceLevel: "junior",
  salaryMin: "0",
  salaryMax: "0",
  status: "published",
};

export default function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { t } = useI18n();
  const { data: job, loading, refetch } = useJob(jobId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!job) return;
    setForm({
      title: job.title ?? "",
      description: job.description ?? "",
      location: job.location ?? "",
      skills: (job.skills ?? []).join(", "),
      requirements: (job.requirements ?? []).join(", "),
      workType: job.workType ?? "hybrid",
      experienceLevel: job.experienceLevel ?? "junior",
      salaryMin: String(job.salaryMin ?? 0),
      salaryMax: String(job.salaryMax ?? 0),
      status: job.status ?? "published",
    });
  }, [job]);

  const save = async (statusOverride?: string) => {
    setError("");
    setMessage("");
    if (!form.title.trim() || !form.description.trim()) {
      setError(t("العنوان والوصف مطلوبان", "Title and description are required"));
      return;
    }
    setSaving(true);
    try {
      await updateJob(jobId, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        workType: form.workType,
        experienceLevel: form.experienceLevel,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        status: statusOverride ?? form.status,
      });
      if (statusOverride) setForm((f) => ({ ...f, status: statusOverride }));
      await refetch();
      setMessage(t("تم حفظ التغييرات", "Changes saved"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("تعديل الوظيفة", "Edit job")}
        subtitle={job?.title ?? jobId}
        actions={
          <Link href="/dashboard/company/jobs">
            <Button size="sm" variant="outline">
              <X className="w-4 h-4" />
              {t("العودة", "Back")}
            </Button>
          </Link>
        }
      >
        {loading ? (
          <div className="nq-skeleton h-64" />
        ) : !job ? (
          <EmptyState
            icon={Briefcase}
            title={t("الوظيفة غير موجودة", "Job not found")}
            description={t("تحقق من الرابط أو عد للقائمة.", "Check the link or go back to the list.")}
          />
        ) : (
          <PanelCard title={t("بيانات الوظيفة", "Job details")}>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t("المسمى الوظيفي", "Job title")}>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label={t("الموقع", "Location")}>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t("الوصف", "Description")}>
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </Field>
              </div>
              <Field label={t("المهارات (مفصولة بفاصلة)", "Skills (comma-separated)")}>
                <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              </Field>
              <Field label={t("المتطلبات (مفصولة بفاصلة)", "Requirements (comma-separated)")}>
                <Input
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </Field>
              <Field label={t("نوع العمل", "Work type")}>
                <Select value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label={t("المستوى", "Level")}>
                <Select
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                >
                  <option value="entry">Entry</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </Select>
              </Field>
              <Field label={t("الراتب الأدنى", "Salary min")}>
                <Input
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                />
              </Field>
              <Field label={t("الراتب الأعلى", "Salary max")}>
                <Input
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                />
              </Field>
              <Field label={t("الحالة", "Status")}>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="closed">closed</option>
                  <option value="archived">archived</option>
                </Select>
              </Field>
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            {message && <p className="text-sm text-emerald-600 mt-3">{message}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? t("جاري الحفظ...", "Saving...") : t("حفظ", "Save")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => void save("closed")}
              >
                {t("إغلاق", "Close")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => void save("archived")}
              >
                {t("أرشفة", "Archive")}
              </Button>
            </div>
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
