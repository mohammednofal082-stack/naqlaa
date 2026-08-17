import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { StudentProfile } from "@careerlink/shared";
import { colors, radius, spacing } from "../constants/theme";
import { useRemoteData } from "../hooks/use-remote-data";
import { apiPut } from "../services/api-client";
import { useI18n } from "../i18n";

type ProfileBundle = { profile: StudentProfile };

export default function ProfileEditScreen() {
  const { t } = useI18n();
  const { data, loading, refetch } = useRemoteData<ProfileBundle>("profile");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [major, setMajor] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    setHeadline(data.profile.headline ?? "");
    setAbout(data.profile.about ?? "");
    setLocation(data.profile.location ?? "");
    setMajor(data.profile.major ?? "");
    setSkillsText((data.profile.skills ?? []).join(", "));
  }, [data]);

  const save = async () => {
    setBusy(true);
    try {
      await apiPut("profile", {
        headline: headline.trim(),
        about: about.trim(),
        location: location.trim(),
        major: major.trim(),
        skills: skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      await refetch?.();
      Alert.alert(t("تم الحفظ", "Saved"), t("تم تحديث ملفك في قاعدة البيانات.", "Your profile was updated in the database."), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(t("فشل الحفظ", "Save failed"), error instanceof Error ? error.message : "SAVE_FAILED");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>{t("← رجوع", "← Back")}</Text></TouchableOpacity>
        <Text style={styles.title}>{t("تعديل الملف الشخصي", "Edit profile")}</Text>
        <Text style={styles.subtitle}>{t("التعديلات تُحفظ مباشرة في Supabase.", "Changes are saved directly to Supabase.")}</Text>
        {loading ? <Text style={styles.loading}>{t("جاري التحميل...", "Loading...")}</Text> : null}
        <Label text={t("العنوان المهني", "Headline")} />
        <TextInput style={styles.input} value={headline} onChangeText={setHeadline} placeholderTextColor={colors.textMuted} />
        <Label text={t("نبذة", "About")} />
        <TextInput style={[styles.input, styles.multiline]} value={about} onChangeText={setAbout} multiline placeholderTextColor={colors.textMuted} />
        <Label text={t("الموقع", "Location")} />
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor={colors.textMuted} />
        <Label text={t("التخصص", "Major")} />
        <TextInput style={styles.input} value={major} onChangeText={setMajor} placeholderTextColor={colors.textMuted} />
        <Label text={t("المهارات (مفصولة بفاصلة)", "Skills (comma separated)")} />
        <TextInput style={styles.input} value={skillsText} onChangeText={setSkillsText} placeholder="React, SQL, Communication" placeholderTextColor={colors.textMuted} />
        <TouchableOpacity style={[styles.button, busy && styles.disabled]} onPress={() => void save()} disabled={busy}>
          <Text style={styles.buttonText}>{busy ? t("جاري الحفظ…", "Saving…") : t("حفظ التعديلات", "Save changes")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.md, paddingBottom: 40 },
  back: { color: colors.blue, fontWeight: "700", marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: "800", color: colors.navy },
  subtitle: { color: colors.textSecondary, marginTop: 6, marginBottom: spacing.lg },
  loading: { color: colors.textMuted, marginBottom: spacing.md },
  label: { color: colors.navy, fontWeight: "700", marginTop: spacing.sm, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.navy, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  button: { backgroundColor: colors.blue, borderRadius: radius.full, paddingVertical: 15, alignItems: "center", marginTop: spacing.lg },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },
});
