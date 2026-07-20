"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check, Star, FileText } from "lucide-react";
import type { Application, User, Job } from "@careerlink/shared";
import { statusColors } from "@careerlink/shared";
import { useI18n } from "@/i18n";
import { applicationStatusLabel } from "@/i18n/labels";

type AppWithDetails = Application & { student?: User; job?: Job };

export function CandidateReviewStack({
  candidates,
}: {
  candidates: AppWithDetails[];
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({});
  const current = candidates[index];

  const decide = (action: "accepted" | "rejected") => {
    if (!current) return;
    setDecisions((d) => ({ ...d, [current.id]: action }));
    setIndex((i) => Math.min(i + 1, candidates.length));
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
              {current.student?.firstName[0]}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-text">
                {current.student?.firstName} {current.student?.lastName}
              </h3>
              <p className="text-text-muted">{current.job?.title}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-text-muted">
              <Star className="w-3 h-3 ml-1" />
              {t(`${current.matchScore}% تطابق`, `${current.matchScore}% match`)}
            </span>
            <span className="text-xs text-text-muted">{applicationStatusLabel(current.status, t)}</span>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {t(
              "طالب علوم حاسوب — مشاريع React و Node.js — يبحث عن فرصة تدريب أو وظيفة junior. الملف يحتوي شهادات وكورسات مرتبطة بالفرصة.",
              "Computer science student — React and Node.js projects — looking for an internship or a junior position. The profile includes certificates and courses relevant to the opportunity."
            )}
          </p>

          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => decide("rejected")}>
              <X className="w-5 h-5" /> {t("رفض", "Reject")}
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="w-4 h-4" /> {t("الملف", "Profile")}
            </Button>
            <Button className="flex-1" onClick={() => decide("accepted")}>
              <Check className="w-5 h-5" /> {t("قبول", "Accept")}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
