"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/i18n";

export function Badge({ children }: { children?: ReactNode; variant?: string; className?: string }) {
  if (children == null || children === "") return null;
  return <span className="text-xs text-text-muted">{children}</span>;
}

export function MatchBadge({ percentage }: { percentage: number }) {
  const { t } = useI18n();
  return <span className="text-xs text-text-muted tabular-nums">{t(`تطابق ${percentage}%`, `${percentage}% match`)}</span>;
}
