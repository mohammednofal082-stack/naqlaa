import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { MentorProfile, MentorshipSession } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";
import { useRemoteData } from "../hooks/use-remote-data";

export default function MentorshipScreen() {
  const { t, locale } = useI18n();
  const { data: mentors, loading: mentorsLoading, error: mentorsError } = useRemoteData<MentorProfile[]>("mentors");
  const { data: sessions, loading: sessionsLoading } = useRemoteData<MentorshipSession[]>("mentorship");
  const loading = mentorsLoading || sessionsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الإرشاد المهني", "Career Mentorship")}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.blue} />
      ) : mentorsError ? (
        <Text style={styles.empty}>{t("تعذر تحميل بيانات الإرشاد", "Could not load mentorship data")}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>{t("جلساتك", "Your sessions")}</Text>
          {(sessions ?? []).length === 0 ? (
            <Text style={styles.emptyInline}>{t("لا جلسات بعد", "No sessions yet")}</Text>
          ) : (
            (sessions ?? []).slice(0, 5).map((s) => (
              <View key={s.id} style={styles.sessionCard}>
                <Text style={styles.sessionTopic}>{s.topic}</Text>
                <Text style={styles.sessionDate}>{new Date(s.scheduledAt).toLocaleString(locale === "ar" ? "ar-PS" : "en-US")}</Text>
                <Text style={styles.sessionStatus}>{s.status === "accepted" ? t("مؤكدة", "Confirmed") : s.status}</Text>
              </View>
            ))
          )}
          <Text style={styles.section}>{t("مرشدون متاحون", "Available mentors")}</Text>
          {(mentors ?? []).length === 0 ? (
            <Text style={styles.emptyInline}>{t("لا مرشدين متاحين حالياً", "No mentors available right now")}</Text>
          ) : (
            (mentors ?? []).map((m) => (
              <View key={m.userId} style={styles.card}>
                <Text style={styles.name}>{m.currentTitle}</Text>
                <Text style={styles.headline}>{m.expertiseArea}</Text>
                <Text style={styles.expertise}>{t(`${m.experienceYears} سنة خبرة · ★ ${m.rating}`, `${m.experienceYears} years of experience · ★ ${m.rating}`)}</Text>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookText}>{t("احجز جلسة", "Book a session")}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  content: { padding: spacing.md },
  section: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: 12, marginTop: 8 },
  empty: { textAlign: "center", marginTop: 40, color: colors.textMuted },
  emptyInline: { color: colors.textMuted, marginBottom: 16 },
  sessionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  sessionTopic: { fontWeight: "700", color: colors.navy },
  sessionDate: { color: colors.textMuted, marginTop: 4, fontSize: 12 },
  sessionStatus: { color: colors.emerald, marginTop: 4, fontSize: 12, fontWeight: "700" },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  name: { fontWeight: "800", color: colors.navy, fontSize: 15 },
  headline: { color: colors.textMuted, marginTop: 4 },
  expertise: { color: colors.textMuted, marginTop: 6, fontSize: 12 },
  bookBtn: { marginTop: 12, backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 10, alignItems: "center" },
  bookText: { color: "#fff", fontWeight: "700" },
});
