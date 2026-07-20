"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";

export default function DashboardRedirect() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, loading } = useApp();

  useEffect(() => {
    if (loading) return;
    if (user?.role) {
      router.replace(`/dashboard/${user.role}`);
    } else {
      router.replace("/auth/login");
    }
  }, [router, user, loading]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="nq-page-enter flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-muted">{t("جاري تحويلك إلى لوحتك...", "Redirecting you to your dashboard...")}</p>
      </div>
    </div>
  );
}
