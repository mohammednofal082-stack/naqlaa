import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader, Card } from "../components/ui";
import { SectionTitle } from "../components/role-ui";
import { useRemoteData } from "../hooks/use-remote-data";
import { apiPost } from "../services/api-client";
import { useI18n } from "../i18n";
import { colors, spacing, radius } from "../constants/theme";
import type { BillingOverview, Invoice } from "@careerlink/shared";

function money(amount: number, currency: string) {
  return `$${amount.toLocaleString()} ${currency}`;
}

export default function BillingScreen() {
  const { t, locale } = useI18n();
  const { data, loading, error, refetch } = useRemoteData<BillingOverview>("billing");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  const pay = useCallback(
    async (invoiceId: string) => {
      setBusyId(invoiceId);
      setFlash("");
      try {
        await apiPost("billing", { action: "pay", invoiceId });
        setFlash(t("تم تسجيل التسديد", "Payment recorded"));
        await refetch();
      } catch {
        setFlash(t("تعذر تسجيل التسديد", "Could not record payment"));
      } finally {
        setBusyId(null);
      }
    },
    [refetch, t]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t("الرسوم والفواتير", "Fees & Invoices")}
        subtitle={t("عرض تجريبي مطابق للويب — بدون بوابة دفع", "Demo mock aligned with web — no payment gateway")}
        showBack
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {t("وضع معاينة — نفس بيانات الموقع", "Preview mode — same data as the website")}
          </Text>
        </View>
        {flash ? <Text style={styles.flash}>{flash}</Text> : null}
        {loading ? (
          <ActivityIndicator color={colors.blue} style={{ marginTop: 40 }} />
        ) : error || !data ? (
          <Text style={styles.error}>{error ?? t("تعذر التحميل", "Failed to load")}</Text>
        ) : (
          <>
            <View style={styles.stats}>
              <Card style={styles.stat}>
                <Text style={styles.statLabel}>{t("إيرادات / مدفوع", "Revenue / Paid")}</Text>
                <Text style={styles.statValue}>{money(data.ytdRevenue, data.currency)}</Text>
              </Card>
              <Card style={styles.stat}>
                <Text style={styles.statLabel}>{t("مستحق", "Outstanding")}</Text>
                <Text style={styles.statValue}>{money(data.outstanding, data.currency)}</Text>
              </Card>
            </View>

            <SectionTitle title={t("كتالوج الرسوم", "Fee catalog")} />
            {data.feeCatalog.map((fee) => (
              <Card key={fee.id} style={styles.row}>
                <Text style={styles.rowTitle}>{locale === "ar" ? fee.nameAr : fee.nameEn}</Text>
                <Text style={styles.rowMeta}>
                  {(locale === "ar" ? fee.unitAr : fee.unitEn) + " · " + money(fee.amount, fee.currency)}
                </Text>
              </Card>
            ))}

            <SectionTitle title={t("الفواتير", "Invoices")} />
            {data.invoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                busy={busyId === inv.id}
                onPay={() => void pay(inv.id)}
              />
            ))}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InvoiceCard({
  invoice,
  busy,
  onPay,
}: {
  invoice: Invoice;
  busy: boolean;
  onPay: () => void;
}) {
  const { t, locale } = useI18n();
  const canPay = invoice.status === "pending" || invoice.status === "overdue";
  return (
    <Card style={styles.invoice}>
      <View style={styles.invoiceTop}>
        <Text style={styles.invoiceNo}>{invoice.number}</Text>
        <Text style={styles.badge}>{invoice.status}</Text>
      </View>
      <Text style={styles.rowMeta}>{invoice.accountName}</Text>
      {invoice.lines.map((line, i) => (
        <Text key={i} style={styles.line}>
          {locale === "ar" ? line.descriptionAr : line.descriptionEn}
        </Text>
      ))}
      <Text style={styles.total}>{money(invoice.total, invoice.currency)}</Text>
      {canPay ? (
        <TouchableOpacity style={styles.payBtn} onPress={onPay} disabled={busy}>
          <Text style={styles.payText}>
            {busy ? t("جاري…", "Working…") : t("تسديد الفاتورة", "Pay invoice")}
          </Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.md },
  banner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B55",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.amber, fontWeight: "600", fontSize: 13 },
  flash: { color: colors.emerald, marginBottom: 8, fontWeight: "600" },
  error: { color: colors.red, marginTop: 20 },
  stats: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  stat: { flex: 1, padding: 14 },
  statLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  row: { marginBottom: 8, padding: 14 },
  rowTitle: { fontWeight: "700", color: colors.text, marginBottom: 4 },
  rowMeta: { fontSize: 12, color: colors.textMuted },
  invoice: { marginBottom: 10, padding: 14 },
  invoiceTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  invoiceNo: { fontWeight: "800", color: colors.text },
  badge: { fontSize: 11, color: colors.blue, fontWeight: "700" },
  line: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  total: { marginTop: 10, fontSize: 16, fontWeight: "800", color: colors.text },
  payBtn: {
    marginTop: 12,
    backgroundColor: colors.blue,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  payText: { color: colors.surface, fontWeight: "700" },
});
