import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getJobsWithCompany } from "@careerlink/shared";
import { useI18n } from "../../i18n";
import { colors, spacing, radius } from "../../constants/theme";

export default function JobDetailScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = getJobsWithCompany().find((j) => j.id === id);

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{t("الوظيفة غير موجودة", "This job was not found")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("تفاصيل الفرصة", "Opportunity Details")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{job.company.name[0]}</Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company.name} · {job.company.industry}</Text>
          {job.matchPercentage ? (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{t(`تطابق ${job.matchPercentage}%`, `${job.matchPercentage}% match`)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{job.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={16} color={colors.emerald} />
            <Text style={styles.metaText}>${job.salaryMin}–${job.salaryMax}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("الوصف", "Description")}</Text>
        <Text style={styles.body}>{job.description}</Text>

        <Text style={styles.sectionTitle}>{t("المهارات المطلوبة", "Required skills")}</Text>
        <View style={styles.skills}>
          {job.skills.map((s) => (
            <View key={s} style={styles.skill}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={() => router.push("/(tabs)/applications")}>
          <Text style={styles.applyText}>{t("تقديم سريع", "Quick apply")}</Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.surface} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: 12 },
  backBtn: { padding: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 16, fontWeight: "800", color: colors.navy },
  content: { padding: spacing.md, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: spacing.lg },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: colors.creamDark, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  logoText: { fontSize: 24, fontWeight: "800", color: colors.blue },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy, textAlign: "center" },
  company: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  matchBadge: { marginTop: 12, backgroundColor: colors.emerald + "18", paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full },
  matchText: { color: colors.emerald, fontWeight: "800", fontSize: 13 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: spacing.lg },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: 8, marginTop: 8 },
  body: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.lg },
  skill: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  skillText: { fontSize: 12, fontWeight: "600", color: colors.navy },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.blue, paddingVertical: 16, borderRadius: radius.full, marginTop: spacing.md },
  applyText: { color: colors.surface, fontWeight: "800", fontSize: 16 },
  error: { textAlign: "center", marginTop: 40, color: colors.red },
});
