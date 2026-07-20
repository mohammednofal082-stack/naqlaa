import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { buildPlatformWorkflows } from "@careerlink/shared";
import { useI18n } from "../../i18n";
import { colors, spacing, radius } from "../../constants/theme";

export default function WorkflowsScreen() {
  const { t, isRTL } = useI18n();
  const workflows = buildPlatformWorkflows(t);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={22} color={colors.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t("سيناريوهات نقلة", "Naqla Scenarios")}</Text>
          <Text style={styles.headerSub}>{t("٧ workflows — نفس الوثيقة والويب", "7 workflows — same document and web platform")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {workflows.map((wf) => (
          <View key={wf.id} style={[styles.card, { borderLeftColor: wf.color, borderLeftWidth: 4 }]}>
            <Text style={styles.icon}>{wf.icon}</Text>
            <Text style={styles.title}>{wf.title}</Text>
            <Text style={styles.sub}>{wf.subtitle}</Text>
            <Text style={styles.meta}>{wf.duration} · {wf.roles.join(" · ")}</Text>
            {wf.steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <Text style={[styles.stepNum, { color: wf.color }]}>{i + 1}</Text>
                <View>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={styles.stepActor}>{step.actor}</Text>
                </View>
              </View>
            ))}
            <View style={styles.outcome}>
              <Ionicons name="checkmark-circle" size={16} color={colors.emerald} />
              <Text style={styles.outcomeText}>{wf.outcome}</Text>
            </View>
            <TouchableOpacity style={[styles.demoBtn, { backgroundColor: wf.color }]} onPress={() => router.push(wf.mobileDemo as never)}>
              <Text style={styles.demoBtnText}>{t("جرّب هذا السيناريو", "Try this scenario")}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  backBtn: { padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  headerSub: { fontSize: 12, color: colors.textMuted },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  icon: { fontSize: 28, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "800", color: colors.navy },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 8 },
  meta: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  step: { flexDirection: "row", gap: 10, marginBottom: 8 },
  stepNum: { fontSize: 13, fontWeight: "800", width: 20 },
  stepLabel: { fontSize: 13, fontWeight: "600", color: colors.navy },
  stepActor: { fontSize: 11, color: colors.textMuted },
  outcome: { flexDirection: "row", gap: 8, alignItems: "flex-start", backgroundColor: colors.emerald + "12", padding: 10, borderRadius: radius.md, marginVertical: 12 },
  outcomeText: { flex: 1, fontSize: 12, color: colors.textSecondary },
  demoBtn: { paddingVertical: 12, borderRadius: radius.full, alignItems: "center" },
  demoBtnText: { color: colors.surface, fontWeight: "800", fontSize: 14 },
});
