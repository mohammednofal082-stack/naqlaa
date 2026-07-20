import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getInternshipsWithCompany, internshipRequests, internshipStatusLabels } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

export default function InternshipsScreen() {
  const { t } = useI18n();
  const items = getInternshipsWithCompany();
  const requests = internshipRequests;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("التدريب العملي", "Practical Training")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>{t("سيناريو: طلب → اعتماد جامعة → تقارير أسبوعية → تقييم شركة", "Scenario: request → university accreditation → weekly reports → company evaluation")}</Text>

        <Text style={styles.section}>{t("طلبات الاعتماد", "Accreditation requests")}</Text>
        {requests.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.status}>{internshipStatusLabels[r.status] ?? r.status}</Text>
            <Text style={styles.duration}>{r.startDate} — {r.endDate}</Text>
          </View>
        ))}

        <Text style={styles.section}>{t("فرص تدريب", "Training opportunities")}</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.company}>{item.company.name}</Text>
            <Text style={styles.duration}>{item.duration} · {item.location}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  content: { padding: spacing.md },
  intro: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  section: { fontSize: 15, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 15, fontWeight: "700", color: colors.navy },
  company: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  status: { fontSize: 12, fontWeight: "700", color: colors.cyan },
  duration: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
