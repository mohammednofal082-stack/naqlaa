"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/sidebar";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل الإرسال", "Failed to send"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-canvas relative">
      <AmbientBackground variant="auth" />
      <PublicHeader />
      <div className="pt-24 pb-12 px-4 min-h-screen flex items-center justify-center relative z-10">
        <Card className="w-full max-w-md p-6">
          <Logo size="sm" />
          <h1 className="font-display text-xl font-bold text-text mt-4">
            {t("استعادة كلمة المرور", "Reset password")}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t("أدخل بريدك وسنرسل رابط إعادة التعيين عبر Supabase Auth.", "Enter your email and we will send a reset link via Supabase Auth.")}
          </p>

          {done ? (
            <div className="mt-6 flex gap-2 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {t("إذا كان الحساب موجوداً، ستصلك رسالة قريباً.", "If the account exists, you will receive an email shortly.")}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">{t("البريد", "Email")}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="email"
                    required
                    className="pr-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("جاري الإرسال...", "Sending...") : t("إرسال الرابط", "Send reset link")}
                <Arrow className="w-4 h-4" />
              </Button>
            </form>
          )}

          <Link href="/auth/login" className="block text-sm text-brand mt-4 hover:underline">
            {t("العودة لتسجيل الدخول", "Back to sign in")}
          </Link>
        </Card>
      </div>
    </div>
  );
}
