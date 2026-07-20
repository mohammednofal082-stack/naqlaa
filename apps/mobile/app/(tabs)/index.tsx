import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatCard, ScreenHeader } from "../../components/ui";
import { AccentMap, JourneyStep, RoleHero, ScenarioCard, SectionTitle } from "../../components/role-ui";
import { useApp } from "../../contexts/app-context";
import { useI18n } from "../../i18n";
import {
  dashboardStats,
  getJobsWithCompany,
  PLATFORM_WORKFLOWS,
} from "@careerlink/shared";
import { colors, spacing, radius } from "../../constants/theme";

export default function HomeScreen() {
  const { user, roleExperience, isTalentRole, role } = useApp();
  const { t } = useI18n();
  if (!user) return null;

  const journeySteps = [
    { label: t("إكمال الملف الشخصي", "Complete your profile"), status: "done" as const, detail: t(`${dashboardStats.profileCompletion}% مكتمل`, `${dashboardStats.profileCompletion}% complete`) },
    { label: t("تحليل المهارات", "Skills analysis"), status: "done" as const, detail: t("٣ مهارات تحتاج تطوير", "Three skills require development") },
    { label: t("التقديم على التدريب", "Apply for training"), status: "current" as const, detail: t("فرصتان مناسبتان الآن", "Two suitable opportunities available now") },
    { label: t("المقابلة الأولى", "First interview"), status: "upcoming" as const },
    { label: t("أول عرض وظيفي", "First job offer"), status: "upcoming" as const },
  ];

  const accent = AccentMap[roleExperience.accentKey] ?? colors.blue;
  const firstName = user.fullName.split(" ")[0];
  const jobs = getJobsWithCompany().slice(0, 3);

  if (!isTalentRole) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brand}>{t("نقلة", "Naqla")}</Text>
              <Text style={styles.greeting}>{roleExperience.label}</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")}>
              <Ionicons name="notifications-outline" size={22} color={colors.navy} />
            </TouchableOpacity>
          </View>

          <RoleHero role={roleExperience} accentColor={accent} userName={firstName} />

          <SectionTitle title={t("سيناريوهاتك اليوم", "Your scenarios today")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            {roleExperience.scenarios.map((s) => (
              <ScenarioCard
                key={s.title}
                scenario={s}
                accentColor={accent}
                onPress={() => router.push(s.mobileRoute as never)}
              />
            ))}
          </ScrollView>

          <View style={styles.statsGrid}>
            <StatCard label={t("مهام اليوم", "Tasks today")} value={role === "hr" ? 8 : 5} color={accent} />
            <StatCard label={t("معلّق", "Pending")} value={role === "admin" ? 3 : 2} color={colors.amber} />
            <StatCard label={t("مكتمل", "Completed")} value={12} color={colors.emerald} />
            <StatCard label={t("رسائل", "Messages")} value={dashboardStats.newMessages} color={colors.purple} />
          </View>

          <TouchableOpacity
            style={[styles.dashboardBtn, { backgroundColor: accent }]}
            onPress={() => router.push(`/dashboard/${role}` as never)}
          >
            <Ionicons name="speedometer" size={20} color={colors.surface} />
            <Text style={styles.dashboardBtnText}>{t(`لوحة ${roleExperience.label} — عرض كامل`, `${roleExperience.label} dashboard — full view`)}</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>{t("نقلة", "Naqla")}</Text>
            <Text style={styles.greeting}>{t("أهلاً", "Welcome")} {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={22} color={colors.navy} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <RoleHero role={roleExperience} accentColor={accent} userName={firstName} />

        <SectionTitle title={t("ابدأ من هنا", "Start here")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
          {roleExperience.scenarios.map((s) => (
            <ScenarioCard
              key={s.title}
              scenario={s}
              accentColor={accent}
              onPress={() => router.push(s.mobileRoute as never)}
            />
          ))}
        </ScrollView>

        <View style={styles.statsGrid}>
          <StatCard label={t("وظائف مقترحة", "Recommended jobs")} value={dashboardStats.recommendedJobs} color={colors.blue} />
          <StatCard label={t("طلبات", "Applications")} value={dashboardStats.applications} color={colors.emerald} />
          <StatCard label={t("مقابلات", "Interviews")} value={dashboardStats.upcomingInterviews} color={colors.purple} />
          <StatCard label={t("رسائل", "Messages")} value={dashboardStats.newMessages} color={colors.amber} />
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitleInline}>{t("مسارك الحالي", "Your current path")}</Text>
          {journeySteps.map((step) => (
            <JourneyStep key={step.label} {...step} />
          ))}
        </View>

        <SectionTitle title={t("وظائف مقترحة", "Recommended jobs")} />
        {jobs.map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => router.push(`/job/${job.id}` as never)}>
            <View style={styles.jobRow}>
              <View style={styles.jobLogo}>
                <Text style={styles.jobLogoText}>{job.company.name[0]}</Text>
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.company}>{job.company.name}</Text>
              </View>
              {job.matchPercentage ? <Text style={styles.matchText}>{job.matchPercentage}%</Text> : null}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.workflowBanner} onPress={() => router.push("/workflows" as never)}>
          <Ionicons name="git-network-outline" size={22} color={colors.blue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.workflowTitle}>{t("سبعة سيناريوهات كاملة", "Seven complete scenarios")}</Text>
            <Text style={styles.workflowSub}>{t(`${PLATFORM_WORKFLOWS.length} مسار عمل من وثيقة المتطلبات`, `${PLATFORM_WORKFLOWS.length} workflows from the SRS document`)}</Text>
          </View>
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  brand: { fontSize: 13, fontWeight: "800", color: colors.blue },
  greeting: { fontSize: 22, fontWeight: "800", color: colors.navy, marginTop: 2 },
  notifBtn: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emerald,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionPad: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  sectionTitleInline: { fontSize: 17, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm },
  jobCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  jobLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
  },
  jobLogoText: { fontSize: 18, fontWeight: "800", color: colors.blue },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: "700", color: colors.navy },
  company: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  matchText: { fontSize: 13, fontWeight: "700", color: colors.emerald },
  workflowBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: "#EFF6FF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  workflowTitle: { fontSize: 14, fontWeight: "800", color: colors.navy },
  workflowSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  dashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  dashboardBtnText: { color: colors.surface, fontWeight: "800", fontSize: 15 },
});
