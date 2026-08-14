"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/sidebar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { roleLabel } from "@/i18n/labels";
import { getDemoCredentials, ROLE_DASHBOARD_PATHS, type UserRole } from "@careerlink/shared";
import { Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, ChevronDown } from "lucide-react";

const ROLES: UserRole[] = ['student', 'graduate', 'company', 'hr', 'university', 'trainer', 'mentor', 'admin'];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPass, setShowPass] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qRole = searchParams.get("role") as UserRole | null;
    const qPending = searchParams.get("pending");
    if (qEmail) setEmail(qEmail);
    if (qRole && ROLES.includes(qRole)) setRole(qRole);
    if (qPending === "1") {
      setInfo(t("تم إنشاء حسابك — بانتظار موافقة مدير النظام قبل تسجيل الدخول", "Your account was created — waiting for admin approval before you can sign in"));
    }
  }, [searchParams, t]);

  const demoUsers = getDemoCredentials();

  const fillDemo = (r: UserRole) => {
    const demo = demoUsers.find((d) => d.role === r);
    if (demo) {
      setEmail(demo.email);
      setPassword("Naqlah@2025");
      setRole(r);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(result.redirect || ROLE_DASHBOARD_PATHS[role] || `/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-[var(--li-bg)] relative">
      <PublicHeader />
      <div className="pt-[72px] pb-10 px-3 sm:px-4 min-h-screen flex items-start sm:items-center justify-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
          <Card className="p-5 sm:p-7 !rounded-lg shadow-card">
            <div className="text-center mb-6">
              <Logo size="md" className="justify-center mb-4" />
              <h1 className="font-display text-2xl font-bold text-text">{t("تسجيل الدخول", "Sign in")}</h1>
              <p className="text-text-muted text-sm mt-1">{t("ادخل بحسابك للمتابعة", "Sign in with your account to continue")}</p>
            </div>

            {info && !error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {info}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">{t("البريد الإلكتروني", "Email")}</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input type="email" className="pr-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">{t("كلمة المرور", "Password")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-end">
                  <Link href="/auth/forgot-password" className="text-xs text-brand hover:underline">
                    {t("نسيت كلمة المرور؟", "Forgot password?")}
                  </Link>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">{t("الدور", "Role")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-2 py-2 rounded-lg text-xs border transition-colors ${
                        role === r ? "bg-brand text-white border-brand" : "border-border text-text-secondary hover:bg-surface-hover"
                      }`}
                    >
                      {roleLabel(r, t)}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  {t("اختر نفس الدور الذي سجّلت به. إن اختلف، سنستخدم دور حسابك تلقائياً.", "Pick the role you registered with. If it differs, we will use your account role automatically.")}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("جاري الدخول...", "Signing in...") : t("دخول", "Sign in")}
                <Arrow className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="mt-2 w-full flex items-center justify-between text-sm text-text-muted hover:text-text transition-colors py-2"
              >
                {t("حسابات العرض التجريبي", "Demo accounts")}
                <ChevronDown className={`w-4 h-4 transition-transform ${showDemo ? "rotate-180" : ""}`} />
              </button>
              {showDemo && (
                <div className="space-y-1.5 pb-2">
                  {demoUsers.map((d) => (
                    <button
                      key={d.role}
                      type="button"
                      onClick={() => fillDemo(d.role)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface-hover hover:border-border-strong text-start text-sm"
                    >
                      <span className="text-xs text-text-muted">{d.email}</span>
                      <span className="font-medium text-text">{roleLabel(d.role, t)}</span>
                    </button>
                  ))}
                  <p className="text-xs text-text-muted pt-1">{t("كلمة المرور:", "Password:")} Naqlah@2025</p>
                </div>
              )}

              <p className="text-center text-sm text-text-muted mt-6">
                {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
                <Link href="/auth/register" className="text-brand hover:underline font-medium">{t("سجّل الآن", "Register now")}</Link>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen page-canvas" />}>
      <LoginForm />
    </Suspense>
  );
}
