"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import type { UserProfileBundle } from "@/backend/data";

export default function UniversityStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const { t } = useI18n();
  const [data, setData] = useState<UserProfileBundle | null>(null);

  useEffect(() => {
    void fetch(`/api/data/profile?userId=${encodeURIComponent(studentId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setData(json.data as UserProfileBundle);
      });
  }, [studentId]);

  const user = data?.user;
  const profile = data?.profile;

  return (
    <DashboardLayout>
      <DashboardSubPage
        title={user ? `${user.firstName} ${user.lastName}` : t("ملف الطالب", "Student profile")}
        subtitle={user?.email}
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/university/students"><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>
            <Link href={`/messages?user=${studentId}`}><Button size="sm">{t("مراسلة", "Message")}</Button></Link>
            <Link href={`/profile/${studentId}`}><Button size="sm" variant="outline">{t("الملف العام", "Public profile")}</Button></Link>
          </div>
        }
      >
        {!data ? (
          <div className="nq-skeleton h-48" />
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            <PanelCard title={t("نبذة", "About")}>
              <p className="text-sm text-text-secondary">{profile?.headline}</p>
              <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap">{profile?.about || "—"}</p>
            </PanelCard>
            <PanelCard title={t("المهارات والتعليم", "Skills & education")}>
              <div className="flex flex-wrap gap-2 mb-3">
                {(profile?.skills ?? []).map((s) => <span key={s} className="nq-chip">{s}</span>)}
              </div>
              {(profile?.education ?? []).map((e) => (
                <p key={e.university} className="text-sm">{e.university} — {e.major}</p>
              ))}
            </PanelCard>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
