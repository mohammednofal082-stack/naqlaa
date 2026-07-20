"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { getRoleExperience } from "@/components/role/role-experience";
import { ROLE_DASHBOARD_PATHS } from "@careerlink/shared";
import { usesFluidShell } from "./nav-config";
import { ArrowLeft, ArrowRight } from "lucide-react";

const HIDE_PREFIXES = [
  "/feed",
  "/auth",
  "/profile",
  "/ai",
  "/messages",
  "/notifications",
  "/settings",
  "/dashboard",
];

export function RoleStrip() {
  const { user } = useApp();
  const { t, isRTL } = useI18n();
  const pathname = usePathname();

  if (!user || !usesFluidShell(user.role)) return null;
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const role = getRoleExperience(user.role, t);
  const scenario = role.scenarios.find((s) => pathname.startsWith(s.href.split("?")[0])) ?? role.scenarios[0];
  const dashboard = ROLE_DASHBOARD_PATHS[user.role];

  return (
    <div className={`nq-role-strip bg-gradient-to-l ${role.gradient}`}>
      <div className="nq-shell flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5">
        <p className="text-xs text-text-secondary min-w-0 truncate">
          <span className="font-semibold text-text">{scenario?.title}</span>
          {scenario?.description ? ` — ${scenario.description}` : ""}
        </p>
        <Link href={scenario?.href ?? dashboard} className="nq-btn-primary-sm shrink-0">
          {scenario?.cta ?? t("متابعة", "Continue")}
          {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </Link>
      </div>
    </div>
  );
}
