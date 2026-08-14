import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { ScreenHeader } from "../../components/ui";
import { useRemoteData } from "../../hooks/use-remote-data";
import { useI18n } from "../../i18n";
import { colors, spacing, radius, shadow } from "../../constants/theme";
import type { FeedPost } from "@careerlink/shared";

export default function FeedTabScreen() {
  const { t } = useI18n();
  const { data, loading, error, refetch } = useRemoteData<FeedPost[]>("feed");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t("المنصة", "Feed")}
        subtitle={t("منشورات حية من قاعدة البيانات", "Live posts from the database")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.blue} />}
      >
        {loading && !refreshing ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity onPress={() => void refetch()}>
              <Text style={styles.retry}>{t("إعادة المحاولة", "Retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : !(data ?? []).length ? (
          <Text style={styles.empty}>{t("لا منشورات في قاعدة البيانات بعد", "No posts in the database yet")}</Text>
        ) : (
          (data ?? []).map((post) => (
            <View key={post.id} style={styles.post}>
              <View style={styles.postHead}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(post.authorName || "?").slice(0, 1)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.author}>{post.authorName || t("مستخدم", "User")}</Text>
                  <Text style={styles.meta}>
                    {post.type} · {String(post.createdAt || "").slice(0, 10)}
                  </Text>
                </View>
              </View>
              <Text style={styles.body}>{post.content}</Text>
              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : null}
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Ionicons name="heart-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.actionText}>{post.likes ?? 0}</Text>
                </View>
                <View style={styles.action}>
                  <Ionicons name="chatbubble-outline" size={15} color={colors.textMuted} />
                  <Text style={styles.actionText}>{post.comments ?? 0}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md },
  center: { alignItems: "center", marginTop: 40 },
  error: { color: colors.red, textAlign: "center" },
  retry: { color: colors.blue, fontWeight: "700", marginTop: 10 },
  empty: { color: colors.textMuted, marginTop: 40, textAlign: "center" },
  post: {
    marginBottom: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  postHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  author: { fontWeight: "700", color: colors.text },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  body: { color: colors.textSecondary, lineHeight: 21, fontSize: 14 },
  image: { width: "100%", height: 180, borderRadius: radius.md, marginTop: 12, backgroundColor: colors.creamDark },
  actions: { flexDirection: "row", gap: 18, marginTop: 12 },
  action: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
});
