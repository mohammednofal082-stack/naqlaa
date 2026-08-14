"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { DashboardLayout, PublicHeader } from "@/components/layout/sidebar";
import { PageHeader } from "@/components/layout/page-header";

export function PageLayout({
  children,
  title,
  subtitle,
  meta,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  meta?: string;
  actions?: React.ReactNode;
}) {
  const { user, loading } = useApp();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--li-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <DashboardLayout>
        {title && <PageHeader title={title} subtitle={subtitle} meta={meta} actions={actions} />}
        {children}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--li-bg)]">
      <PublicHeader />
      <main className="pt-20 pb-16">
        <div className="nq-shell">
          <p className="text-[13px] text-text-muted mb-8 py-4 border-b border-border">
            {t("تصفّح الفرص —", "Browse opportunities —")}{" "}
            <Link href="/auth/login" className="text-brand font-semibold underline underline-offset-4 decoration-border-strong hover:decoration-brand">
              {t("سجّل للدخول والتقديم", "Sign in to apply")}
            </Link>
          </p>
          {title && <PageHeader title={title} subtitle={subtitle} meta={meta} actions={actions} />}
          {children}
        </div>
      </main>
    </div>
  );
}
