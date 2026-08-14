import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { StatCard } from "../../components/ui";
import { SectionTitle } from "../../components/role-ui";
import { useApp } from "../../contexts/app-context";
import { useI18n } from "../../i18n";
import type { Application, Company, Job, StudentProfile } from "@careerlink/shared";
import { colors, spacing, radius, shadow } from "../../constants/theme";
import { useRemoteData } from "../../hooks/use-remote-data";
import { getApiBaseUrl } from "../../services/api-client";

type JobWithCompany = Job & { company: Company; matchPercentage?: number };
type ApplicationWithDetails = Application & { job?: Job; company?: Company };
type ProfileBundle = { user: unknown; profile: StudentProfile; skillLevels: { skill: string; value: number }[] };

export default function HomeScreen() {
  const { user, roleExperience, isTalentRole, role } = useApp();
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  const jobsQ = useRemoteData<JobWithCompany[]>("jobs");
  const profileQ = useRemoteData<ProfileBundle>("profile");
  const appsQ = useRemoteData<ApplicationWithDetails[]>("applications");
  const companiesQ = useRemoteData<Company[]>("companies");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([jobsQ.refetch(), profileQ.refetch(), appsQ.refetch(), companiesQ.refetch()]);
    setRefreshing(false);
  }, [jobsQ, profileQ, appsQ, companiesQ]);

  if (!user) return null;

  const jobs = jobsQ.data ?? [];
  const apps = appsQ.data ?? [];
  const profileCompletion = profileQ.data?.profile.profileCompletion ?? 0;
  const recommendedJobs = jobs.filter((j) => (j.matchPercentage ?? 0) >= 70).length;
  const activeApps = apps.filter((a) => a.status !== "rejected" && a.status !== "withdrawn").length;
  const interviews = apps.filter((a) => a.status === "interview_scheduled").length;
  const topJobs = [...jobs].sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)).slice(0, 3);
  const nextApp = apps.find((a) => a.status === "interview_scheduled") ?? apps.find((a) => a.status === "under_review");
  const firstName = user.fullName.split(" ")[0];
  const loading = jobsQ.loading || appsQ.loading || profileQ.loading;
  const apiError = jobsQ.error || appsQ.error;

  const primaryCta = isTalentRole
    ? { href: "/(tabs)/jobs", label: t("تصفّح الفرص", "Browse jobs"), icon: "briefcase" as const }
    : role === "company" || role === "hr"
      ? { href: "/(tabs)/more", label: t("لوحة الشركة", "Company tools"), icon: "business" as const }
      : { href: `/dashboard/${role}` as const, label: t("لوحة التحكم", "Dashboard"), icon: "speedometer" as const };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.blue} />}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>{t("نقلة", "Naqla")}</Text>
            <Text style={styles.greeting}>
              {t("أهلاً", "Hi")} {firstName}
              <Text style={styles.roleDot}> · {roleExperience.label}</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={22} color={colors.navy} />
          </TouchableOpacity>
        </View>

        {!getApiBaseUrl() ? (
          <View style={styles.bannerWarn}>
            <Text style={styles.bannerWarnText}>
              {t("اضبط EXPO_PUBLIC_API_URL لربط التطبيق بقاعدة البيانات", "Set EXPO_PUBLIC_API_URL to connect the app to the database")}
            </Text>
          </View>
        ) : null}

        <View style={styles.nextCard}>
          <Text style={styles.nextEyebrow}>{t("خطوتك التالية", "Your next step")}</Text>
          <Text style={styles.nextTitle}>
            {nextApp?.job?.title
              ? t(`تابع طلب: ${nextApp.job.title}`, `Follow up: ${nextApp.job.title}`)
              : profileCompletion < 80
                ? t("أكمل ملفك لرفع نسبة التطابق", "Complete your profile to improve match rate")
                : t("استكشف فرص مطابقة لمهاراتك", "Explore roles matched to your skills")}
          </Text>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() =>
              router.push(
                (nextApp
                  ? "/(tabs)/applications"
                  : profileCompletion < 80
                    ? "/(tabs)/profile"
                    : primaryCta.href) as never
              )
            }
          >
            <Text style={styles.nextBtnText}>
              {nextApp
                ? t("عرض طلباتي", "View applications")
                : profileCompletion < 80
                  ? t("إكمال الملف", "Complete profile")
                  : primaryCta.label}
            </Text>
            <Ionicons name="arrow-back" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator color={colors.blue} style={{ marginVertical: 28 }} />
        ) : apiError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{apiError}</Text>
            <TouchableOpacity onPress={() => void onRefresh()}>
              <Text style={styles.retry}>{t("إعادة المحاولة", "Retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              {isTalentRole ? (
                <>
                  <StatCard label={t("تطابق ≥70%", "Match ≥70%")} value={recommendedJobs} color={colors.blue} />
                  <StatCard label={t("طلبات نشطة", "Active apps")} value={activeApps} color={colors.navy} />
                  <StatCard label={t("مقابلات", "Interviews")} value={interviews} color={colors.emerald} />
                  <StatCard label={t("اكتمال الملف", "Profile")} value={`${profileCompletion}%`} color={colors.blue} />
                </>
              ) : (
                <>
                  <StatCard label={t("الوظائف", "Jobs")} value={jobs.length} color={colors.blue} />
                  <StatCard label={t("التقديمات", "Applications")} value={apps.length} color={colors.navy} />
                  <StatCard label={t("الشركات", "Companies")} value={(companiesQ.data ?? []).length} color={colors.emerald} />
                  <StatCard label={t("مقابلات", "Interviews")} value={interviews} color={colors.blue} />
                </>
              )}
            </View>

            {isTalentRole ? (
              <>
                <SectionTitle title={t("أفضل الفرص لك", "Top matches for you")} />
                {topJobs.length === 0 ? (
                  <Text style={styles.empty}>{t("لا وظائف من قاعدة البيانات بعد", "No jobs from the database yet")}</Text>
                ) : (
                  topJobs.map((job) => (
                    <TouchableOpacity
                      key={job.id}
                      style={styles.jobRow}
                      onPress={() => router.push(`/job/${job.id}` as never)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.jobLogo}>
                        <Text style={styles.jobLogoText}>{(job.company?.name ?? "?").slice(0, 1)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                        <Text style={styles.jobMeta} numberOfLines={1}>
                          {job.company?.name}
                          {job.matchPercentage != null ? ` · ${job.matchPercentage}%` : ""}
                        </Text>
                      </View>
                      <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  ))
                )}
              </>
            ) : null}

            <View style={styles.quickRow}>
              <QuickChip icon="newspaper-outline" label={t("الفيد", "Feed")} onPress={() => router.push("/(tabs)/feed")} />
              <QuickChip icon="briefcase-outline" label={t("فرص", "Jobs")} onPress={() => router.push("/(tabs)/jobs")} />
              <QuickChip icon="document-text-outline" label={t("طلباتي", "Apps")} onPress={() => router.push("/(tabs)/applications")} />
              <QuickChip icon="compass-outline" label={t("أدوات", "Tools")} onPress={() => router.push("/(tabs)/ai")} />
            </View>
          </>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickChip({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={18} color={colors.blue} />
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 22, fontWeight: "800", color: colors.navy, letterSpacing: -0.4 },
  greeting: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  roleDot: { color: colors.textMuted },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerWarn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B44",
  },
  bannerWarnText: { color: colors.amber, fontSize: 12, fontWeight: "600" },
  nextCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.navy,
    ...shadow.card,
  },
  nextEyebrow: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "600", marginBottom: 6 },
  nextTitle: { color: "#fff", fontSize: 17, fontWeight: "700", lineHeight: 24, marginBottom: 14 },
  nextBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.blue,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  jobRow: {
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow.soft,
  },
  jobLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  jobLogoText: { color: "#fff", fontWeight: "800" },
  jobTitle: { fontWeight: "700", color: colors.text, fontSize: 14 },
  jobMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textMuted, marginVertical: 16, paddingHorizontal: spacing.md },
  errorBox: { alignItems: "center", padding: 24 },
  errorText: { color: colors.red, textAlign: "center", marginBottom: 8 },
  retry: { color: colors.blue, fontWeight: "700" },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.text },
});
