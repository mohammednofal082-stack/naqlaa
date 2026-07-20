import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScreenHeader, IndustryLabel, colors, spacing, radius } from "../../components/ui";
import { getJobsWithCompany, INDUSTRIES, matchIndustryFilter } from "@careerlink/shared";
import { useI18n } from "../../i18n";

export default function JobsScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const jobs = getJobsWithCompany();

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search || j.title.includes(search) || j.company.name.includes(search) || j.company.industry.includes(search);
    return matchSearch && matchIndustryFilter(j.company.industry, industry);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t("الوظائف", "Jobs")}
        subtitle={t(`${filtered.length} فرصة · تقنية · صحة · مالية · تعليم`, `${filtered.length} opportunities · Technology · Healthcare · Finance · Education`)}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, industry === "all" && styles.chipActive]}
          onPress={() => setIndustry("all")}
        >
          <Text style={[styles.chipText, industry === "all" && styles.chipTextActive]}>{t("الكل", "All")}</Text>
        </TouchableOpacity>
        {INDUSTRIES.map((ind) => (
          <TouchableOpacity
            key={ind.id}
            style={[styles.chip, industry === ind.id && styles.chipActive]}
            onPress={() => setIndustry(ind.id)}
          >
            <Text style={[styles.chipText, industry === ind.id && styles.chipTextActive]} numberOfLines={1}>
              {ind.label.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("ابحث عن وظيفة أو قطاع...", "Search for a job or sector...")}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard} activeOpacity={0.85} onPress={() => router.push(`/job/${job.id}` as never)}>
            <View style={styles.jobTop}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{job.company.name[0]}</Text>
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.company}>{job.company.name}</Text>
                <IndustryLabel label={job.company.industry} />
              </View>
              {job.matchPercentage && (
                <Text style={styles.matchText}>{job.matchPercentage}%</Text>
              )}
            </View>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={styles.tagText}>{job.location}</Text>
              </View>
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={[styles.tagText, { color: colors.blue }]}>
                  {job.workType === "remote" ? t("عن بُعد", "Remote") : job.workType === "hybrid" ? t("هجين", "Hybrid") : t("مكتب", "On-site")}
                </Text>
              </View>
            </View>
            <Text style={styles.salary}>
              ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  chips: { paddingHorizontal: spacing.md, marginBottom: spacing.sm, maxHeight: 44 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.surface },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, color: colors.navy, fontSize: 15 },
  jobCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 20, fontWeight: "800", color: colors.blue },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  company: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  matchText: { fontSize: 13, fontWeight: "700", color: colors.emerald },
  tags: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.cream, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagBlue: { backgroundColor: "#EFF6FF" },
  tagText: { fontSize: 12, color: colors.textMuted },
  salary: { fontSize: 14, fontWeight: "700", color: colors.emerald, marginTop: 10 },
});
