"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/sidebar";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError(t("Supabase غير مُعدّ", "Supabase is not configured"));
      return;
    }
    const supabase = createBrowserClient(url, key);
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError(t("افتح الرابط من رسالة البريد أولاً", "Open the link from your email first"));
    });
  }, [t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "Password must be at least 8 characters"));
      return;
    }
    if (password !== confirm) {
      setError(t("كلمتا المرور غير متطابقتين", "Passwords do not match"));
      return;
    }
    setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createBrowserClient(url, key);
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("فشل التحديث", "Update failed"));
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
            {t("تعيين كلمة مرور جديدة", "Set a new password")}
          </h1>

          {done ? (
            <div className="mt-6 flex gap-2 text-sm text-emerald-600">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {t("تم التحديث — جاري التحويل لتسجيل الدخول", "Updated — redirecting to sign in")}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">{t("كلمة المرور الجديدة", "New password")}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input type="password" required className="pr-10" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!ready} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted mb-1 block">{t("تأكيد", "Confirm")}</label>
                <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={!ready} />
              </div>
              {error && (
                <p className="text-sm text-red-500 flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading || !ready}>
                {loading ? t("جاري الحفظ...", "Saving...") : t("حفظ كلمة المرور", "Save password")}
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
