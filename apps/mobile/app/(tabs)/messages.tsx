import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader, Card, colors, spacing, radius } from "../../components/ui";
import { conversations, getUserById, currentUser } from "@careerlink/shared";
import { useI18n } from "../../i18n";

export default function MessagesScreen() {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={t("الرسائل", "Messages")} subtitle={t("تواصل مع الشركات والمرشدين", "Connect with companies and mentors")} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.map((conv) => {
          const otherId = conv.participantIds.find((id) => id !== currentUser.id);
          const other = otherId ? getUserById(otherId) : null;
          return (
            <TouchableOpacity key={conv.id} style={styles.convCard} activeOpacity={0.85}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{other?.firstName[0]}</Text>
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convTop}>
                  <Text style={styles.convName}>
                    {other?.firstName} {other?.lastName}
                  </Text>
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {conv.lastMessage.content}
                </Text>
              </View>
              <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  convCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.creamDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: colors.blue },
  convInfo: { flex: 1 },
  convTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convName: { fontSize: 15, fontWeight: "700", color: colors.navy },
  unreadBadge: {
    backgroundColor: colors.emerald,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: { fontSize: 11, fontWeight: "800", color: colors.surface },
  lastMsg: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
