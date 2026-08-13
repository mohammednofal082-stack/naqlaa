"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useCompany, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Briefcase, Building2, CheckCircle, Globe, MapPin, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function CompanyProfilePage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: company, refetch } = useCompany(companyId);
  const { data: jobs } = useJobs();
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === companyId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", about: "", industry: "", website: "", location: "", email: "", employees: "", founded: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const startEdit = () => {
    if (!company) return;
    setForm({
      name: company.name,
      about: company.about,
      industry: company.industry,
      website: company.website,
      location: company.location,
      email: company.email,
      employees: String(company.employees || ""),
      founded: String(company.founded || ""),
    });
    setEditing(true);
  };

  const saveCompany = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/data/companies/${encodeURIComponent(companyId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          about: form.about,
          industry: form.industry,
          website: form.website,
          location: form.location,
          email: form.email,
          employees: Number(form.employees) || 0,
          founded: Number(form.founded) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetch();
      setEditing(false);
      setMsg(t("تم حفظ ملف الشركة", "Company profile saved"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل الحفظ", "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  if (!company) {
    return (
      <DashboardLayout>
        <DashboardSubPage meta={t("لوحة الشركة", "Company Dashboard")} title={t("ملف الشركة", "Company Profile")}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="nq-skeleton h-44" />
              <div className="nq-skeleton h-64" />
            </div>
            <div className="space-y-6">
              <div className="nq-skeleton h-72" />
              <div className="nq-skeleton h-36" />
            </div>
          </div>
        </DashboardSubPage>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("ملف الشركة", "Company Profile")}
        subtitle={company.name}
      >
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PanelCard title={company.name}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-brand-muted border border-border flex items-center justify-center text-xl font-bold text-brand">
                  {company.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-text">{company.name}</h2>
                    {company.verified && (
                      <span className="nq-chip nq-chip-emerald">
                        <CheckCircle className="w-3 h-3" />
                        {t("موثقة", "Verified")}
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">{company.industry}</p>
                  <p className="text-text-secondary text-sm mt-3 leading-relaxed">{company.about}</p>
                </div>
              </div>
            </PanelCard>

            <PanelCard title={t("الوظائف النشطة", "Active Jobs")}>
              {companyJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title={t("لا وظائف نشطة", "No Active Jobs")}
                  description={t("انشر وظيفة جديدة لعرضها في ملف الشركة.", "Post a new job to display it on the company profile.")}
                />
              ) : (
              <div className="space-y-2">
                {companyJobs.map((job) => (
                  <ActivityRow
                    key={job.id}
                    avatar={
                      <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-brand" />
                      </div>
                    }
                    title={job.title}
                    subtitle={`${job.location} · ${job.applicants} ${t("متقدم", "applicants")}`}
                    badge={<Link href="/dashboard/company/jobs"><Button size="sm" variant="outline">{t("إدارة", "Manage")}</Button></Link>}
                  />
                ))}
              </div>
              )}
            </PanelCard>
          </div>

          <div className="space-y-6">
            <PanelCard title={t("معلومات الشركة", "Company Information")}>
              <div className="space-y-3 text-sm">
                {[
                  { icon: MapPin, label: company.location },
                  { icon: Globe, label: company.website },
                  { icon: Users, label: `${company.employees.toLocaleString()} ${t("موظف", "employees")}` },
                  { icon: Building2, label: t(`تأسست ${company.founded}`, `Founded ${company.founded}`) },
                  { icon: Briefcase, label: `${company.activeJobs} ${t("وظائف نشطة", "active jobs")}` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-text-secondary">
                    <div className="w-8 h-8 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                      <Icon className="w-4 h-4 text-brand" />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </PanelCard>

            <PanelCard title={t("تعديل الملف", "Edit Profile")}>
              {msg && <p className="text-sm text-text-secondary mb-2">{msg}</p>}
              {editing ? (
                <div className="space-y-2">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("الاسم", "Name")} />
                  <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder={t("القطاع", "Industry")} />
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t("الموقع", "Location")} />
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" />
                  <Input value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} placeholder={t("عدد الموظفين", "Employees")} />
                  <Input value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })} placeholder={t("سنة التأسيس", "Founded")} />
                  <Textarea rows={4} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
                  <Button className="w-full" disabled={busy} onClick={() => void saveCompany()}>{t("حفظ", "Save")}</Button>
                  <Button className="w-full" variant="outline" onClick={() => setEditing(false)}>{t("إلغاء", "Cancel")}</Button>
                </div>
              ) : (
                <>
                  <Button className="w-full" onClick={startEdit}>{t("تعديل بيانات الشركة", "Edit company details")}</Button>
                  <Link href="/dashboard/company/jobs" className="block mt-2">
                    <Button variant="outline" className="w-full">{t("إدارة الوظائف", "Manage jobs")}</Button>
                  </Link>
                  <Link href="/dashboard/company/applications" className="block mt-2">
                    <Button variant="outline" className="w-full">{t("مراجعة المتقدمين", "Review applicants")}</Button>
                  </Link>
                </>
              )}
            </PanelCard>
          </div>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
