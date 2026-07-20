import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui";
import { getApplicationsWithDetails, statusLabels } from "@careerlink/shared";
import { useI18n } from "../../i18n";
import { colors, spacing, radius } from "../../constants/theme";

const STATUS_COLORS: Record<string, string> = {
  applied: colors.blue,
  under_review: colors.amber,
  shortlisted: colors.purple,
  interview_scheduled: colors.cyan,
  accepted: colors.emerald,
  rejected: colors.red,
};

export default function ApplicationsScreen() {
  const { t } = useI18n();
  const apps = getApplicationsWithDetails();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("طلباتي", "My Applications")} subtitle={t(`${apps.length} طلب — تتبع من التقديم للقرار`, `${apps.length} applications — track from submission to decision`)} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {apps.map((app) => (
          <View key={app.id} style={styles.card}>
            <View style={styles.top}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{app.company?.name?.[0] ?? "?"}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{app.job?.title ?? t("فرصة", "Opportunity")}</Text>
                <Text style={styles.company}>{app.company?.name ?? ""}</Text>
              </View>
              {app.matchScore ? (
                <Text style={styles.match}>{app.matchScore}%</Text>
              ) : null}
            </View>
            <View style={styles.footer}>
              <View style={[styles.status, { backgroundColor: (STATUS_COLORS[app.status] ?? colors.blue) + "18" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[app.status] ?? colors.blue }]}>
                  {statusLabels[app.status] ?? app.status}
                </Text>
              </View>
              <Text style={styles.date}>{app.appliedAt}</Text>
            </View>
            {app.status === "interview_scheduled" && (
              <View style={styles.interviewBox}>
                <Ionicons name="videocam" size={16} color={colors.purple} />
                <Text style={styles.interviewText}>{t("مقابلة مجدولة — تحقق من الرسائل", "Interview scheduled — check your messages")}</Text>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 18, fontWeight: "800", color: colors.blue },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: colors.navy },
  company: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  match: { fontSize: 13, fontWeight: "700", color: colors.emerald },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 11, color: colors.textMuted },
  interviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F5F3FF",
    borderRadius: radius.md,
  },
  interviewText: { fontSize: 12, color: colors.purple, fontWeight: "600" },
});
