"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/data";
import { Users } from "lucide-react";
import { useI18n } from "@/i18n";
import { roleLabel } from "@/i18n/labels";

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { data: users, loading } = useUsers();
  const items = users ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الإدارة", "Admin Panel")}
        title={t("إدارة المستخدمين", "User Management")}
        subtitle={t(`${items.length} مستخدم مسجل`, `${items.length} registered user(s)`)}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="nq-skeleton h-6 w-40" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="nq-skeleton h-14" />
            ))}
          </div>
        ) : (
          <PanelCard title={t("جميع المستخدمين", "All Users")}>
            {items.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t("لا مستخدمين", "No Users")}
                description={t("عند تسجيل مستخدمين جدد سيظهرون هنا.", "When new users register, they will appear here.")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="text-right py-3 px-4">{t("الاسم", "Name")}</th>
                      <th className="text-right py-3 px-4">{t("البريد", "Email")}</th>
                      <th className="text-right py-3 px-4">{t("الدور", "Role")}</th>
                      <th className="text-right py-3 px-4">{t("الإجراءات", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((user) => (
                      <Fragment key={user.id}>
                        <tr className="border-b border-border hover:bg-surface-hover transition-colors">
                          <td className="py-3 px-4 text-text">{user.firstName} {user.lastName}</td>
                          <td className="py-3 px-4 text-text-muted">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="nq-chip">{roleLabel(user.role, t)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              className="text-brand text-sm hover:underline"
                              onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                            >
                              {t("عرض", "View")}
                            </button>
                          </td>
                        </tr>
                        {expandedId === user.id && (
                          <tr className="border-b border-border bg-surface-hover/40">
                            <td colSpan={4} className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-text-secondary">
                                  {t("البريد:", "Email:")} <strong className="text-text">{user.email}</strong>
                                </span>
                                <span className="text-text-secondary">
                                  {t("المعرف:", "ID:")} {user.id}
                                </span>
                                <Link href="/messages">
                                  <Button size="sm" variant="outline">{t("رسائل", "Messages")}</Button>
                                </Link>
                                <a href={`mailto:${user.email}`}>
                                  <Button size="sm">{t("إرسال بريد", "Send Email")}</Button>
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
