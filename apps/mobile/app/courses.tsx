import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { courses } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

export default function CoursesScreen() {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الكورسات", "Courses")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {courses.map((c) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.trainer}>{c.category} · {c.level}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>{c.duration}</Text>
              <Text style={styles.meta}>{t(`${c.enrolledCount} طالب`, `${c.enrolledCount} students`)}</Text>
              <Text style={styles.rating}>★ {c.rating}</Text>
            </View>
            {"progress" in c && c.progress != null ? (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${c.progress}%` }]} />
              </View>
            ) : null}
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 15, fontWeight: "700", color: colors.navy },
  trainer: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  meta: { fontSize: 11, color: colors.textSecondary },
  rating: { fontSize: 11, fontWeight: "700", color: colors.amber },
  progressBar: { height: 6, backgroundColor: colors.creamDark, borderRadius: 3, marginTop: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.purple, borderRadius: 3 },
});
