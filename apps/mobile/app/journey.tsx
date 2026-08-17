import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { JourneyStep } from "../components/role-ui";
import { useI18n } from "../i18n";
import { colors, spacing } from "../constants/theme";
import { useRemoteData } from "../hooks/use-remote-data";
import type { Application, StudentProfile } from "@careerlink/shared";

type ProfileBundle = { profile: StudentProfile };

export default function JourneyScreen() {
  const { t } = useI18n();
  const { data: profileData, loading: profileLoading } = useRemoteData<ProfileBundle>("profile");
  const { data: apps, loading: appsLoading } = useRemoteData<Application[]>("applications");
  const loading = profileLoading || appsLoading;

  const completion = profileData?.profile.profileCompletion ?? 0;
  const appCount = (apps ?? []).length;
  const interviews = (apps ?? []).filter((a) => a.status === "interview_scheduled").length;

  const steps = [
    {
      label: t("إكمال الملف الشخصي", "Complete your profile"),
      detail: t(`${completion}% مكتمل`, `${completion}% complete`),
      status: completion >= 80 ? ("done" as const) : completion > 0 ? ("current" as const) : ("upcoming" as const),
    },
    {
      label: t("التقديم على الفرص", "Apply to opportunities"),
      detail: t(`${appCount} طلب`, `${appCount} applications`),
      status: appCount > 0 ? ("done" as const) : completion >= 80 ? ("current" as const) : ("upcoming" as const),
    },
    {
      label: t("المقابلات", "Interviews"),
      detail: t(`${interviews} مقابلة`, `${interviews} interviews`),
      status: interviews > 0 ? ("done" as const) : appCount > 0 ? ("current" as const) : ("upcoming" as const),
    },
    {
      label: t("عرض وظيفي", "Job offer"),
      detail: t("الخطوة التالية بعد المقابلات", "Next step after interviews"),
      status: "upcoming" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("رحلتي المهنية", "My Career Journey")}</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.blue} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.goal}>
            {t(
              `الهدف: ${profileData?.profile.headline || "مسار مهني واضح"}`,
              `Goal: ${profileData?.profile.headline || "A clear career path"}`,
            )}
          </Text>
          {steps.map((step) => (
            <JourneyStep key={step.label} label={step.label} detail={step.detail} status={step.status} />
          ))}
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
  goal: { fontSize: 15, fontWeight: "700", color: colors.navy, marginBottom: 16 },
});
