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
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppTopBar() {
  const { user } = useApp();
  const { t } = useI18n();
  const pathname = usePathname();

  if (!user) return null;

  const homeHref = `/dashboard/${user.role}`;

  return (
    <header className="nq-topbar sticky top-0 z-40 w-full border-b border-border bg-[var(--li-nav)] safe-area-pt">
      <div className="nq-shell">
        <div className="flex items-center gap-1.5 sm:gap-2 h-[52px] min-h-[52px] min-w-0">
          <Link href={homeHref} className="shrink-0" aria-label={t("نقلة", "Naqla")}>
            <Logo size="sm" className="!gap-2" />
          </Link>

          <div className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-2">
            <GlobalSearch variant="nav" />
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <LanguageSwitch
              className="nq-icon-btn !border-transparent !bg-transparent hover:!bg-[var(--li-nav-hover)]"
              showLabel={false}
            />
            <ThemeModeSwitch
              className="nq-icon-btn !border-transparent !bg-transparent hover:!bg-[var(--li-nav-hover)]"
              showLabel={false}
            />
            <Link
              href="/notifications"
              className={cn("nq-icon-btn", pathname.startsWith("/notifications") && "text-brand")}
              title={t("الإشعارات", "Notifications")}
              aria-label={t("الإشعارات", "Notifications")}
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              href="/profile"
              className="flex items-center p-1 rounded-full hover:bg-[var(--li-nav-hover)] transition-colors"
              title={user.fullName}
              aria-label={user.fullName}
            >
              <Avatar src={user.avatar} alt={user.fullName} size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
