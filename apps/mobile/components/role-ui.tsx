import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, shadow } from "../constants/theme";
import { useI18n } from "../i18n";
import type { RoleExperienceBase, RoleScenario } from "@careerlink/shared";

export function ScenarioCard({
  scenario,
  accentColor,
  onPress,
  fullWidth,
}: {
  scenario: RoleScenario;
  accentColor: string;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.scenarioCard, fullWidth && styles.scenarioFull, { borderColor: accentColor + "30" }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.scenarioAccent, { backgroundColor: accentColor + "15" }]} />
      <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      <Text style={styles.scenarioDesc} numberOfLines={2}>{scenario.description}</Text>
      <View style={styles.scenarioCta}>
        <Text style={[styles.scenarioCtaText, { color: accentColor }]}>{scenario.cta}</Text>
        <Ionicons name="chevron-back" size={14} color={accentColor} />
      </View>
    </TouchableOpacity>
  );
}

export function RoleHero({
  role,
  accentColor,
  userName,
}: {
  role: RoleExperienceBase;
  accentColor: string;
  userName: string;
}) {
  const { t } = useI18n();
  return (
    <View style={[styles.hero, { backgroundColor: accentColor + "12", borderColor: accentColor + "25" }]}>
      <Text style={styles.heroEyebrow}>{role.icon} {role.label} · {role.mantra}</Text>
      <Text style={styles.heroTitle}>{t("مرحباً،", "Hello,")} {userName}</Text>
      <Text style={styles.heroTagline}>{role.tagline}</Text>
      <Text style={styles.heroFocus}>{role.primaryFocus.slice(0, 4).join(" · ")}</Text>
    </View>
  );
}

export function JourneyStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: "done" | "current" | "upcoming";
  detail?: string;
}) {
  const dotColor = status === "done" ? colors.emerald : status === "current" ? colors.blue : colors.border;
  return (
    <View style={styles.journeyRow}>
      <View style={[styles.journeyDot, { backgroundColor: dotColor }]} />
      <View style={styles.journeyContent}>
        <Text style={[styles.journeyLabel, status === "current" && { color: colors.blue }]}>{label}</Text>
        {detail ? <Text style={styles.journeyDetail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.menuIcon, { backgroundColor: (color ?? colors.blue) + "15" }]}>
        <Ionicons name={icon} size={20} color={color ?? colors.blue} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle ? <Text style={styles.menuSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export function AccentMap: Record<string, string> = {
  blue: colors.blue,
  emerald: colors.emerald,
  purple: colors.purple,
  amber: colors.amber,
  cyan: colors.cyan,
  violet: colors.purple,
  pink: "#EC4899",
  red: colors.red,
};

const styles = StyleSheet.create({
  scenarioCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    overflow: "hidden",
    ...shadow.soft,
  },
  scenarioFull: { width: "100%", marginRight: 0 },
  scenarioAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  scenarioTitle: { fontSize: 14, fontWeight: "800", color: colors.navy, marginBottom: 6 },
  scenarioDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 10, minHeight: 36 },
  scenarioCta: { flexDirection: "row", alignItems: "center", gap: 4 },
  scenarioCtaText: { fontSize: 12, fontWeight: "700" },
  hero: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  heroEyebrow: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  heroTitle: { fontSize: 24, fontWeight: "800", color: colors.navy, marginTop: 6 },
  heroTagline: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  heroFocus: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  journeyRow: { flexDirection: "row", gap: 12, marginBottom: spacing.sm, paddingRight: 4 },
  journeyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  journeyContent: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border },
  journeyLabel: { fontSize: 13, fontWeight: "700", color: colors.navy },
  journeyDetail: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700", color: colors.navy },
  menuSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.navy,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
});

export { colors, spacing, radius, shadow };
