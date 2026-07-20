import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { notifications } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";

export default function NotificationsScreen() {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الإشعارات", "Notifications")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map((n) => (
          <View key={n.id} style={[styles.card, !n.read && styles.unread]}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.message}</Text>
            <Text style={styles.time}>{n.timestamp}</Text>
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
  unread: { borderColor: colors.blue + "40", backgroundColor: "#EFF6FF" },
  title: { fontSize: 14, fontWeight: "700", color: colors.navy },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
});
