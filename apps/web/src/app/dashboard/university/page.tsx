"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { RoleDashboardShell } from "@/components/dashboard/role-page-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { PanelCard, QuickAction, ActivityRow } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { universities } from "@careerlink/shared";
import { useCompanies, useInternshipRequests, usePartnerships, useUsers } from "@/hooks/data";
import { GraduationCap, Users, Handshake, TrendingUp, Building2, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { internshipStatusLabel } from "@/i18n/labels";

const uni = universities[0];

export default function UniversityDashboard() {
  const { t } = useI18n();
  const { data: users, loading: usersLoading } = useUsers();
  const { data: partnerships, loading: partnershipsLoading } = usePartnerships();
  const { data: internshipRequests, loading: requestsLoading } = useInternshipRequests();
  const { data: companies, loading: companiesLoading } = useCompanies();
  const loading = usersLoading || partnershipsLoading || requestsLoading || companiesLoading;

  const students = users?.filter((u) => u.role === "student") ?? [];
  const graduates = users?.filter((u) => u.role === "graduate") ?? [];
  const requests = internshipRequests ?? [];
  const partnershipItems = partnerships ?? [];
  const activeInternships = requests.filter((i) => i.status === "in_progress");

  const getCompany = (id: string) => companies?.find((c) => c.id === id);
  const getUser = (id: string) => users?.find((u) => u.id === id);

  return (
    <DashboardLayout>
      <RoleDashboardShell
        role="university"
        meta={t("لوحة الجامعة", "University Dashboard")}
        title={uni.name}
        subtitle={t("رؤية شاملة للطلاب، التدريبات، الشراكات، ونسب التوظيف", "A comprehensive view of students, internships, partnerships, and employment rates")}
        showScenarios
        secondaryCta={{ href: "/dashboard/university/reports", label: t("التقارير", "Reports") }}
      >
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="nq-skeleton h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 nq-skeleton h-80" />
              <div className="space-y-5">
                <div className="nq-skeleton h-48" />
                <div className="nq-skeleton h-40" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <StatCard title={t("الطلاب", "Students")} value={students.length.toLocaleString()} icon={Users} accent="blue" />
              <StatCard title={t("الخريجين", "Graduates")} value={graduates.length.toLocaleString()} icon={GraduationCap} accent="purple" />
              <StatCard title={t("تدريبات نشطة", "Active Internships")} value={activeInternships.length} icon={Building2} accent="cyan" />
              <StatCard title={t("نسبة التوظيف", "Employment Rate")} value={`${graduates.length ? Math.round((graduates.filter((g) => g.role === "graduate").length / Math.max(students.length + graduates.length, 1)) * 100) : 0}%`} icon={TrendingUp} change="+3%" accent="emerald" />
              <StatCard title={t("الشراكات", "Partnerships")} value={partnershipItems.length} icon={Handshake} accent="amber" />
              <StatCard title={t("طلبات تدريب", "Internship Requests")} value={requests.length} icon={TrendingUp} accent="blue" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <PanelCard
                  title={t("تتبع التدريب", "Internship Tracking")}
                  action={
                    <Link href="/dashboard/university/internships">
                      <Button variant="outline" size="sm">{t("عرض الكل", "View All")}</Button>
                    </Link>
                  }
                >
                  {requests.length === 0 ? (
                    <EmptyState
                      icon={Briefcase}
                      title={t("لا طلبات تدريب", "No Internship Requests")}
                      description={t("عند تقديم طلاب لفرص تدريب ستظهر هنا.", "Requests will appear here once students apply for internship opportunities.")}
                    />
                  ) : (
                    <div className="space-y-2">
                      {requests.map((req) => {
                        const company = getCompany(req.companyId);
                        const student = getUser(req.studentId);
                        return (
                          <ActivityRow
                            key={req.id}
                            avatar={
                              <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center font-bold text-cyan text-sm">
                                {student?.firstName[0]}
                              </div>
                            }
                            title={`${student?.firstName} ${student?.lastName}`}
                            subtitle={`${company?.name} · ${formatDate(req.startDate)} — ${formatDate(req.endDate)}`}
                            badge={<span className="nq-chip">{internshipStatusLabel(req.status, t)}</span>}
                          />
                        );
                      })}
                    </div>
                  )}
                </PanelCard>
              </div>

              <div className="space-y-5">
                <PanelCard
                  title={t("الشراكات", "Partnerships")}
                  action={
                    <Link href="/dashboard/university/partnerships">
                      <Button variant="outline" size="sm">{t("إدارة", "Manage")}</Button>
                    </Link>
                  }
                >
                  {partnershipItems.length === 0 ? (
                    <EmptyState
                      icon={Handshake}
                      title={t("لا شراكات", "No Partnerships")}
                      description={t("أضف شراكات مع شركات لتفعيل التدريبات.", "Add partnerships with companies to enable internships.")}
                    />
                  ) : (
                    <div className="space-y-2">
                      {partnershipItems.map((p) => {
                        const company = getCompany(p.companyId);
                        return (
                          <ActivityRow
                            key={p.id}
                            avatar={
                              <div className="w-9 h-9 rounded-lg bg-blue/10 border border-blue/20 flex items-center justify-center font-bold text-blue text-sm">
                                {company?.name[0]}
                              </div>
                            }
                            title={company?.name ?? ""}
                            subtitle={t(`منذ ${formatDate(p.startDate)}`, `Since ${formatDate(p.startDate)}`)}
                            badge={
                              <span className={p.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                                {p.status === "active" ? t("نشط", "Active") : t("معلق", "Pending")}
                              </span>
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </PanelCard>

                <PanelCard title={t("إجراءات سريعة", "Quick Actions")}>
                  <div className="space-y-2">
                    <QuickAction href="/dashboard/university/students" label={t("دليل الطلاب", "Student Directory")} icon={Users} />
                    <QuickAction href="/dashboard/university/events" label={t("الفعاليات", "Events")} icon={GraduationCap} />
                    <QuickAction href="/dashboard/university/departments" label={t("الأقسام", "Departments")} icon={Building2} />
                    <QuickAction href="/dashboard/university/reports" label={t("التقارير", "Reports")} icon={TrendingUp} />
                  </div>
                </PanelCard>

                <div className="nq-gradient-panel p-5">
                  <p className="text-3xl font-bold text-emerald tabular-nums">{activeInternships.length}</p>
                  <p className="text-sm text-text-secondary mt-1">{t("طالب في شركات شريكة", "Students at partner companies")}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </RoleDashboardShell>
    </DashboardLayout>
  );
}
