"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

type Report = {
  id: string;
  type: string;
  target: string;
  targetId: string | null;
  reporter: string;
  reason: string;
  status: string;
  date: string;
  link?: string;
};

export default function ModerationDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params);
  const { t } = useI18n();
  const [item, setItem] = useState<Report | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch(`/api/data/reports?id=${encodeURIComponent(reportId)}`);
    const json = await res.json();
    const row = Array.isArray(json.data) ? json.data[0] : json.data;
    if (row) setItem(row as Report);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const update = async (status: "reviewed" | "banned") => {
    setMsg("");
    try {
      const res = await fetch("/api/data/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "FAILED");
      await load();
      setMsg(t("تم التحديث", "Updated"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("فشل", "Failed"));
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        title={t("تفاصيل البلاغ", "Report details")}
        actions={<Link href="/dashboard/admin/moderation"><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>}
      >
        {msg && <p className="text-sm mb-3">{msg}</p>}
        {!item ? (
          <div className="nq-skeleton h-40" />
        ) : (
          <PanelCard title={item.target || item.id}>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>{t("النوع:", "Type:")} {item.type}</p>
              <p>{t("السبب:", "Reason:")} {item.reason}</p>
              <p>{t("المبلّغ:", "Reporter:")} {item.reporter}</p>
              <p>{t("الحالة:", "Status:")} {item.status}</p>
              <p>{t("التاريخ:", "Date:")} {item.date}</p>
            </div>
            <div className="flex gap-2 mt-4">
              {item.link && <Link href={item.link}><Button size="sm" variant="outline">{t("المحتوى", "Content")}</Button></Link>}
              {item.targetId && item.type === "profile" && (
                <Link href={`/dashboard/admin/users/${item.targetId}`}><Button size="sm" variant="outline">{t("المستخدم", "User")}</Button></Link>
              )}
              <Button size="sm" onClick={() => void update("reviewed")}>{t("حل", "Resolve")}</Button>
              <Button size="sm" variant="danger" onClick={() => void update("banned")}>{t("حظر", "Ban")}</Button>
            </div>
          </PanelCard>
        )}
      </DashboardSubPage>
    </DashboardLayout>
  );
}
