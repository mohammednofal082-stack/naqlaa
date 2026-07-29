"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ThemeSegmented } from "@/components/ui/theme-toggle";
import { useProfile, useSettings, saveSettings } from "@/hooks/data";
import { Bell, Lock, User, Shield, Palette, Loader2, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const { data: profile } = useProfile();
  const { data: settings, refetch } = useSettings();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState("public");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!settings) return;
    setEmailNotifications(settings.emailNotifications);
    setPushNotifications(settings.pushNotifications);
    setProfilePublic(settings.profilePublic ? "public" : "private");
  }, [settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await saveSettings({
        emailNotifications,
        pushNotifications,
        profilePublic: profilePublic === "public",
      });
      setMessage(t("تم حفظ الإعدادات", "Settings saved"));
      await refetch();
    } catch {
      setError(t("فشل الحفظ", "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    setError("");
    setMessage("");
    if (newPassword.length < 8) {
      setError(t("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "Password must be at least 8 characters"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("كلمتا المرور غير متطابقتين", "Passwords do not match"));
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(t("تم تحديث كلمة المرور", "Password updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل تحديث كلمة المرور", "Failed to update password"));
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Header title={t("الإعدادات", "Settings")} subtitle={t("إدارة حسابك وتفضيلات العرض", "Manage your account and display preferences")} />

      <div className="nq-page-enter mt-6 max-w-2xl space-y-5">
        <Card className="nq-gradient-panel">
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue" />
            {t("المظهر", "Appearance")}
          </CardTitle>
          <ThemeSegmented />
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-text-muted" />
            {t("الحساب", "Account")}
          </CardTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-muted mb-2 block">{t("الاسم الأول", "First Name")}</label>
                <Input value={profile?.user.firstName ?? ""} readOnly />
              </div>
              <div>
                <label className="text-sm text-text-muted mb-2 block">{t("اسم العائلة", "Last Name")}</label>
                <Input value={profile?.user.lastName ?? ""} readOnly />
              </div>
            </div>
            <div>
              <label className="text-sm text-text-muted mb-2 block">{t("البريد الإلكتروني", "Email Address")}</label>
              <Input value={profile?.user.email ?? ""} readOnly />
            </div>
            <Link href="/profile/edit">
              <Button variant="outline">{t("تعديل الملف الكامل", "Edit Full Profile")}</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-text-muted" />
            {t("الإشعارات", "Notifications")}
          </CardTitle>
          <div className="space-y-3 text-sm text-text-secondary">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
              {t("إشعارات البريد", "Email notifications")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
              {t("إشعارات فورية", "Push notifications")}
            </label>
          </div>
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-text-muted" />
            {t("الأمان", "Security")}
          </CardTitle>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t("كلمة المرور الجديدة", "New password")} className="mb-3" />
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("تأكيد كلمة المرور", "Confirm password")} className="mb-3" />
          <Button variant="outline" onClick={() => void handlePassword()} disabled={pwdSaving}>
            {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("تحديث كلمة المرور", "Update Password")}
          </Button>
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-text-muted" />
            {t("الخصوصية", "Privacy")}
          </CardTitle>
          <Select value={profilePublic} onChange={(e) => setProfilePublic(e.target.value)} className="mb-4">
            <option value="public">{t("ملفي عام", "Public profile")}</option>
            <option value="private">{t("خاص", "Private")}</option>
          </Select>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("حفظ التغييرات", "Save Changes")}
          </Button>
          {message && <p className="text-sm text-emerald mt-2">{message}</p>}
          {error && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
