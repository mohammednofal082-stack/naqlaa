import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader, Card, colors, spacing, radius } from "../../components/ui";
import {
  studentProfile,
  skillAnalysis,
  buildUserSkills,
  analyzeSkillGap,
  analyzeCvLocally,
  getSmartRecommendations,
  startInterviewQuestions,
  evaluateInterviewAnswer,
  ROLE_OPTIONS,
} from "@careerlink/shared";
import { useI18n } from "../../i18n";

const SAMPLE_CV = `محمد نوفل — مطور واجهات أمامية
React, TypeScript, Next.js, Git
خبرة في بناء لوحات تحكم وتحسين الأداء`;

export default function AIScreen() {
  const { t } = useI18n();
  const aiTools = [
    { id: "gap", title: t("فجوة المهارات", "Skill Gap"), icon: "analytics" as const, color: colors.blue },
    { id: "rec", title: t("توصيات", "Recommendations"), icon: "bulb" as const, color: colors.emerald },
    { id: "cv", title: t("السيرة", "Résumé"), icon: "document-text" as const, color: colors.emerald },
    { id: "interview", title: t("مقابلة", "Interview"), icon: "mic" as const, color: colors.purple },
  ];
  const [active, setActive] = useState("gap");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const userSkills = buildUserSkills(studentProfile.skills, skillAnalysis);
  const gap = analyzeSkillGap(targetRole, userSkills);
  const rec = getSmartRecommendations(targetRole);
  const cvResult = analyzeCvLocally(SAMPLE_CV, targetRole, userSkills);

  const [questions] = useState(() => startInterviewQuestions("مطور Frontend", "mid"));
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const submitAnswer = () => {
    if (!answer.trim() || !questions[qIndex]) return;
    const result = evaluateInterviewAnswer({
      question: questions[qIndex].question,
      answer,
      type: questions[qIndex].type,
      jobTitle: "مطور Frontend",
    });
    setFeedback(result);
    setScores((prev) => [...prev, result.score]);
  };

  const nextQuestion = () => {
    setFeedback(null);
    setAnswer("");
    if (qIndex < questions.length - 1) setQIndex(qIndex + 1);
  };

  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("الأدوات الذكية", "Smart Tools")} subtitle={t("تحليل مهارات، توصيات، ومحاكاة مقابلات", "Skills analysis, recommendations, and interview simulation")} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {aiTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.tab, active === tool.id && { backgroundColor: tool.color + "18", borderColor: tool.color }]}
            onPress={() => setActive(tool.id)}
          >
            <Ionicons name={tool.icon} size={16} color={active === tool.id ? tool.color : colors.textMuted} />
            <Text style={[styles.tabText, active === tool.id && { color: tool.color, fontWeight: "700" }]}>
              {tool.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {active === "gap" && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleChip, targetRole === r.labelEn && styles.roleChipActive]}
                  onPress={() => setTargetRole(r.labelEn)}
                >
                  <Text style={[styles.roleChipText, targetRole === r.labelEn && styles.roleChipTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Card style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>{t("جاهزية السوق", "Market readiness")}</Text>
              <Text style={[styles.scoreValue, { color: colors.blue }]}>{gap.matchScore}%</Text>
              <Text style={styles.scoreHint}>{gap.roleLabel}</Text>
            </Card>
            <Text style={styles.sectionTitle}>{t("نقاط القوة", "Strengths")}</Text>
            {gap.strong.map((s) => (
              <View key={s} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.emerald} />
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>{t("مهارات ناقصة", "Missing skills")}</Text>
            {gap.missing.map((m) => (
              <View key={m} style={styles.listItem}>
                <Ionicons name="alert-circle" size={18} color={colors.amber} />
                <Text style={styles.listText}>{m}</Text>
              </View>
            ))}
          </>
        )}

        {active === "rec" && (
          <>
            <Text style={styles.sectionTitle}>{t("وظائف موصى بها", "Recommended jobs")}</Text>
            {rec.jobs.slice(0, 4).map((job) => (
              <Card key={job.id} style={styles.recCard}>
                <Text style={styles.recTitle}>{job.title}</Text>
                <Text style={styles.recSub}>{job.company.name}</Text>
                <Text style={styles.matchBadge}>{t(`${job.matchPercentage}% تطابق`, `${job.matchPercentage}% match`)}</Text>
              </Card>
            ))}
            <Text style={styles.sectionTitle}>{t("كورسات لسد الفجوة", "Courses to close the gap")}</Text>
            {rec.courses.map((c) => (
              <Card key={c.id} style={styles.recCard}>
                <Text style={styles.recTitle}>{c.title}</Text>
                <Text style={styles.recSub}>{c.duration} · ⭐ {c.rating}</Text>
              </Card>
            ))}
          </>
        )}

        {active === "cv" && (
          <>
            <Card style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>{t("درجة ATS", "ATS score")}</Text>
              <Text style={[styles.scoreValue, { color: colors.emerald }]}>{cvResult.atsScore}</Text>
              <Text style={styles.scoreHint}>{t("/ 100 — تحليل محلي", "/ 100 — local analysis")}</Text>
            </Card>
            <Text style={styles.sectionTitle}>{t("نقاط القوة", "Strengths")}</Text>
            {cvResult.strengths.map((s) => (
              <View key={s} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.emerald} />
                <Text style={styles.listText}>{s}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>{t("للتحسين", "Areas for improvement")}</Text>
            {cvResult.weaknesses.map((w) => (
              <View key={w} style={styles.listItem}>
                <Ionicons name="alert-circle" size={18} color={colors.amber} />
                <Text style={styles.listText}>{w}</Text>
              </View>
            ))}
          </>
        )}

        {active === "interview" && (
          <>
            {qIndex >= questions.length - 1 && feedback ? (
              <Card style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>{t("النتيجة الإجمالية", "Overall score")}</Text>
                <Text style={[styles.scoreValue, { color: colors.purple }]}>{overall}</Text>
                <Text style={styles.scoreHint}>/ 100</Text>
              </Card>
            ) : (
              <>
                <Card style={styles.questionCard}>
                  <Text style={styles.qType}>
                    {t(`سؤال ${qIndex + 1}/${questions.length}`, `Question ${qIndex + 1}/${questions.length}`)}
                  </Text>
                  <Text style={styles.qText}>{questions[qIndex]?.question}</Text>
                </Card>
                <TextInput
                  style={styles.input}
                  placeholder={t("اكتب إجابتك...", "Write your answer...")}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={answer}
                  onChangeText={setAnswer}
                  textAlignVertical="top"
                />
                {!feedback ? (
                  <TouchableOpacity style={styles.ctaBtn} onPress={submitAnswer}>
                    <Ionicons name="send" size={18} color={colors.surface} />
                    <Text style={styles.ctaText}>{t("تقييم الإجابة", "Evaluate answer")}</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <Card style={styles.feedbackCard}>
                      <Text style={styles.feedbackScore}>{t(`الدرجة: ${feedback.score}`, `Score: ${feedback.score}`)}</Text>
                      <Text style={styles.listText}>{feedback.feedback}</Text>
                    </Card>
                    {qIndex < questions.length - 1 ? (
                      <TouchableOpacity style={styles.ctaBtn} onPress={nextQuestion}>
                        <Text style={styles.ctaText}>{t("السؤال التالي", "Next question")}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                )}
              </>
            )}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  tabs: { maxHeight: 52, marginBottom: spacing.sm },
  tabsContent: { paddingHorizontal: spacing.md, gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabText: { fontSize: 12, color: colors.textMuted },
  content: { paddingHorizontal: spacing.md },
  scoreCard: { alignItems: "center", marginBottom: spacing.lg },
  scoreLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  scoreValue: { fontSize: 48, fontWeight: "800", marginVertical: 4 },
  scoreHint: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm, marginTop: spacing.sm },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  listText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  roleChipActive: { borderColor: colors.blue, backgroundColor: colors.blue + "15" },
  roleChipText: { fontSize: 12, color: colors.textMuted },
  roleChipTextActive: { color: colors.blue, fontWeight: "700" },
  recCard: { marginBottom: spacing.sm },
  recTitle: { fontSize: 15, fontWeight: "700", color: colors.navy },
  recSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  matchBadge: { fontSize: 13, fontWeight: "700", color: colors.emerald, marginTop: 6 },
  questionCard: { marginBottom: spacing.md },
  qType: { fontSize: 11, fontWeight: "700", color: colors.purple, marginBottom: 6 },
  qText: { fontSize: 14, color: colors.navy, lineHeight: 20 },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surface,
    fontSize: 14,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.purple,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  ctaText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
  feedbackCard: { marginBottom: spacing.md },
  feedbackScore: { fontSize: 16, fontWeight: "800", color: colors.purple, marginBottom: 8 },
});
