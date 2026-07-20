import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { careerRoadmap } from "@careerlink/shared";
import { JourneyStep } from "../components/role-ui";
import { useI18n } from "../i18n";
import { colors, spacing } from "../constants/theme";

export default function JourneyScreen() {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("رحلتي المهنية", "My Career Journey")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.goal}>{t(`الهدف: ${careerRoadmap.goal}`, `Goal: ${careerRoadmap.goal}`)}</Text>
        {careerRoadmap.steps.map((step) => (
          <JourneyStep
            key={step.id}
            label={step.title}
            detail={step.description}
            status={step.status === "completed" ? "done" : step.status === "in_progress" ? "current" : "upcoming"}
          />
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
  goal: { fontSize: 16, fontWeight: "800", color: colors.blue, marginBottom: spacing.lg, textAlign: "center" },
});
