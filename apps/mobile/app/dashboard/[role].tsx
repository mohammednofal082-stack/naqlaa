import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getRoleExperienceBase, ROLE_LABELS, type UserRole } from "@careerlink/shared";
import { AccentMap, ScenarioCard, StatCard } from "../components/role-ui";
import { useApp } from "../contexts/app-context";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

const VALID_ROLES: UserRole[] = ["company", "hr", "university", "trainer", "mentor", "admin", "graduate"];

export default function RoleDashboardScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role: string }>();
  const { user } = useApp();
  const { t } = useI18n();
  const role = (VALID_ROLES.includes(roleParam as UserRole) ? roleParam : user?.role ?? "company") as UserRole;
  const exp = getRoleExperienceBase(role);
  const accent = AccentMap[exp.accentKey] ?? colors.blue;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t(`لوحة ${ROLE_LABELS[role]}`, `${ROLE_LABELS[role]} Dashboard`)}</Text>
          <Text style={styles.headerSub}>{exp.tagline}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: accent + "15", borderColor: accent + "30" }]}>
          <Text style={styles.bannerIcon}>{exp.icon}</Text>
          <Text style={styles.bannerMantra}>{exp.mantra}</Text>
          <Text style={styles.bannerFocus}>{exp.primaryFocus.join(" · ")}</Text>
        </View>

        <View style={styles.stats}>
          <StatCard label={t("مهام", "Tasks")} value={6} color={accent} />
          <StatCard label={t("معلّق", "Pending")} value={2} color={colors.amber} />
          <StatCard label={t("مكتمل", "Completed")} value={14} color={colors.emerald} />
          <StatCard label={t("تنبيهات", "Alerts")} value={3} color={colors.purple} />
        </View>

        <Text style={styles.section}>{t(`سيناريوهات ${ROLE_LABELS[role]}`, `${ROLE_LABELS[role]} scenarios`)}</Text>
        {exp.scenarios.map((s) => (
          <ScenarioCard key={s.title} scenario={s} accentColor={accent} onPress={() => router.push(s.mobileRoute as never)} fullWidth />
        ))}

        <Text style={styles.hint}>{t("النسخة الكاملة متاحة على الويب — نفس الصلاحيات والبيانات", "The full version is available on the web — same permissions and data")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  headerSub: { fontSize: 12, color: colors.textMuted },
  content: { padding: spacing.md, paddingBottom: 40 },
  banner: { borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, marginBottom: spacing.md, alignItems: "center" },
  bannerIcon: { fontSize: 32 },
  bannerMantra: { fontSize: 14, fontWeight: "700", color: colors.navy, marginTop: 8, textAlign: "center" },
  bannerFocus: { fontSize: 11, color: colors.textMuted, marginTop: 6, textAlign: "center" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  section: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: spacing.lg, lineHeight: 18 },
});
