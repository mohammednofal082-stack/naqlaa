"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { ThemeModeSwitch } from "@/components/ui/theme-toggle";
import { LanguageSwitch } from "@/components/ui/language-toggle";
import type { UserRole } from "@careerlink/shared";
import { getNavForRole, LogOut, usesFluidShell } from "./nav-config";
import { Menu, X } from "lucide-react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RoleStrip } from "@/components/layout/role-strip";

function isLinkActive(pathname: string, href: string, role: UserRole) {
  const dashboardRoot = `/dashboard/${role}`;
  if (href === dashboardRoot) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useApp();
  const { t } = useI18n();
  const role = user?.role ?? "student";
  const groups = getNavForRole(role, t);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
    onNavigate?.();
  };

  return (
    <>
      <div className="px-4 py-5 border-b border-border flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={usesFluidShell(role) ? "/feed" : `/dashboard/${role}`} onClick={onNavigate}>
            <Logo size="sm" />
          </Link>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="lg:hidden nq-icon-btn shrink-0 mt-0.5"
          aria-label={t("إغلاق القائمة", "Close menu")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="nav-group-label">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(pathname, link.href, role);
                const isAi = link.href === "/ai";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors border",
                      active
                        ? "nav-active"
                        : "text-text-secondary border-transparent hover:bg-surface-hover hover:text-text",
                      isAi && !active && "text-brand"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-brand dark:text-blue-light" : "opacity-65")} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-hover border border-border">
            <Avatar src={user.avatar} alt={user.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{user.fullName}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("تسجيل الخروج", "Sign out")}
          </button>
        </div>
      )}
    </>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const { t } = useI18n();
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("إغلاق القائمة", "Close menu")}
          className="fixed inset-0 z-40 mobile-nav-overlay lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed right-0 top-0 h-screen w-[18.5rem] dash-sidebar border-l flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}

export function Header({ title, subtitle, actions }: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl md:text-2xl font-bold text-text tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-text-secondary mt-1.5 text-sm leading-relaxed max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn("min-h-screen transition-colors duration-300 nq-canvas")}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="min-h-screen lg:mr-[18.5rem]">
        <AppTopBar />
        <RoleStrip />
        <div className={cn("pb-20 lg:pb-6 shell-wide py-4 md:py-6")}>
          {children}
        </div>
        <MobileNav onOpenMenu={() => setMobileOpen(true)} menuOpen={mobileOpen} />
      </main>
    </div>
  );
}

export function PublicHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/#platform", label: t("المنصة", "Platform") },
    { href: "/jobs", label: t("الوظائف", "Jobs") },
    { href: "/companies", label: t("الشركات", "Companies") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border glass">
      <div className="shell-wide h-full flex items-center justify-between gap-4">
        <Link href="/"><Logo size="sm" /></Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-text-secondary hover:text-text transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch showLabel />
          <ThemeModeSwitch showLabel />
          <Link href="/auth/login" className="hidden sm:inline px-3 py-2 text-sm text-text-secondary hover:text-text">
            {t("دخول", "Sign in")}
          </Link>
          <Link href="/auth/register" className="btn-primary !py-2 !px-4 text-sm hidden sm:inline-flex">
            {t("ابدأ مجاناً", "Start free")}
          </Link>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-border"
            onClick={() => setOpen(!open)}
            aria-label={t("القائمة", "Menu")}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-sm text-text-secondary" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/auth/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>{t("دخول", "Sign in")}</Link>
          <Link href="/auth/register" className="btn-primary w-full justify-center mt-2" onClick={() => setOpen(false)}>{t("ابدأ مجاناً", "Start free")}</Link>
        </div>
      )}
    </header>
  );
}
