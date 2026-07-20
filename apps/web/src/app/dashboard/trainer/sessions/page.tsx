"use client";

import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Users } from "lucide-react";
import { useI18n } from "@/i18n";

export default function TrainerSessionsPage() {
  const { t } = useI18n();
  const sessions = [
    { id: "s1", title: t("مراجعة مشاريع React", "React Projects Review"), date: "2025-06-25 14:00", attendees: 12, status: "scheduled" },
    { id: "s2", title: "Q&A — Node.js APIs", date: "2025-06-27 16:00", attendees: 8, status: "scheduled" },
    { id: "s3", title: t("ورشة Portfolio Review", "Portfolio Review Workshop"), date: "2025-06-20 11:00", attendees: 15, status: "completed" },
  ];
  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة المدرب", "Trainer Dashboard")}
        title={t("الجلسات المباشرة", "Live Sessions")}
        subtitle={t("جدولة وجدولة حضور الطلاب", "Schedule sessions and manage student attendance")}
        actions={<Button size="sm"><Plus className="w-4 h-4" /> {t("جلسة جديدة", "New Session")}</Button>}
      >
        <PanelCard title={t("الجلسات", "Sessions")}>
          {sessions.length === 0 ? (
            <EmptyState
              icon={Mic}
              title={t("لا جلسات", "No Sessions")}
              description={t("أنشئ جلسة مباشرة أولى لطلابك.", "Create your first live session for your students.")}
              action={<Button size="sm"><Plus className="w-4 h-4" /> {t("جلسة جديدة", "New Session")}</Button>}
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="nq-lift flex items-center justify-between p-4 rounded-xl border border-border bg-surface-hover/40">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-cyan" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">{s.title}</p>
                      <p className="text-sm text-text-muted">{s.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted flex items-center gap-1"><Users className="w-3 h-3" />{s.attendees}</span>
                    <span className={s.status === "completed" ? "nq-chip nq-chip-emerald" : "nq-chip"}>{s.status === "completed" ? t("مكتملة", "Completed") : t("مجدولة", "Scheduled")}</span>
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
