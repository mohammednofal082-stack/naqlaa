"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check, Star, FileText, Loader2 } from "lucide-react";
import type { Application, ApplicationStatus, User, Job } from "@careerlink/shared";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";
import { updateApplicationStatus } from "@/hooks/data";

type AppWithDetails = Application & { student?: User; job?: Job };

export function CandidateReviewStack({
  candidates,
  onUpdated,
}: {
  candidates: AppWithDetails[];
  onUpdated?: () => void;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const current = candidates[index];

  const decide = async (action: "accepted" | "rejected") => {
    if (!current || saving) return;
    setSaving(true);
    setError("");
    try {
      await updateApplicationStatus(current.id, action as ApplicationStatus);
      setDecisions((d) => ({ ...d, [current.id]: action }));
      setIndex((i) => Math.min(i + 1, candidates.length));
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("فشل حفظ القرار", "Failed to save decision"));
    } finally {
      setSaving(false);
    }
  };

  if (!current || index >= candidates.length) {
    const acceptedCount = Object.values(decisions).filter((d) => d === "accepted").length;
    const rejectedCount = Object.values(decisions).filter((d) => d === "rejected").length;
    return (
      <div className="text-center py-20 rounded-2xl border border-dashed border-border">
        <p className="font-display text-lg font-bold text-text mb-2">{t("انتهت المراجعة السريعة", "Quick review complete")}</p>
        <p className="text-sm text-text-muted">
          {t(`قبلت ${acceptedCount} · رفضت ${rejectedCount}`, `Accepted ${acceptedCount} · Rejected ${rejectedCount}`)}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-center text-sm text-text-muted mb-4">
        {t(`مرشح ${index + 1} من ${candidates.length}`, `Candidate ${index + 1} of ${candidates.length}`)}
      </p>
      {error && <p className="text-center text-sm text-red-500 mb-3">{error}</p>}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, x: 100, rotate: 5 }}
          className="rounded-2xl border border-border bg-surface p-8 shadow-elevated stat-card-glow"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue to-purple flex items-center justify-center text-2xl font-bold text-white">
              {current.student?.firstName?.[0] ?? "?"}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-text">
                {current.student?.firstName} {current.student?.lastName}
              </h3>
              <p className="text-text-muted">{current.job?.title}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Star className="w-3 h-3" />
              {t(`${current.matchScore ?? 0}% تطابق`, `${current.matchScore ?? 0}% match`)}
            </span>
            <span className="text-xs text-text-muted">{applicationStatusLabel(current.status, t)}</span>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {current.coverLetter ||
              t(
                "ملف المرشح جاهز للمراجعة. استخدم القبول أو الرفض لحفظ القرار في قاعدة البيانات.",
                "Candidate profile is ready for review. Accept or reject to persist the decision in the database.",
              )}
          </p>

          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => decide("rejected")} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-5 h-5" />} {t("رفض", "Reject")}
            </Button>
            {current.student?.email ? (
              <a href={`mailto:${current.student.email}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4" /> {t("الملف", "Profile")}
                </Button>
              </a>
            ) : (
              <Link href="/dashboard/company/applications" className="flex-1">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4" /> {t("الملف", "Profile")}
                </Button>
              </Link>
            )}
            <Button className="flex-1" onClick={() => decide("accepted")} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />} {t("قبول", "Accept")}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
