import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ScreenHeader } from "../../components/ui";
import { MenuRow, SectionTitle } from "../../components/role-ui";
import { LanguageSwitch } from "../../components/language-switch";
import { useApp } from "../../contexts/app-context";
import { useI18n } from "../../i18n";
import { colors, spacing } from "../../constants/theme";

export default function MoreScreen() {
  const { user, logout, roleExperience } = useApp();
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("المزيد", "More")} subtitle={t(`${roleExperience.label} · كل موديولات نقلة`, `${roleExperience.label} · All Naqla modules`)} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.langRow}>
          <LanguageSwitch />
        </View>

        <SectionTitle title={t("المنصة", "Platform")} />
        <MenuRow icon="chatbubbles" label={t("الرسائل", "Messages")} subtitle={t("تواصل مع الشركات والمرشدين", "Connect with companies and mentors")} color={colors.blue} onPress={() => router.push("/(tabs)/messages")} />
        <MenuRow icon="person" label={t("الملف الشخصي", "Profile")} subtitle={t("مهارات · تعليم · مشاريع", "Skills · Education · Projects")} color={colors.emerald} onPress={() => router.push("/(tabs)/profile")} />
        <MenuRow icon="map" label={t("رحلتي المهنية", "My Career Journey")} subtitle={t("خطوات من الجامعة للسوق", "Steps from university to the job market")} color={colors.purple} onPress={() => router.push("/journey")} />
        <MenuRow icon="notifications" label={t("الإشعارات", "Notifications")} subtitle={t("تحديثات الطلبات والمقابلات", "Application and interview updates")} color={colors.amber} onPress={() => router.push("/notifications")} />

        <SectionTitle title={t("الفرص والتعلم", "Opportunities and Learning")} />
        <MenuRow icon="school" label={t("التدريب العملي", "Practical Training")} subtitle={t("طلبات واعتماد جامعي", "Requests and university accreditation")} color={colors.cyan} onPress={() => router.push("/internships")} />
        <MenuRow icon="book" label={t("الكورسات", "Courses")} subtitle={t("تعلم مهارات السوق", "Learn in-demand market skills")} color={colors.purple} onPress={() => router.push("/courses")} />
        <MenuRow icon="people" label={t("الإرشاد المهني", "Career Mentorship")} subtitle={t("احجز مع مرشد", "Book a session with a mentor")} color="#EC4899" onPress={() => router.push("/mentorship")} />
        <MenuRow icon="calendar" label={t("الفعاليات", "Events")} subtitle={t("أيام مهنية و hackathons", "Career days and hackathons")} color={colors.amber} onPress={() => router.push("/events")} />

        <SectionTitle title={t("للمناقشة", "For Discussion")} />
        <MenuRow icon="git-network" label={t("السيناريوهات السبعة", "The Seven Scenarios")} subtitle={t("Workflows من وثيقة SRS", "Workflows from the SRS document")} color={colors.blue} onPress={() => router.push("/workflows")} />

        <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); router.replace("/auth/login"); }}>
          <Text style={styles.logoutText}>{t(`تسجيل الخروج — ${user?.fullName}`, `Sign out — ${user?.fullName}`)}</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.md },
  langRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: spacing.sm },
  logoutBtn: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.red + "40",
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
  },
  logoutText: { fontSize: 14, fontWeight: "700", color: colors.red },
});
