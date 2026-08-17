import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Card, colors, spacing, radius } from "../../components/ui";
import type { StudentProfile, User } from "@careerlink/shared";
import { useApp } from "../../contexts/app-context";
import { useI18n } from "../../i18n";
import { useRemoteData } from "../../hooks/use-remote-data";

type ProfileBundle = { user: User; profile: StudentProfile; skillLevels: { skill: string; value: number }[] };

export default function ProfileScreen() {
  const { t } = useI18n();
  const { user: sessionUser } = useApp();
  const { data, loading, error } = useRemoteData<ProfileBundle>("profile");
  const profile = data?.profile;
  const apiUser = data?.user;
  const firstName = apiUser?.firstName ?? sessionUser?.fullName.split(" ")[0] ?? "";
  const lastName = apiUser?.lastName ?? sessionUser?.fullName.split(" ").slice(1).join(" ") ?? "";
  const completion = profile?.profileCompletion ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0] ?? "?"}{lastName[0] ?? ""}</Text>
          </View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          {loading ? (
            <Text style={styles.headline}>{t("جاري التحميل...", "Loading...")}</Text>
          ) : error ? (
            <Text style={styles.headline}>{t("تعذر تحميل الملف", "Could not load profile")}</Text>
          ) : (
            <>
              <Text style={styles.headline}>{profile?.headline ?? ""}</Text>
              <Text style={styles.meta}>{[profile?.major, profile?.location].filter(Boolean).join(" · ")}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/profile-edit")}>
                <Text style={styles.editBtnText}>{t("تعديل الملف", "Edit profile")}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{t("اكتمال الملف", "Profile completion")}</Text>
            <Text style={styles.progressPct}>{completion}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
        </Card>

        {profile ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("نبذة", "About")}</Text>
              <Card>
                <Text style={styles.about}>{profile.about || t("لا توجد نبذة بعد", "No about text yet")}</Text>
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
                <Card key={`${edu.university}-${edu.startYear}`} style={styles.eduCard}>
                  <Text style={styles.eduUni}>{edu.university}</Text>
                  <Text style={styles.eduMajor}>{edu.major} — {edu.degree}</Text>
                  <Text style={styles.eduYear}>{edu.startYear} – {edu.endYear}</Text>
                </Card>
              ))}
            </View>
          </>
        ) : null}
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
  editBtn: { marginTop: 12, backgroundColor: colors.blue, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10 },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
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
