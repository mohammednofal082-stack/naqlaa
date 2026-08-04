"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/data";
import { useI18n } from "@/i18n";
import { roleLabel } from "@/i18n/labels";
import { User } from "lucide-react";

export default function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { t } = useI18n();
  const { data: users, loading } = useUsers();
  const user = useMemo(() => (users ?? []).find((u) => u.id === userId), [users, userId]);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={
          user
            ? `${user.firstName} ${user.lastName}`
            : t("تفاصيل المستخدم", "User details")
        }
        subtitle={user?.email ?? userId}
        actions={
          <Link href="/dashboard/admin/users">
            <Button size="sm" variant="outline">{t("العودة", "Back")}</Button>
          </Link>
        }
      >
        {loading ? (
          <div className="nq-skeleton h-48" />
        ) : !user ? (
          <EmptyState
            icon={User}
            title={t("المستخدم غير موجود", "User not found")}
            description={t("تحقق من الرابط أو عد للقائمة.", "Check the link or go back to the list.")}
          />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <PanelCard title={t("المعلومات", "Information")}>
              <div className="space-y-3 text-sm text-text-secondary">
                <p>
                  {t("الاسم:", "Name:")}{" "}
                  <span className="text-text font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </p>
                <p>
                  {t("البريد:", "Email:")} <span className="text-text">{user.email}</span>
                </p>
                <p>
                  {t("الدور:", "Role:")}{" "}
                  <span className="nq-chip">{roleLabel(user.role, t)}</span>
                </p>
                <p>
                  {t("المعرف:", "ID:")} <span className="font-mono text-xs">{user.id}</span>
                </p>
                {user.createdAt && (
                  <p>
                    {t("تاريخ التسجيل:", "Joined:")}{" "}
                    <span className="text-text">{String(user.createdAt).slice(0, 10)}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link href={`/profile/${user.id}`}>
                  <Button size="sm" variant="outline">{t("الملف العام", "Public profile")}</Button>
                </Link>
                <Link href={`/messages?user=${user.id}`}>
                  <Button size="sm" variant="outline">{t("رسائل", "Messages")}</Button>
                </Link>
                <a href={`mailto:${user.email}`}>
                  <Button size="sm">{t("إرسال بريد", "Send Email")}</Button>
                </a>
              </div>
            </PanelCard>
          </div>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
