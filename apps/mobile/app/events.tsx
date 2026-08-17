import { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Event } from "@careerlink/shared";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";
import { useRemoteData } from "../hooks/use-remote-data";
import { apiGet, apiPost } from "../services/api-client";
import { useApp } from "../contexts/app-context";

type MyRegistration = {
  id: string;
  eventId: string;
  qrCode: string;
  checkedIn: boolean;
  eventTitle?: string;
};

export default function EventsScreen() {
  const { t, locale } = useI18n();
  const { role } = useApp();
  const { data: eventsData, refetch } = useRemoteData<Event[]>("events");
  const list = eventsData ?? [];
  const [qrCode, setQrCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [tickets, setTickets] = useState<Record<string, MyRegistration>>({});
  const canCheckIn = role === "university" || role === "company" || role === "hr" || role === "admin";

  const loadTickets = useCallback(async () => {
    try {
      const regs = await apiGet<MyRegistration[]>("event-registrations");
      const map: Record<string, MyRegistration> = {};
      for (const r of regs ?? []) map[r.eventId] = r;
      setTickets(map);
    } catch {
      // ignore — user may be unauthenticated briefly
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const checkIn = async () => {
    if (!qrCode.trim()) return;
    setBusy(true);
    try {
      await apiPost("event-registrations", { action: "check-in", qrCode: qrCode.trim() });
      Alert.alert(t("تم", "Done"), t("تم تسجيل الحضور", "Checked in"));
      setQrCode("");
      await refetch?.();
    } catch (e) {
      Alert.alert(t("خطأ", "Error"), e instanceof Error ? e.message : t("رمز غير صالح", "Invalid code"));
    } finally {
      setBusy(false);
    }
  };

  const register = async (eventId: string) => {
    try {
      const result = await apiPost<Event & { qrCode?: string }>("event-registrations", { eventId });
      const code = result.qrCode;
      if (code) {
        Alert.alert(
          t("تم التسجيل", "Registered"),
          t(`رمز تذكرتك:\n${code}`, `Your ticket code:\n${code}`),
        );
      } else {
        Alert.alert(t("تم", "Done"), t("تم التسجيل في الفعالية", "Registered for the event"));
      }
      await Promise.all([refetch?.(), loadTickets()]);
    } catch (e) {
      Alert.alert(t("خطأ", "Error"), e instanceof Error ? e.message : "FAILED");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("الفعاليات", "Events")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {canCheckIn ? (
          <View style={styles.checkCard}>
            <Text style={styles.checkTitle}>{t("تسجيل حضور QR", "QR Check-in")}</Text>
            <TextInput
              style={styles.input}
              value={qrCode}
              onChangeText={setQrCode}
              placeholder={t("الصق رمز التذكرة", "Paste ticket code")}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.checkBtn} onPress={() => void checkIn()} disabled={busy || !qrCode.trim()}>
              <Text style={styles.checkBtnText}>{busy ? "..." : t("تأكيد الحضور", "Confirm check-in")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {list.map((e) => {
          const ticket = tickets[e.id];
          return (
            <View key={e.id} style={styles.card}>
              <Text style={styles.type}>
                {e.type === "career_day"
                  ? t("يوم مهني", "Career day")
                  : e.type === "hackathon"
                    ? t("هاكاثون", "Hackathon")
                    : t("ورشة", "Workshop")}
              </Text>
              <Text style={styles.title}>{e.title}</Text>
              <Text style={styles.date}>
                {new Date(e.startAt).toLocaleDateString(locale === "ar" ? "ar-PS" : "en-US")} · {e.location}
              </Text>
              {ticket ? (
                <View style={styles.ticketBox}>
                  <Text style={styles.ticketLabel}>{t("تذكرتك", "Your ticket")}</Text>
                  <Text style={styles.ticketCode}>{ticket.qrCode}</Text>
                  <Text style={styles.ticketStatus}>
                    {ticket.checkedIn ? t("تم الحضور", "Checked in") : t("بانتظار الحضور", "Awaiting check-in")}
                  </Text>
                </View>
              ) : null}
              <View style={styles.footer}>
                <Text style={styles.spots}>{t(`${e.registrationsCount} مسجل`, `${e.registrationsCount} registered`)}</Text>
                {!ticket ? (
                  <TouchableOpacity style={styles.qrBtn} onPress={() => void register(e.id)}>
                    <Ionicons name="ticket" size={14} color={colors.blue} />
                    <Text style={styles.qrText}>{t("تسجيل", "Register")}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.qrBtn}
                    onPress={() =>
                      Alert.alert(t("رمز التذكرة", "Ticket code"), ticket.qrCode)
                    }
                  >
                    <Ionicons name="qr-code" size={14} color={colors.blue} />
                    <Text style={styles.qrText}>{t("عرض الرمز", "Show code")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
  checkCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  checkTitle: { fontSize: 14, fontWeight: "700", color: colors.navy, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.navy, marginBottom: 8 },
  checkBtn: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 10, alignItems: "center" },
  checkBtnText: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  type: { fontSize: 11, fontWeight: "700", color: colors.amber },
  title: { fontSize: 15, fontWeight: "700", color: colors.navy, marginTop: 4 },
  date: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  ticketBox: { marginTop: 10, padding: 10, borderRadius: radius.md, backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" },
  ticketLabel: { fontSize: 11, fontWeight: "700", color: colors.emerald },
  ticketCode: { fontSize: 16, fontWeight: "800", color: colors.navy, marginTop: 4, letterSpacing: 1 },
  ticketStatus: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  spots: { fontSize: 12, color: colors.emerald, fontWeight: "600" },
  qrBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#EFF6FF", borderRadius: radius.full },
  qrText: { fontSize: 10, fontWeight: "700", color: colors.blue },
});
