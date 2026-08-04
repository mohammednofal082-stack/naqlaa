"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { ActivityRow, PanelCard } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCompanies, usePartnerships } from "@/hooks/data";
import { Handshake, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { Partnership } from "@careerlink/shared";

type UniRow = { id: string; name: string };

export default function CompanyPartnershipsPage() {
  const { t } = useI18n();
  const { data: partnerships, loading, refetch } = usePartnerships();
  const { data: companies } = useCompanies();
  const [universities, setUniversities] = useState<UniRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [universityId, setUniversityId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/data/universities")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          setUniversities(
            (json.data as UniRow[]).map((u) => ({ id: String(u.id), name: String(u.name) }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (companies?.[0]?.id && !companyId) setCompanyId(companies[0].id);
  }, [companies, companyId]);

  useEffect(() => {
    if (universities[0]?.id && !universityId) setUniversityId(universities[0].id);
  }, [universities, universityId]);

  const items = partnerships ?? [];

  const uniName = (id: string) => universities.find((u) => u.id === id)?.name ?? id;

  const openForm = () => {
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const requestPartnership = async () => {
    if (!universityId.trim() || !companyId) return;
    setSaving(true);
    setMessage("");
    setError("");
    const payload = {
      universityId: universityId.trim(),
      companyId,
      status: "pending" as const,
      startDate: new Date().toISOString().slice(0, 10),
    };

    try {
      const res = await fetch("/api/data/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "FAILED");
      await refetch();
      setMessage(t("تم إرسال طلب الشراكة", "Partnership request sent"));
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل إرسال الطلب", "Request failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardSubPage
        meta={t("لوحة الشركة", "Company Dashboard")}
        title={t("الشراكات", "Partnerships")}
        subtitle={t("شراكات مع الجامعات والمؤسسات", "Partnerships with universities and institutions")}
        actions={
          <Button size="sm" onClick={openForm}>
            <Plus className="w-4 h-4" />
            {t("طلب شراكة", "Request Partnership")}
          </Button>
        }
      >
        {message && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {showForm && (
          <PanelCard title={t("طلب شراكة", "Request Partnership")} className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {universities.length === 0 ? (
                  <option value="">
                    {t("لا جامعات — شغّل migration 009", "No universities — run migration 009")}
                  </option>
                ) : (
                  universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
                )}
              </select>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                {(companies ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => void requestPartnership()}
                disabled={saving || !universityId}
              >
                {t("إرسال الطلب", "Send Request")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" /> {t("إلغاء", "Cancel")}
              </Button>
            </div>
          </PanelCard>
        )}

        <PanelCard title={t("الشراكات النشطة", "Active Partnerships")}>
          {loading ? (
            <div className="grid lg:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="nq-skeleton h-36" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title={t("لا شراكات بعد", "No Partnerships Yet")}
              description={t(
                "اطلب شراكة مع جامعة لبناء قنوات توظيف مبكرة.",
                "Request a partnership with a university to build early recruitment channels."
              )}
              action={
                <Button size="sm" onClick={openForm}>
                  <Plus className="w-4 h-4" /> {t("طلب شراكة", "Request Partnership")}
                </Button>
              }
            />
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {items.map((partnership) => {
                const company = companies?.find((c) => c.id === partnership.companyId);

                return (
                  <div
                    key={partnership.id}
                    className="nq-lift p-4 rounded-lg border border-border bg-surface-hover/40"
                  >
                    <ActivityRow
                      avatar={
                        <div className="w-9 h-9 rounded-lg bg-brand-muted border border-border flex items-center justify-center">
                          <Handshake className="w-4 h-4 text-brand" />
                        </div>
                      }
                      title={uniName(partnership.universityId)}
                      subtitle={company?.name ?? partnership.companyId}
                      badge={
                        <span
                          className={
                            partnership.status === "active" ? "nq-chip nq-chip-emerald" : "nq-chip"
                          }
                        >
                          {partnership.status === "active" ? t("نشط", "Active") : t("معلق", "Pending")}
                        </span>
                      }
                    />
                    <p className="text-xs text-text-muted mt-3 mr-12">
                      {t(
                        `بدأت ${formatDate(partnership.startDate)}`,
                        `Started ${formatDate(partnership.startDate)}`
                      )}
                    </p>
                    <div className="flex gap-2 mt-3 mr-12">
                      <Link href={`/dashboard/company/partnerships/${partnership.id}`}>
                        <Button size="sm" variant="outline">
                          {t("التفاصيل", "Details")}
                        </Button>
                      </Link>
                    </div>
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
