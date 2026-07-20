"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/sidebar";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { validatePassword } from "@/lib/auth/password";
import { INDUSTRIES } from "@careerlink/shared";
import { useI18n } from "@/i18n";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const REGISTER_ROLES = [
    { value: "student", label: t("طالب", "Student") },
    { value: "graduate", label: t("خريج", "Graduate") },
    { value: "company", label: t("شركة", "Company") },
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
    password: "",
    confirmPassword: "",
    university: "uni-birzeit",
    major: "",
    companyName: "",
    industry: "",
  });

  const pwValidation = validatePassword(form.password);

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
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: type,
        university: form.university,
        major: form.major,
        companyName: form.companyName,
        industry: form.industry,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSuccess(data.message);
    setTimeout(() => router.push(data.redirect), 1500);
  };

  return (
    <div className="min-h-screen bg-cream dot-grid">
      <PublicHeader />
      <div className="pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="p-8">
            <div className="text-center mb-6">
              <Logo size="md" className="justify-center mb-4" />
              <h1 className="text-2xl font-bold text-navy">{t("إنشاء حساب", "Create account")}</h1>
              <p className="text-text-secondary text-sm mt-1">{t("انضم لمنصة نقلة", "Join the Naqla platform")}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {REGISTER_ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setType(r.value)}
                  className={`flex-1 min-w-[80px] py-2 rounded-lg text-sm font-medium transition-all ${
                    type === r.value ? "gradient-bg text-white" : "bg-slate-100 text-text-secondary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">{t("الاسم الكامل", "Full name")}</label>
                <Input placeholder={t("محمد نوفل", "Mohammed Nofal")} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">{t("البريد الإلكتروني", "Email")}</label>
                <Input type="email" placeholder="email@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              {(type === "student" || type === "graduate") && (
                <>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("الجامعة", "University")}</label>
                    <Select value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
                      <option value="uni-birzeit">{t("جامعة بيرزيت", "Birzeit University")}</option>
                      <option value="uni-najah">{t("جامعة النجاح الوطنية", "An-Najah National University")}</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("التخصص", "Major")}</label>
                    <Input placeholder={t("علوم الحاسوب", "Computer Science")} value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
                  </div>
                </>
              )}

              {type === "company" && (
                <>
                  <div>
                    <label className="text-sm text-text-secondary mb-2 block">{t("اسم الشركة", "Company name")}</label>
                    <Input placeholder={t("اسم الشركة", "Company name")} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
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
              {t("لديك حساب؟", "Already have an account?")} <Link href="/auth/login" className="text-blue hover:underline font-medium">{t("سجّل دخول", "Sign in")}</Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
