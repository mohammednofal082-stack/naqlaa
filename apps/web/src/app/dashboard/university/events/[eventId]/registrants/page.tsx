"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, QrCode } from "lucide-react";
import { useI18n } from "@/i18n";

type Row = {
  id: string;
  userId?: string;
  user_id?: string;
  qrCode?: string;
  qr_code?: string;
  checkedIn?: boolean;
  checked_in?: boolean;
  profiles?: { full_name?: string; email?: string };
};

export default function EventRegistrantsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data/event-registrations?eventId=${encodeURIComponent(eventId)}`);
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) setRows(json.data as Row[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [eventId]);

  const checkIn = async () => {
    if (!qr.trim()) return;
    setMsg("");
    try {
      const res = await fetch("/api/data/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-in", qrCode: qr.trim(), eventId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      setMsg(t("تم تسجيل الحضور", "Checked in"));
      setQr("");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل التسجيل", "Check-in failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("الفعاليات", "Events")}
        title={t("المسجلون", "Registrants")}
        subtitle={eventId}
        actions={
          <Link href="/dashboard/university/events">
            <Button size="sm" variant="outline">{t("العودة", "Back")}</Button>
          </Link>
        }
      >
        <PanelCard title={t("تسجيل حضور عبر QR", "QR check-in")} className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder={t("الصق رمز QR", "Paste QR code")}
            />
            <Button size="sm" onClick={() => void checkIn()}>
              <QrCode className="w-4 h-4" /> {t("تسجيل حضور", "Check in")}
            </Button>
          </div>
          {msg && <p className="text-sm text-text-secondary mt-2">{msg}</p>}
        </PanelCard>

        <PanelCard title={t(`${rows.length} مسجل`, `${rows.length} registrants`)}>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="nq-skeleton h-12" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t("لا مسجلين بعد", "No registrants yet")}
              description={t("سيظهر المسجلون هنا بعد التسجيل في الفعالية.", "Registrants appear here after event signup.")}
            />
          ) : (
            <div className="space-y-2">
              {rows.map((r) => {
                const checked = Boolean(r.checkedIn ?? r.checked_in);
                const name = r.profiles?.full_name ?? r.userId ?? r.user_id ?? r.id;
                const code = r.qrCode ?? r.qr_code ?? "—";
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm">{name}</p>
                      <p className="text-xs text-text-muted">QR: {code}</p>
                    </div>
                    <span className={checked ? "nq-chip nq-chip-emerald" : "nq-chip"}>
                      {checked ? t("حاضر", "Checked in") : t("مسجل", "Registered")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
