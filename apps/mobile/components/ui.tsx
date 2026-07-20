import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { colors, spacing, radius, shadow } from "../constants/theme";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

export function Card({ children, style, glow }: { children: React.ReactNode; style?: ViewStyle; glow?: boolean }) {
  return (
    <View style={[styles.card, glow && styles.cardGlow, style]}>
      <View style={styles.cardAccent} />
      {children}
    </View>
  );
}

export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statGlow, { backgroundColor: color + "18" }]} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function IndustryLabel({ label }: { label: string }) {
  return <Text style={styles.industryLabel}>{label}</Text>;
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.primaryBtnWrap} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.primaryBtn}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.navy,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.soft,
  },
  cardGlow: {
    ...shadow.glow,
    borderColor: colors.blue + "25",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.blue,
    opacity: 0.35,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    overflow: "hidden",
    ...shadow.soft,
  },
  statGlow: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "600",
  },
  industryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  primaryBtnWrap: {
    borderRadius: radius.full,
    overflow: "hidden",
    ...shadow.glow,
  },
  primaryBtn: {
    backgroundColor: colors.blue,
    color: colors.surface,
    textAlign: "center",
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "800",
  },
});

export { colors, spacing, radius, shadow };
