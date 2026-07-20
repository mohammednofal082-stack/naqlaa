import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { events } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

export default function EventsScreen() {
  const { t, locale } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الفعاليات", "Events")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>{t("سيناريو: تسجيل → QR → check-in → شهادة", "Scenario: registration → QR → check-in → certificate")}</Text>
        {events.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.type}>{e.type === "career_day" ? t("يوم مهني", "Career day") : e.type === "hackathon" ? t("هاكاثون", "Hackathon") : t("ورشة", "Workshop")}</Text>
            <Text style={styles.title}>{e.title}</Text>
            <Text style={styles.org}>{e.organizerType === "university" ? t("جامعة بيرزيت", "Birzeit University") : t("شركة", "Company")}</Text>
            <Text style={styles.date}>{new Date(e.startAt).toLocaleDateString(locale === "ar" ? "ar-PS" : "en-US")} · {e.location}</Text>
            <View style={styles.footer}>
              <Text style={styles.spots}>{t(`${e.registrationsCount} مسجل`, `${e.registrationsCount} registered`)}</Text>
              {e.qrCode ? (
                <TouchableOpacity style={styles.qrBtn}>
                  <Ionicons name="qr-code" size={14} color={colors.blue} />
                  <Text style={styles.qrText}>{e.qrCode}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
  intro: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  type: { fontSize: 11, fontWeight: "700", color: colors.amber },
  title: { fontSize: 15, fontWeight: "700", color: colors.navy, marginTop: 4 },
  org: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  spots: { fontSize: 12, color: colors.emerald, fontWeight: "600" },
  qrBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#EFF6FF", borderRadius: radius.full },
  qrText: { fontSize: 10, fontWeight: "700", color: colors.blue },
});
