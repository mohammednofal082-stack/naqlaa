"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { getRoleExperience } from "@/components/role/role-experience";
import { RoleScenarios } from "@/components/role/role-ui";
import { dashboardStats, applications } from "@careerlink/shared";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

export function FeedHero() {
  const { user } = useApp();
  const { t, isRTL } = useI18n();
  if (!user) return null;

  const role = getRoleExperience(user.role, t);
  const firstName = user.fullName.split(" ")[0];
  const scenario = role.scenarios[0];
  const myApps = applications.filter((a) => a.studentId === user.userId).length;

  return (
    <section className="space-y-4 mb-4">
      <div className={`nq-hero nq-gradient-panel bg-gradient-to-l ${role.gradient}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand">{role.icon} {role.label}</p>
            <h1 className="font-display text-xl md:text-2xl font-bold text-text mt-1 tracking-tight">
              {t(`مرحباً، ${firstName}`, `Welcome, ${firstName}`)}
            </h1>
            <p className="text-sm text-text-secondary mt-1.5 max-w-xl leading-relaxed">{role.tagline}</p>
            <p className="text-xs text-text-muted mt-1">{role.mantra}</p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/ai" className="nq-btn-ghost text-brand">
              <Compass className="w-3.5 h-3.5" />
              {t("الأدوات المهنية", "Career Tools")}
            </Link>
            {scenario && (
              <Link href={scenario.href} className="nq-btn-primary-sm">
                {scenario.cta}
                {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-5 border-t border-border/60">
          <div className="nq-stat">
            <p className="text-xs text-text-muted mb-0.5">{t("اكتمال الملف", "Profile completion")}</p>
            <p className="text-xl font-bold text-brand tabular-nums">{dashboardStats.profileCompletion}%</p>
          </div>
          <div className="nq-stat">
            <p className="text-xs text-text-muted mb-0.5">{t("طلبات نشطة", "Active applications")}</p>
            <p className="text-xl font-bold text-text tabular-nums">{myApps}</p>
          </div>
          <div className="nq-stat">
            <p className="text-xs text-text-muted mb-0.5">{t("الخطوة التالية", "Next step")}</p>
            <p className="text-sm font-semibold text-text leading-snug">{scenario?.title ?? t("استكشف المنصة", "Explore the platform")}</p>
          </div>
        </div>
      </div>

      <div>
        <p className="nq-section-label">{t("سيناريوهات مقترحة لك", "Suggested scenarios for you")}</p>
        <RoleScenarios role={role} compact />
      </div>
    </section>
  );
}
