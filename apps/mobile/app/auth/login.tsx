import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DEMO_PASSWORD, DEMO_ACCOUNTS, useApp } from "../../contexts/app-context";
import { ROLE_LABELS } from "@careerlink/shared";
import { useI18n } from "../../i18n";
import { colors, spacing, radius, shadow } from "../../constants/theme";
import type { UserRole } from "@careerlink/shared";
import { getApiBaseUrl } from "../../services/api-client";

const ROLES: UserRole[] = ["student", "graduate", "company", "hr", "university", "trainer", "mentor", "admin"];

export default function LoginScreen() {
  const { login, apiEnabled } = useApp();
  const { t } = useI18n();
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("student@naqlah.ps");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fillDemo = (r: UserRole) => {
    const demo = DEMO_ACCOUNTS.find((u) => u.role === r);
    if (demo) {
      setRole(r);
      setEmail(demo.email);
      setPassword(DEMO_PASSWORD);
    }
  };

  const handleLogin = async () => {
    setError("");
    setBusy(true);
    const result = await login(email, password, role);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <Ionicons name="trending-up" size={28} color={colors.surface} />
            </View>
            <Text style={styles.brand}>{t("نقلة", "Naqla")}</Text>
            <Text style={styles.tagline}>{t("من بيرزيت والنجاح إلى أول عقد", "From campus to your first contract")}</Text>
            <Text style={styles.sub}>
              {apiEnabled
                ? t(`متصل: ${getApiBaseUrl()}`, `Connected: ${getApiBaseUrl()}`)
                : t("EXPO_PUBLIC_API_URL غير مضبوط", "EXPO_PUBLIC_API_URL is not set")}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("تسجيل الدخول", "Sign In")}</Text>
            <Text style={styles.cardSub}>
              {t("الدخول عبر حسابات قاعدة البيانات (Supabase)", "Sign in with database accounts (Supabase)")}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, role === r && styles.roleChipActive]}
                  onPress={() => fillDemo(r)}
                >
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{ROLE_LABELS[r]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>{t("البريد", "Email")}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@naqlah.ps"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>{t("كلمة المرور", "Password")}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Naqlah@2025"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.loginBtn, busy && { opacity: 0.7 }]}
              onPress={() => void handleLogin()}
              activeOpacity={0.9}
              disabled={busy}
            >
              <Text style={styles.loginBtnText}>{busy ? t("جاري الدخول…", "Signing in…") : t("دخول", "Sign in")}</Text>
              <Ionicons name="arrow-back" size={18} color={colors.surface} />
            </TouchableOpacity>

            <Text style={styles.demoToggleText}>{t("تعبئة سريعة لحسابات الديمو", "Quick-fill demo accounts")}</Text>
            {DEMO_ACCOUNTS.map((u) => (
              <TouchableOpacity key={u.email} style={styles.demoRow} onPress={() => fillDemo(u.role)}>
                <Text style={styles.demoRole}>{ROLE_LABELS[u.role]}</Text>
                <Text style={styles.demoEmail}>{u.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060a14" },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  brandBlock: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadow.glow,
  },
  brand: { fontSize: 36, fontWeight: "800", color: colors.surface, letterSpacing: -1 },
  tagline: { fontSize: 15, color: "rgba(255,255,255,0.75)", marginTop: 6 },
  sub: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 10, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: colors.navy },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  roleScroll: { marginBottom: spacing.md, maxHeight: 44 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  roleChipActive: { backgroundColor: colors.blue, borderColor: colors.blue, ...shadow.glow },
  roleChipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  roleChipTextActive: { color: colors.surface },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  errorText: { flex: 1, fontSize: 13, color: colors.red },
  label: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.cream,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.blue,
    paddingVertical: 16,
    borderRadius: radius.full,
    marginTop: spacing.lg,
    ...shadow.glow,
  },
  loginBtnText: { color: colors.surface, fontWeight: "800", fontSize: 16 },
  demoToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.md, paddingVertical: 8 },
  demoToggleText: { fontSize: 13, color: colors.textMuted },
  demoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoRole: { fontSize: 13, fontWeight: "700", color: colors.navy },
  demoEmail: { fontSize: 11, color: colors.textMuted },
});
