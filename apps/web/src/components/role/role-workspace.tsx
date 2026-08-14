"use client";

import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { getRoleExperience } from "./role-experience";
import { RoleIdentityBanner, RoleScenarios } from "./role-ui";

/** Default: no banner / scenario grid — dashboards stay content-first. */
export function RoleWorkspace({
  children,
  showScenarios = false,
  showBanner = false,
}: {
  children: React.ReactNode;
  showScenarios?: boolean;
  showBanner?: boolean;
}) {
  const { user } = useApp();
  const { t } = useI18n();
  const role = getRoleExperience(user?.role ?? "student", t);

  return (
    <>
      {showBanner && <RoleIdentityBanner role={role} />}
      {showScenarios && <RoleScenarios role={role} />}
      {children}
    </>
  );
}
