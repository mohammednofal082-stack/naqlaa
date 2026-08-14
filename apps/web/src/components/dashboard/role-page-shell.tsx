"use client";

import Link from "next/link";
import type { UserRole } from "@careerlink/shared";
import { PageHeader } from "@/components/layout/page-header";
import { getRoleExperience } from "@/components/role/role-experience";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useApp } from "@/contexts/app-context";

/**
 * Role dashboards: page header + one quiet next-step strip (no scenario card grid).
 */
export function RoleDashboardShell({
  role,
  meta,
  title,
  subtitle,
  actions,
  showScenarios = false,
  scenarioIndex = 0,
  secondaryCta,
  children,
}: {
  role: UserRole;
  meta: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  /** @deprecated Kept for call-site compatibility; scenario grids are disabled. */
  showScenarios?: boolean;
  scenarioIndex?: number;
  secondaryCta?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const { user } = useApp();
  const exp = getRoleExperience(role, t);
  const scenario = showScenarios ? exp.scenarios[scenarioIndex] ?? exp.scenarios[0] : exp.scenarios[0];
  const firstName = user?.fullName?.split(" ")[0];
  const personalizedTitle = firstName
    ? t(`مرحباً، ${firstName}`, `Welcome, ${firstName}`)
    : title;
  const personalizedSubtitle = subtitle;

  return (
    <div className="nq-page-enter">
      <PageHeader meta={meta} title={personalizedTitle} subtitle={personalizedSubtitle} actions={actions} />
      {scenario && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-text-muted mb-0.5">{t("التالي", "Next")}</p>
            <p className="text-sm font-semibold text-text truncate">{scenario.title}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={scenario.href}>
              <Button size="sm">{scenario.cta}</Button>
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button variant="outline" size="sm">{secondaryCta.label}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export function DashboardSubPage({
  meta,
  title,
  subtitle,
  actions,
  children,
}: {
  meta?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="nq-page-enter">
      <PageHeader meta={meta} title={title} subtitle={subtitle} actions={actions} />
      {children}
    </div>
  );
}
