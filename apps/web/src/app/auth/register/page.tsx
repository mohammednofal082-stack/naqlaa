"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/sidebar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { validatePassword } from "@/backend/auth/password";
import {
  INDUSTRIES,
  OTHER_UNIVERSITY_ID,
  PALESTINIAN_UNIVERSITIES,
  resolveUniversityEmailDomain,
} from "@careerlink/shared";
import { useI18n } from "@/i18n";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useApp();
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const REGISTER_ROLES = [
    { value: "student", label: t("طالب", "Student") },
    { value: "graduate", label: t("خريج", "Graduate") },
    { value: "company", label: t("شركة", "Company") },
    { value: "university", label: t("جامعة", "University") },
    { value: "trainer", label: t("مدرب", "Trainer") },
    { value: "mentor", label: t("مرشد مهني", "Mentor") },
  ];
  const [type, setType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    emailLocal: "",
    password: "",
    confirmPassword: "",
    university: "uni-birzeit",
    universityName: "",
    major: "",
    companyName: "",
    industry: "",
  });

  const pwValidation = validatePassword(form.password);
  const isCampusRole = type === "student" || type === "graduate";
  const emailDomain = useMemo(
    () => resolveUniversityEmailDomain(form.university, form.universityName),
    [form.university, form.universityName],
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError(t("كلمتا المرور غير متطابقتين", "Passwords do not match"));
      return;
    }
    if (!pwValidation.valid) {
      setError(pwValidation.errors[0]);
      return;
    }
    if (isCampusRole && form.university === OTHER_UNIVERSITY_ID && !form.universityName.trim()) {
      setError(t("أدخل اسم الجامعة بالإنجليزية", "Enter the university name in English"));
      return;
    }
    if (isCampusRole && !form.emailLocal.trim()) {
      setError(t("أدخل الجزء الأول من البريد الجامعي", "Enter the local part of your university email"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: isCampusRole ? undefined : form.email,
        emailLocal: isCampusRole ? form.emailLocal : undefined,
        password: form.password,
        role: type,
        university: isCampusRole ? form.university : undefined,
        universityName:
          type === "university"
            ? form.universityName || form.companyName
            : form.university === OTHER_UNIVERSITY_ID
              ? form.universityName
              : undefined,
        major: form.major,
        companyName: type === "company" ? form.companyName : type === "university" ? form.universityName : undefined,
        industry: form.industry,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t("فشل التسجيل", "Registration failed"));
      return;
    }
    setSuccess(data.message || t("تم إنشاء الحساب", "Account created"));
    if (!data.pending) await refresh();
    const target = data.redirect || `/auth/login?email=${encodeURIComponent(form.email)}&role=${type}`;
    setTimeout(() => router.push(target), 900);
  };

  return (
    <div className="min-h-screen bg-[var(--li-bg)]">
      <PublicHeader />
      <div className="pt-[72px] pb-12 px-3 sm:px-6 flex items-start sm:items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="p-5 sm:p-8 !rounded-lg shadow-card">
            <div className="text-center mb-6">
              <Logo size="md" className="justify-center mb-4" />
              <h1 className="text-2xl font-bold text-text">{t("إنشاء حساب", "Create account")}</h1>
              <p className="text-text-secondary text-sm mt-1">{t("انضم لمنصة نقلة", "Join the Naqla platform")}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {REGISTER_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setType(r.value)}
                  className={`flex-1 min-w-[72px] py-2 rounded-md text-sm font-medium transition-all ${
                    type === r.value ? "bg-brand text-white" : "bg-surface-hover text-text-secondary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">{t("الاسم الكامل", "Full name")}</label>
                <Input placeholder={t("محمد نوفل", "Mohammed Nofal")} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>

              {isCampusRole ? (
                <>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("الجامعة", "University")}</label>
                    <Select value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
                      {PALESTINIAN_UNIVERSITIES.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                      <option value={OTHER_UNIVERSITY_ID}>{t("أخرى", "Other")}</option>
                    </Select>
                  </div>
                  {form.university === OTHER_UNIVERSITY_ID && (
                    <div>
                      <label className="text-sm text-text-secondary mb-2 block">{t("اسم الجامعة (بالإنجليزية)", "University name (English)")}</label>
                      <Input
                        placeholder="Example University"
                        value={form.universityName}
                        onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("البريد الجامعي", "University email")}</label>
                    <div className="flex items-stretch gap-0 rounded-md border border-border overflow-hidden bg-surface focus-within:ring-2 focus-within:ring-brand/30">
                      <Input
                        className="!border-0 !rounded-none !shadow-none focus-visible:!ring-0"
                        placeholder="name"
                        value={form.emailLocal}
                        onChange={(e) => setForm({ ...form, emailLocal: e.target.value.replace(/\s/g, "") })}
                        required
                        autoCapitalize="off"
                        autoCorrect="off"
                      />
                      <span className="shrink-0 px-3 flex items-center text-sm text-text-muted bg-surface-hover border-s border-border whitespace-nowrap">
                        @{emailDomain || "…"}.stu
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1.5">
                      {t("يُبنى البريد من اسم الجامعة بدون كلمة University ثم .stu", "Email uses the university name without “University”, then .stu")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("التخصص", "Major")}</label>
                    <Input placeholder={t("علوم الحاسوب", "Computer Science")} value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">{t("البريد الإلكتروني", "Email")}</label>
                  <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              )}

              {type === "company" && (
                <>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("اسم الشركة", "Company name")}</label>
                    <Input placeholder={t("اسم الشركة", "Company name")} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("المجال", "Industry")}</label>
                    <Select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                      <option value="">{t("اختر المجال", "Choose an industry")}</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                      ))}
                    </Select>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    {t("حسابات الشركات تحتاج موافقة مدير النظام قبل تسجيل الدخول.", "Company accounts need admin approval before sign-in.")}
                  </p>
                </>
              )}

              {type === "university" && (
                <>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("اسم الجامعة (بالإنجليزية)", "University name (English)")}</label>
                    <Input
                      placeholder="Birzeit University"
                      value={form.universityName}
                      onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    {t("حسابات الجامعات تحتاج موافقة مدير النظام قبل تسجيل الدخول.", "University accounts need admin approval before sign-in.")}
                  </p>
                </>
              )}

              <div>
                <label className="text-sm text-text-secondary mb-2 block">{t("كلمة المرور", "Password")}</label>
                <Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                {form.password && (
                  <ul className="mt-2 space-y-1">
                    {pwValidation.errors.map((err) => (
                      <li key={err} className="text-xs text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        {err}
                      </li>
                    ))}
                    {pwValidation.valid && (
                      <li className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {t("كلمة مرور قوية", "Strong password")}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">{t("تأكيد كلمة المرور", "Confirm password")}</label>
                <Input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {t("إنشاء الحساب", "Create account")}
                <Arrow className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              {t("لديك حساب؟", "Already have an account?")}{" "}
              <Link href="/auth/login" className="text-brand hover:underline font-medium">{t("سجّل دخول", "Sign in")}</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
