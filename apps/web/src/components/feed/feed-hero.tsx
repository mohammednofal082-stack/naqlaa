"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { getRoleExperience } from "@/components/role/role-experience";
import { useApplications, useProfile } from "@/hooks/data";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

export function FeedHero() {
  const { user } = useApp();
  const { t, isRTL } = useI18n();
  const { data: profileData } = useProfile();
  const { data: apps } = useApplications();
  if (!user) return null;

  const role = getRoleExperience(user.role, t);
  const firstName = user.fullName.split(" ")[0];
  const scenario = role.scenarios[0];
  const myApps = (apps ?? []).length;
  const completion = profileData?.profile.profileCompletion ?? 0;

  return (
    <section className="mb-5 rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-text-muted">{role.label}</p>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text mt-1 tracking-tight">
            {t(`مرحباً، ${firstName}`, `Welcome, ${firstName}`)}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 max-w-xl leading-relaxed">{role.tagline}</p>
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

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-text-muted mb-0.5">{t("اكتمال الملف", "Profile completion")}</p>
          <p className="text-lg font-bold text-text tabular-nums">{completion}%</p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-0.5">{t("طلباتي", "Applications")}</p>
          <p className="text-lg font-bold text-text tabular-nums">{myApps}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-0.5">{t("التالي", "Next")}</p>
          <p className="text-sm font-semibold text-text leading-snug line-clamp-2">
            {scenario?.title ?? t("استكشف الفرص", "Explore opportunities")}
          </p>
        </div>
      </div>
    </section>
  );
}
