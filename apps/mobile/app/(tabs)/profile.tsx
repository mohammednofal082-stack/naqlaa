import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader, Card, colors, spacing, radius } from "../../components/ui";
import { currentUser, studentProfile } from "@careerlink/shared";
import { useI18n } from "../../i18n";

export default function ProfileScreen() {
  const { t } = useI18n();
  const profile = studentProfile;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.firstName[0]}{currentUser.lastName[0]}</Text>
          </View>
          <Text style={styles.name}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text style={styles.headline}>{profile.headline}</Text>
          <Text style={styles.meta}>{profile.major} · {profile.location}</Text>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t("اكتمال الملف", "Profile completion")}</Text>
            <Text style={styles.progressPct}>{profile.profileCompletion}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${profile.profileCompletion}%` }]} />
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("نبذة", "About")}</Text>
          <Card>
            <Text style={styles.about}>{profile.about}</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("المهارات", "Skills")}</Text>
          <View style={styles.skills}>
            {profile.skills.map((skill) => (
              <View key={skill} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("التعليم", "Education")}</Text>
          {profile.education.map((edu) => (
            <Card key={edu.university} style={styles.eduCard}>
              <Text style={styles.eduUni}>{edu.university}</Text>
              <Text style={styles.eduMajor}>{edu.major} — {edu.degree}</Text>
              <Text style={styles.eduYear}>{edu.graduationYear}</Text>
            </Card>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.blue + "40",
    marginBottom: spacing.sm,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: colors.blue },
  name: { fontSize: 22, fontWeight: "800", color: colors.navy },
  headline: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: "center" },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  progressCard: { margin: spacing.md },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: "700", color: colors.navy },
  progressPct: { fontSize: 14, fontWeight: "800", color: colors.emerald },
  progressBar: { height: 8, backgroundColor: colors.creamDark, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.emerald, borderRadius: 4 },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm },
  about: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: { fontSize: 13, fontWeight: "600", color: colors.navy },
  eduCard: { marginBottom: spacing.sm },
  eduUni: { fontSize: 15, fontWeight: "700", color: colors.navy },
  eduMajor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  eduYear: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
