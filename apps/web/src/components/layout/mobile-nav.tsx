"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { getMobileNavForRole } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export function MobileNav({
  onOpenMenu,
  menuOpen,
}: {
  onOpenMenu?: () => void;
  menuOpen?: boolean;
}) {
  const pathname = usePathname();
  const { user } = useApp();
  const { t } = useI18n();
  const tabs = getMobileNavForRole(user?.role ?? "student", t);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 nq-mobile-nav safe-area-pb">
      <div className="flex items-stretch justify-around h-[3.625rem] max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const isAi = tab.href === "/ai";
          const isMenu = tab.action === "menu";
          const active =
            !isMenu &&
            (tab.href === "/feed"
              ? pathname === "/feed"
              : tab.href === "/ai"
                ? pathname === "/ai" || pathname.startsWith("/ai/")
                : tab.href.startsWith("/dashboard/")
                  ? pathname === tab.href || pathname.startsWith(`${tab.href}/`)
                  : pathname === tab.href || pathname.startsWith(`${tab.href}/`));
          const Icon = tab.icon;

          if (isMenu) {
            return (
              <button
                key="menu"
                type="button"
                onClick={onOpenMenu}
                className={cn("nq-mobile-tab", menuOpen ? "nq-mobile-tab-menu-open" : "text-text-muted")}
                aria-label={t("فتح القائمة الكاملة", "Open full menu")}
                aria-expanded={menuOpen}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate w-full text-center text-[11px]">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "nq-mobile-tab",
                active ? "nq-mobile-tab-active" : "text-text-muted",
                isAi && !active && "text-brand/80"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate w-full text-center text-[11px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
