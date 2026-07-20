"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompany, useJobs } from "@/hooks/data";
import { useApp } from "@/contexts/app-context";
import { Briefcase, Building2, CheckCircle, Globe, MapPin, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function CompanyProfilePage() {
  const { t } = useI18n();
  const { user } = useApp();
  const companyId = user?.organizationId ?? "comp-1";
  const { data: company } = useCompany(companyId);
  const { data: jobs } = useJobs();
  const companyJobs = (jobs ?? []).filter((j) => j.companyId === companyId);

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
                    badge={<Button size="sm" variant="outline">{t("إدارة", "Manage")}</Button>}
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
              <Button className="w-full">{t("تحديث المعلومات", "Update Information")}</Button>
              <Button variant="outline" className="w-full mt-2">{t("رفع شعار جديد", "Upload New Logo")}</Button>
            </PanelCard>
          </div>
        </div>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
