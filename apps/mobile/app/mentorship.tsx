import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { mentorProfiles, mentorshipSessions } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

export default function MentorshipScreen() {
  const { t, locale } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الإرشاد المهني", "Career Mentorship")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>{t("جلساتك", "Your sessions")}</Text>
        {mentorshipSessions.slice(0, 3).map((s) => (
          <View key={s.id} style={styles.sessionCard}>
            <Text style={styles.sessionTopic}>{s.topic}</Text>
            <Text style={styles.sessionDate}>{new Date(s.scheduledAt).toLocaleString(locale === "ar" ? "ar-PS" : "en-US")}</Text>
            <Text style={styles.sessionStatus}>{s.status === "accepted" ? t("مؤكدة", "Confirmed") : s.status}</Text>
          </View>
        ))}
        <Text style={styles.section}>{t("مرشدون متاحون", "Available mentors")}</Text>
        {mentorProfiles.map((m) => (
          <View key={m.userId} style={styles.card}>
            <Text style={styles.name}>{m.currentTitle}</Text>
            <Text style={styles.headline}>{m.expertiseArea}</Text>
            <Text style={styles.expertise}>{t(`${m.experienceYears} سنة خبرة · ★ ${m.rating}`, `${m.experienceYears} years of experience · ★ ${m.rating}`)}</Text>
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookText}>{t("احجز جلسة", "Book a session")}</Text>
            </TouchableOpacity>
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
  section: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm, marginTop: spacing.sm },
  sessionCard: { backgroundColor: "#FDF2F8", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: "#FBCFE8" },
  sessionTopic: { fontSize: 14, fontWeight: "700", color: colors.navy },
  sessionDate: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sessionStatus: { fontSize: 11, fontWeight: "700", color: "#EC4899", marginTop: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 15, fontWeight: "700", color: colors.navy },
  headline: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  expertise: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  bookBtn: { marginTop: 10, backgroundColor: "#EC4899", paddingVertical: 10, borderRadius: radius.full, alignItems: "center" },
  bookText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
});
