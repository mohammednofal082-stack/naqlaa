import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { OTHER_UNIVERSITY_ID, PALESTINIAN_UNIVERSITIES } from "@careerlink/shared";
import { colors, radius, spacing } from "../../constants/theme";
import { apiRegister } from "../../services/api-client";
import { useI18n } from "../../i18n";

type TalentRole = "student" | "graduate";

export default function RegisterScreen() {
  const { t } = useI18n();
  const [role, setRole] = useState<TalentRole>("student");
  const [fullName, setFullName] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [password, setPassword] = useState("");
  const [major, setMajor] = useState("");
  const [university, setUniversity] = useState(PALESTINIAN_UNIVERSITIES[0]?.id ?? "");
  const [customUniversity, setCustomUniversity] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedUniversity = useMemo(
    () => PALESTINIAN_UNIVERSITIES.find((item) => item.id === university),
    [university],
  );
  const emailDomain = selectedUniversity?.emailDomain
    ?? customUniversity.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/university$/, "")
    ?? "";

  const register = async () => {
    if (!fullName.trim() || !emailLocal.trim() || !password || !university) {
      Alert.alert(t("بيانات ناقصة", "Missing details"), t("أكمل الحقول المطلوبة.", "Complete the required fields."));
      return;
    }
    if (university === OTHER_UNIVERSITY_ID && !customUniversity.trim()) {
      Alert.alert(t("اسم الجامعة مطلوب", "University name required"), t("أدخل اسم الجامعة بالإنجليزية.", "Enter the university name in English."));
      return;
    }

    setBusy(true);
    try {
      const result = await apiRegister({
        fullName: fullName.trim(),
        emailLocal: emailLocal.trim(),
        password,
        role,
        university,
        universityName: university === OTHER_UNIVERSITY_ID ? customUniversity.trim() : undefined,
        major: major.trim() || undefined,
      });
      Alert.alert(t("تم إنشاء الحساب", "Account created"), result.message ?? t("يمكنك الآن تسجيل الدخول.", "You can now sign in."), [
        { text: t("تسجيل الدخول", "Sign in"), onPress: () => router.replace("/auth/login") },
      ]);
    } catch (error) {
      Alert.alert(t("تعذر إنشاء الحساب", "Could not create account"), error instanceof Error ? error.message : "REGISTER_FAILED");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>{t("← رجوع", "← Back")}</Text></TouchableOpacity>
          <Text style={styles.title}>{t("إنشاء حساب طالب أو خريج", "Create a student or graduate account")}</Text>
          <Text style={styles.subtitle}>{t("بياناتك تحفظ في قاعدة بيانات نقلة.", "Your details are saved in the Naqla database.")}</Text>

          <View style={styles.roleRow}>
            {(["student", "graduate"] as TalentRole[]).map((item) => (
              <TouchableOpacity key={item} style={[styles.role, role === item && styles.roleActive]} onPress={() => setRole(item)}>
                <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{t(item === "student" ? "طالب" : "خريج", item === "student" ? "Student" : "Graduate")}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text={t("الاسم الكامل", "Full name")} />
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder={t("مثال: سارة أحمد", "Example: Sara Ahmad")} placeholderTextColor={colors.textMuted} />
          <Label text={t("التخصص (اختياري)", "Major (optional)")} />
          <TextInput style={styles.input} value={major} onChangeText={setMajor} placeholder={t("مثال: علوم الحاسوب", "Example: Computer Science")} placeholderTextColor={colors.textMuted} />
          <Label text={t("الجامعة", "University")} />
          <View style={styles.universities}>
            {PALESTINIAN_UNIVERSITIES.map((item) => (
              <TouchableOpacity key={item.id} style={[styles.university, university === item.id && styles.universityActive]} onPress={() => setUniversity(item.id)}>
                <Text style={[styles.universityText, university === item.id && styles.universityTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.university, university === OTHER_UNIVERSITY_ID && styles.universityActive]} onPress={() => setUniversity(OTHER_UNIVERSITY_ID)}>
              <Text style={[styles.universityText, university === OTHER_UNIVERSITY_ID && styles.universityTextActive]}>{t("أخرى", "Other")}</Text>
            </TouchableOpacity>
          </View>
          {university === OTHER_UNIVERSITY_ID ? (
            <TextInput style={styles.input} value={customUniversity} onChangeText={setCustomUniversity} placeholder="University name in English" placeholderTextColor={colors.textMuted} autoCapitalize="words" />
          ) : null}
          <Label text={t("البريد الجامعي", "University email")} />
          <TextInput style={styles.input} value={emailLocal} onChangeText={setEmailLocal} placeholder={t("الجزء قبل @", "Part before @")} placeholderTextColor={colors.textMuted} autoCapitalize="none" />
          <Text style={styles.emailPreview}>{emailLocal.trim() || "name"}@{emailDomain || "university"}.stu</Text>
          <Label text={t("كلمة المرور", "Password")} />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={t("8 أحرف على الأقل", "At least 8 characters")} placeholderTextColor={colors.textMuted} secureTextEntry />
          <TouchableOpacity style={[styles.button, busy && styles.disabled]} onPress={() => void register()} disabled={busy}>
            <Text style={styles.buttonText}>{busy ? t("جاري الإنشاء…", "Creating…") : t("إنشاء الحساب", "Create account")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  back: { color: colors.blue, fontWeight: "700", marginBottom: spacing.md },
  title: { fontSize: 24, fontWeight: "800", color: colors.navy },
  subtitle: { color: colors.textSecondary, marginTop: 6, marginBottom: spacing.lg },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: spacing.md },
  role: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: "center", paddingVertical: 11, backgroundColor: colors.surface },
  roleActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  roleText: { fontWeight: "700", color: colors.textSecondary },
  roleTextActive: { color: colors.surface },
  label: { color: colors.navy, fontWeight: "700", marginTop: spacing.sm, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.navy, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  universities: { gap: 7 },
  university: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 10 },
  universityActive: { backgroundColor: "#EFF6FF", borderColor: colors.blue },
  universityText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  universityTextActive: { color: colors.blue },
  emailPreview: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  button: { backgroundColor: colors.blue, borderRadius: radius.full, paddingVertical: 15, alignItems: "center", marginTop: spacing.lg },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },
});
