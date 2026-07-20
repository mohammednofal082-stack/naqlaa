"use client";

import Link from "next/link";
import type { UserRole } from "@careerlink/shared";
import { PageHeader } from "@/components/layout/page-header";
import { RoleWorkspace } from "@/components/role/role-workspace";
import { DashboardHero } from "@/components/dashboard/dashboard-shell";
import { getRoleExperience } from "@/components/role/role-experience";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export function RoleDashboardShell({
  role,
  meta,
  title,
  subtitle,
  actions,
  showScenarios = true,
  scenarioIndex = 0,
  secondaryCta,
  children,
}: {
  role: UserRole;
  meta: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  showScenarios?: boolean;
  scenarioIndex?: number;
  secondaryCta?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const exp = getRoleExperience(role, t);
  const scenario = exp.scenarios[scenarioIndex] ?? exp.scenarios[0];

  return (
    <div className="nq-page-enter">
      <PageHeader meta={meta} title={title} subtitle={subtitle} actions={actions} />
      <RoleWorkspace showScenarios={showScenarios} showBanner={false}>
        {scenario && (
          <DashboardHero
            eyebrow={t("الخطوة التالية الموصى بها", "Recommended next step")}
            title={scenario.title}
            subtitle={scenario.description}
          >
            <Link href={scenario.href}>
              <Button size="sm">{scenario.cta}</Button>
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button variant="outline" size="sm">{secondaryCta.label}</Button>
              </Link>
            )}
          </DashboardHero>
        )}
        {children}
      </RoleWorkspace>
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
