"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/sidebar";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useI18n } from "@/i18n";
import { roleLabel } from "@/i18n/labels";
import { getDemoCredentials, type UserRole } from "@careerlink/shared";
import { Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, ChevronDown } from "lucide-react";

const ROLES: UserRole[] = ['student', 'graduate', 'company', 'hr', 'university', 'trainer', 'mentor', 'admin'];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPass, setShowPass] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    router.push(role === "student" || role === "graduate" ? "/feed" : (result.redirect || `/dashboard/${role}`));
  };

  return (
    <div className="min-h-screen page-canvas relative">
      <AmbientBackground variant="auth" />
      <PublicHeader />
      <div className="pt-24 pb-12 px-4 min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <div className="sticky top-24 space-y-6">
              <Logo size="lg" />
              <div className="nq-glass-premium rounded-2xl p-6">
                <p className="text-xs font-semibold text-brand mb-2">{t("مشروع تخرج · جامعة النجاح الوطنية ٢٠٢٦", "Graduation Project · An-Najah National University 2026")}</p>
                <h2 className="font-display text-2xl font-bold text-text mb-2">
                  {t("منصة", "The")} <span className="nq-gradient-text">{t("نقلة", "Naqla")}</span> {t("— جاهزة للعرض", "platform — ready for demo")}
                </h2>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {t("بعد تسجيل الدخول ستصل مباشرة إلى المنشورات، البحث، والدردشة — مع لوحة تحكم كاملة لكل دور.", "After signing in you'll go straight to posts, search, and chat — with a full dashboard for every role.")}
                </p>
              </div>
              <ul className="space-y-3 text-sm text-text-secondary">
                {[
                  t("المنشورات والمجتمع المهني", "Posts and the professional community"),
                  t("وظائف وتدريب مع تطابق مهارات", "Jobs and internships with skill matching"),
                  t("دردشة وتوصيات مخصصة لك", "Chat and recommendations tailored to you"),
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex gap-3 items-center p-3 rounded-xl border border-border bg-surface/60 backdrop-blur-sm"
                  >
                    <span className="w-7 h-7 rounded-lg bg-brand/10 text-brand font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <Link href="/workflows" className="inline-flex text-sm font-semibold text-brand hover:underline">
                {t("← شاهد السيناريوهات السبعة للمناقشة", "→ View the seven demo scenarios")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="p-6 md:p-8 nq-glass-premium border-border/80 shadow-elevated">
              <div className="text-center mb-6 lg:hidden">
                <Logo size="md" className="justify-center mb-4" />
              </div>
              <h1 className="text-xl font-bold text-text mb-1">{t("تسجيل الدخول", "Sign in")}</h1>
              <p className="text-text-secondary text-sm mb-5">{t("اختر دورك ثم أدخل بيانات الحساب التجريبي", "Choose your role, then enter the demo account details")}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); fillDemo(r); }}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
                      role === r
                        ? "bg-brand text-white border-brand shadow-glow"
                        : "bg-surface border-border text-text-secondary hover:bg-surface-hover hover:border-border-strong"
                    }`}
                  >
                    {roleLabel(r, t)}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary mb-1.5 block">{t("البريد الإلكتروني", "Email")}</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input type="email" placeholder="email@naqlah.ps" className="pr-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                </div>
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {t("دخول", "Sign in")}
                  <Arrow className="w-4 h-4" />
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="mt-5 w-full flex items-center justify-between text-sm text-text-muted hover:text-text transition-colors py-2"
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
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
