"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { createJob, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import Link from "next/link";
import { Plus, Briefcase, X } from "lucide-react";
import { useI18n } from "@/i18n";

const COMPANY_FALLBACK = "comp-1";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-muted mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export default function CompanyJobsPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId || COMPANY_FALLBACK;
  const { data: jobs, loading, refetch } = useJobs();
  const companyJobs = useMemo(
    () => (jobs ?? []).filter((j) => j.companyId === companyId),
    [jobs, companyId],
  );

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "رام الله",
    skills: "React, TypeScript",
    requirements: "Git, Communication",
    workType: "hybrid",
    experienceLevel: "junior",
    salaryMin: "2000",
    salaryMax: "4000",
  });

  const openForm = () => {
    setError("");
    setOpen(true);
  };

  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.description.trim()) {
      setError(t("العنوان والوصف مطلوبان", "Title and description are required"));
      return;
    }
    setSaving(true);
    try {
      await createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        companyId,
        location: form.location.trim() || "رام الله",
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split(",").map((s) => s.trim()).filter(Boolean),
        workType: form.workType,
        experienceLevel: form.experienceLevel,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
      });
      setOpen(false);
      setForm((f) => ({ ...f, title: "", description: "" }));
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل النشر", "Failed to post"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("إدارة الوظائف", "Job Management")}
        subtitle={t("نشر وتعديل وإغلاق الفرص الوظيفية", "Post, edit, and close job opportunities")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" />
            {t("نشر وظيفة", "Post a Job")}
          </Button>
        }
      >
        {open && (
          <PanelCard title={t("نشر وظيفة جديدة", "Post a new job")} className="mb-6">
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
                <Input value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
              </Field>
              <Field label={t("نوع العمل", "Work type")}>
                <Select value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label={t("المستوى", "Level")}>
                <Select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
                  <option value="entry">Entry</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </Select>
              </Field>
              <Field label={t("الراتب الأدنى", "Salary min")}>
                <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              </Field>
              <Field label={t("الراتب الأعلى", "Salary max")}>
                <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
              </Field>
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={submit} disabled={saving}>
                {saving ? t("جاري النشر...", "Posting...") : t("نشر", "Publish")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                <X className="w-4 h-4" />
                {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={`${companyJobs.length} ${t("وظائف نشطة", "active jobs")}`}>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
          ) : companyJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t("لا وظائف منشورة بعد", "No Jobs Posted Yet")}
              description={t("انشر أول وظيفة لتبدأ باستقبال المتقدمين.", "Post your first job to start receiving applicants.")}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("نشر وظيفة", "Post a Job")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {companyJobs.map((job) => (
                <div
                  key={job.id}
                  className="nq-lift flex items-center justify-between gap-3 p-4 rounded-lg border border-border bg-surface-hover/40"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-text truncate">{job.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {job.location} · {job.workType} · {job.applicants} {t("متقدم", "applicants")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="nq-chip">{job.status}</span>
                    <Link href={`/dashboard/company/jobs/${job.id}/edit`}>
                      <Button size="sm" variant="outline">{t("تعديل", "Edit")}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
