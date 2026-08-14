"use client";

import { useMemo, useState } from "react";
import type { BillingOverview, Invoice, InvoiceStatus } from "@careerlink/shared";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/button";
import { useChartTheme } from "@/lib/chart-theme";
import { useI18n } from "@/i18n";
import {
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusTone(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return "text-emerald border-emerald/30 bg-emerald/10";
    case "pending":
      return "text-amber border-amber/30 bg-amber/10";
    case "overdue":
      return "text-red-600 border-red-500/30 bg-red-500/10";
    case "draft":
      return "text-text-muted border-border bg-surface-2";
    default:
      return "text-text-muted border-border";
  }
}

export function BillingMockBanner({ note }: { note?: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-text">
      <strong className="font-semibold">{t("بيانات تجريبية", "Sample billing data")}</strong>
      {" — "}
      {note ??
        t(
          "لمعاينة الفواتير والرسوم قبل ربط بوابة دفع.",
          "Preview invoices and fees before connecting a payment gateway."
        )}
    </div>
  );
}

export function BillingWorkspace({
  data,
  variant,
  onPay,
  onChangePlan,
  busyId,
}: {
  data: BillingOverview;
  variant: "admin" | "company" | "account";
  onPay?: (invoiceId: string) => Promise<void>;
  onChangePlan?: (planId: string) => Promise<void>;
  busyId?: string | null;
}) {
  const { t, locale } = useI18n();
  const chart = useChartTheme();
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");
  const currency = data.currency;

  const statusLabel = (s: InvoiceStatus) =>
    ({
      paid: t("مدفوعة", "Paid"),
      pending: t("معلّقة", "Pending"),
      overdue: t("متأخرة", "Overdue"),
      draft: t("مسودة", "Draft"),
      void: t("ملغاة", "Void"),
    })[s];

  const invoices = useMemo(() => {
    if (filter === "all") return data.invoices;
    return data.invoices.filter((i) => i.status === filter);
  }, [data.invoices, filter]);

  const planName = (id: string) => {
    const p = data.plans.find((x) => x.id === id);
    if (!p) return id;
    return locale === "ar" ? p.nameAr : p.nameEn;
  };

  return (
    <div className="space-y-6">
      <BillingMockBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={variant === "admin" ? t("الإيرادات YTD", "YTD Revenue") : t("المدفوع هذا العام", "Paid YTD")}
          value={money(data.ytdRevenue, currency)}
          icon={DollarSign}
          accent="amber"
        />
        <StatCard
          title={t("الإيراد الشهري المتكرر", "MRR")}
          value={money(Math.round(data.mrr), currency)}
          icon={RefreshCw}
          accent="blue"
        />
        <StatCard
          title={t("مستحقات مفتوحة", "Outstanding")}
          value={money(data.outstanding, currency)}
          icon={Wallet}
          accent="purple"
        />
        <StatCard
          title={
            variant === "admin"
              ? t("اشتراكات نشطة", "Active subscriptions")
              : t("مدفوع هذا الشهر", "Paid this month")
          }
          value={
            variant === "admin"
              ? String(data.activeSubscriptions)
              : money(data.paidThisMonth, currency)
          }
          icon={CreditCard}
          accent="emerald"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <PanelCard
          title={t("إيرادات الفوترة", "Billing revenue")}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="month" tick={{ fill: chart.tick, fontSize: 11 }} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} />
              <Tooltip contentStyle={chart.tooltip} />
              <Bar dataKey="revenue" name={t("إيراد", "Revenue")} fill={chart.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="fees" name={t("رسوم", "Fees")} fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title={t("كتالوج الرسوم", "Fee catalog")}>
          <ul className="space-y-3">
            {data.feeCatalog.map((fee) => (
              <li key={fee.id} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                <div>
                  <p className="text-sm font-medium">{locale === "ar" ? fee.nameAr : fee.nameEn}</p>
                  <p className="text-xs text-text-muted">{locale === "ar" ? fee.unitAr : fee.unitEn}</p>
                </div>
                <span className="text-sm tabular-nums font-semibold">{money(fee.amount, fee.currency)}</span>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      {(variant === "admin" || variant === "company") && (
        <PanelCard title={t("باقات الاشتراك", "Subscription plans")}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {data.plans.map((plan) => {
              const active = data.mySubscription?.planId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 ${
                    plan.recommended ? "border-primary/50 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{locale === "ar" ? plan.nameAr : plan.nameEn}</h3>
                    {plan.recommended && (
                      <span className="text-[10px] uppercase tracking-wide text-primary">
                        {t("موصى به", "Recommended")}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold tabular-nums mb-3">
                    {money(plan.priceMonthly, plan.currency)}
                    <span className="text-xs font-normal text-text-muted">/{t("شهر", "mo")}</span>
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {(locale === "ar" ? plan.featuresAr : plan.featuresEn).map((f) => (
                      <li key={f} className="text-xs text-text-muted">• {f}</li>
                    ))}
                  </ul>
                  {variant === "company" && onChangePlan && (
                    <Button
                      size="sm"
                      variant={active ? "outline" : "primary"}
                      className="w-full"
                      disabled={active || busyId === plan.id}
                      onClick={() => void onChangePlan(plan.id)}
                    >
                      {active
                        ? t("الخطة الحالية", "Current plan")
                        : busyId === plan.id
                          ? t("جاري…", "Working…")
                          : t("تفعيل الباقة", "Activate plan")}
                    </Button>
                  )}
                  {variant === "admin" && active && (
                    <p className="text-xs text-emerald">{t("خطة الحساب الحالي", "Current account plan")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </PanelCard>
      )}

      {variant === "admin" && data.subscriptions.length > 0 && (
        <PanelCard title={t("الاشتراكات", "Subscriptions")}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-start text-text-muted border-b border-border">
                  <th className="py-2 font-medium">{t("الحساب", "Account")}</th>
                  <th className="py-2 font-medium">{t("الخطة", "Plan")}</th>
                  <th className="py-2 font-medium">{t("الحالة", "Status")}</th>
                  <th className="py-2 font-medium">{t("التجديد", "Renews")}</th>
                  <th className="py-2 font-medium">{t("المقاعد", "Seats")}</th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-2.5">{s.accountName}</td>
                    <td className="py-2.5">{planName(s.planId)}</td>
                    <td className="py-2.5">{s.status}</td>
                    <td className="py-2.5 tabular-nums">{s.renewsAt}</td>
                    <td className="py-2.5 tabular-nums">{s.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      )}

      {variant === "company" && data.mySubscription && (
        <PanelCard title={t("اشتراك الشركة", "Company subscription")}>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              {t("الخطة:", "Plan:")} <strong>{planName(data.mySubscription.planId)}</strong>
            </span>
            <span>
              {t("الحالة:", "Status:")} <strong>{data.mySubscription.status}</strong>
            </span>
            <span>
              {t("يتجدد:", "Renews:")} <strong className="tabular-nums">{data.mySubscription.renewsAt}</strong>
            </span>
            <span>
              {t("المقاعد:", "Seats:")} <strong>{data.mySubscription.seats}</strong>
            </span>
          </div>
        </PanelCard>
      )}

      <PanelCard
        title={t("الفواتير", "Invoices")}
        action={
          <div className="flex flex-wrap gap-1.5">
            {(["all", "pending", "overdue", "paid"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`text-xs px-2.5 py-1 rounded-lg border ${
                  filter === key ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"
                }`}
              >
                {key === "all" ? t("الكل", "All") : statusLabel(key)}
              </button>
            ))}
          </div>
        }
      >
        {invoices.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            {t("لا توجد فواتير في هذا التصفية", "No invoices for this filter")}
          </p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                statusLabel={statusLabel(inv.status)}
                onPay={onPay}
                busy={busyId === inv.id}
              />
            ))}
          </ul>
        )}
      </PanelCard>
    </div>
  );
}

function InvoiceRow({
  invoice,
  statusLabel,
  onPay,
  busy,
}: {
  invoice: Invoice;
  statusLabel: string;
  onPay?: (id: string) => Promise<void>;
  busy?: boolean;
}) {
  const { t, locale } = useI18n();
  const canPay = onPay && (invoice.status === "pending" || invoice.status === "overdue");

  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 rounded-lg border border-border p-2 text-text-muted">
            {invoice.status === "paid" ? <Receipt className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold tabular-nums">{invoice.number}</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusTone(invoice.status)}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-text-muted">{invoice.accountName}</p>
            <ul className="mt-2 space-y-0.5">
              {invoice.lines.map((line, idx) => (
                <li key={idx} className="text-xs text-text-muted">
                  {locale === "ar" ? line.descriptionAr : line.descriptionEn}
                  {" · "}
                  {money(line.amount, invoice.currency)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-text-muted mt-2 tabular-nums">
              {t("إصدار", "Issued")} {invoice.issuedAt} · {t("استحقاق", "Due")} {invoice.dueAt}
              {invoice.paidAt ? ` · ${t("دفع", "Paid")} ${invoice.paidAt}` : ""}
            </p>
          </div>
        </div>
        <div className="text-end space-y-2">
          <p className="text-lg font-bold tabular-nums">{money(invoice.total, invoice.currency)}</p>
          {canPay && (
            <Button size="sm" disabled={busy} onClick={() => void onPay(invoice.id)}>
              {busy ? t("جاري الدفع…", "Paying…") : t("تسديد الفاتورة", "Pay invoice")}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
