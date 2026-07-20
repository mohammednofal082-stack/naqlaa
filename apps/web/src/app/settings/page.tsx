"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ThemeSegmented } from "@/components/ui/theme-toggle";
import { useProfile, useSettings, saveSettings } from "@/hooks/data";
import { Bell, Lock, User, Shield, Palette, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const { data: profile } = useProfile();
  const { data: settings, refetch } = useSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveSettings({
        emailNotifications: settings?.emailNotifications ?? true,
        pushNotifications: settings?.pushNotifications ?? true,
        profilePublic: settings?.profilePublic ?? true,
      });
      setMessage(t("تم حفظ الإعدادات", "Settings saved"));
      await refetch();
    } catch {
      setMessage(t("فشل الحفظ", "Failed to save"));
    } finally {
      setSaving(false);
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
                <Input defaultValue={profile?.user.firstName ?? ""} />
              </div>
              <div>
                <label className="text-sm text-text-muted mb-2 block">{t("اسم العائلة", "Last Name")}</label>
                <Input defaultValue={profile?.user.lastName ?? ""} />
              </div>
            </div>
            <div>
              <label className="text-sm text-text-muted mb-2 block">{t("البريد الإلكتروني", "Email Address")}</label>
              <Input defaultValue={profile?.user.email ?? ""} />
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
              <input type="checkbox" defaultChecked={settings?.emailNotifications} />
              {t("إشعارات البريد", "Email notifications")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={settings?.pushNotifications} />
              {t("إشعارات فورية", "Push notifications")}
            </label>
          </div>
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-text-muted" />
            {t("الأمان", "Security")}
          </CardTitle>
          <Input type="password" placeholder={t("كلمة المرور الجديدة", "New password")} className="mb-3" />
          <Button variant="outline">{t("تحديث كلمة المرور", "Update Password")}</Button>
        </Card>

        <Card>
          <CardTitle className="font-display mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-text-muted" />
            {t("الخصوصية", "Privacy")}
          </CardTitle>
          <Select defaultValue="public" className="mb-4">
            <option value="public">{t("ملفي عام", "Public profile")}</option>
            <option value="connections">{t("للجهات المعتمدة فقط", "Approved contacts only")}</option>
            <option value="private">{t("خاص", "Private")}</option>
          </Select>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("حفظ التغييرات", "Save Changes")}
          </Button>
          {message && <p className="text-sm text-emerald mt-2">{message}</p>}
        </Card>
      </div>
    </DashboardLayout>
  );
}
