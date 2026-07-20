"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { GlobalSearch } from "@/components/layout/global-search";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { ThemeModeSwitch } from "@/components/ui/theme-toggle";
import { LanguageSwitch } from "@/components/ui/language-toggle";
import { usesFluidShell } from "@/components/layout/nav-config";
import { getRoleExperience } from "@/components/role/role-experience";
import { ROLE_LABELS } from "@careerlink/shared";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type TFn = (ar: string, en: string) => string;

function getPageTitle(pathname: string, t: TFn): string {
  const titles: Record<string, string> = {
    "/feed": t("المنصة", "Feed"),
    "/jobs": t("الوظائف", "Jobs"),
    "/internships": t("التدريب", "Internships"),
    "/applications": t("طلباتي", "My Applications"),
    "/ai": t("الأدوات المهنية", "Career Tools"),
    "/messages": t("الرسائل", "Messages"),
    "/notifications": t("الإشعارات", "Notifications"),
    "/profile": t("ملفي الشخصي", "My Profile"),
    "/settings": t("الإعدادات", "Settings"),
    "/community": t("المجتمع", "Community"),
    "/journey": t("رحلتي المهنية", "My Career Journey"),
    "/mentorship": t("الإرشاد المهني", "Mentorship"),
    "/saved": t("المحفوظات", "Saved"),
    "/search": t("البحث", "Search"),
    "/courses": t("الكورسات", "Courses"),
    "/projects": t("المشاريع", "Projects"),
    "/events": t("الفعاليات", "Events"),
    "/companies": t("الشركات", "Companies"),
  };
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/ai/")) return t("الأدوات المهنية", "Career Tools");
  if (pathname.startsWith("/jobs/")) return t("تفاصيل الوظيفة", "Job Details");
  if (pathname.startsWith("/dashboard/")) return t("لوحة التحكم", "Dashboard");
  return t("نقلة", "Naqla");
}

export function AppTopBar() {
  const { user } = useApp();
  const { t } = useI18n();
  const pathname = usePathname();

  if (!user) return null;

  const fluid = usesFluidShell(user.role);
  const roleMeta = getRoleExperience(user.role, t);
  const pageTitle = getPageTitle(pathname, t);
  const homeHref = fluid ? "/feed" : `/dashboard/${user.role}`;

  return (
    <header className="nq-topbar sticky top-0 z-40 w-full">
      <div className="nq-shell">
        <div className="flex items-center gap-3 h-[3.75rem] min-w-0">
          <Link href={homeHref} className="lg:hidden shrink-0">
            <Logo size="sm" />
          </Link>

          <div className="min-w-0 flex-1 lg:flex-none lg:max-w-[14rem]">
            <p className="text-[10px] font-medium text-text-muted truncate lg:hidden">
              {roleMeta.label} · {ROLE_LABELS[user.role]}
            </p>
            <h1 className="text-sm font-bold text-text truncate lg:text-base">{pageTitle}</h1>
          </div>

          <div className="hidden md:block flex-1 max-w-md min-w-0">
            <GlobalSearch variant="nav" />
          </div>

          <div className="flex items-center gap-0.5 shrink-0 ms-auto">
            <div className="md:hidden w-[7.5rem] min-w-0">
              <GlobalSearch variant="nav" />
            </div>

            <Link
              href="/notifications"
              className={cn(
                "nq-icon-btn",
                pathname.startsWith("/notifications") && "text-brand"
              )}
              title={t("الإشعارات", "Notifications")}
            >
              <Bell className="w-5 h-5" />
            </Link>

            <LanguageSwitch className="nq-icon-btn border-transparent bg-transparent hover:bg-[var(--li-nav-hover)]" />
            <ThemeModeSwitch className="nq-icon-btn border-transparent bg-transparent hover:bg-[var(--li-nav-hover)]" />

            <Link
              href="/profile"
              className="flex items-center gap-2 ps-1.5 pe-2 py-1 rounded-lg hover:bg-[var(--li-nav-hover)] transition-colors"
              title={user.fullName}
            >
              <Avatar src={user.avatar} alt={user.fullName} size="sm" />
              <span className="hidden xl:block text-start min-w-0">
                <span className="block text-xs font-semibold text-text truncate max-w-[6rem]">
                  {user.fullName.split(" ")[0]}
                </span>
                <span className="block text-[10px] text-text-muted">{roleMeta.label}</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
