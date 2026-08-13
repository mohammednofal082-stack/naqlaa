"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/sidebar";
import { DashboardSubPage } from "@/components/dashboard/role-page-shell";
import { PanelCard } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { formatDateTime } from "@/lib/utils";

type Attempt = {
  id: string;
  score: number;
  passed: boolean;
  created_at: string;
  profiles?: { full_name?: string; email?: string } | null;
};

export default function QuizResultsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const { t } = useI18n();
  const [rows, setRows] = useState<Attempt[]>([]);

  useEffect(() => {
    void fetch(`/api/data/quizzes?id=${encodeURIComponent(quizId)}&attempts=1`)
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.data)) setRows(json.data as Attempt[]);
      });
  }, [quizId]);

  return (
    <DashboardLayout>
      <DashboardSubPage
        title={t("نتائج الاختبار", "Quiz results")}
        actions={<Link href="/dashboard/trainer/quizzes"><Button size="sm" variant="outline">{t("العودة", "Back")}</Button></Link>}
      >
        <PanelCard title={t(`${rows.length} محاولة`, `${rows.length} attempts`)}>
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-text-muted">{t("لا محاولات بعد", "No attempts yet")}</p>}
            {rows.map((r) => (
              <div key={r.id} className="flex justify-between border border-border rounded-lg p-3 text-sm">
                <div>
                  <p className="font-medium">{r.profiles?.full_name || t("طالب", "Student")}</p>
                  <p className="text-text-muted">{r.profiles?.email}</p>
                </div>
                <div className="text-left">
                  <p>{r.score}% {r.passed ? t("ناجح", "Passed") : t("راسب", "Failed")}</p>
                  <p className="text-xs text-text-muted">{formatDateTime(r.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </DashboardSubPage>
    </DashboardLayout>
  );
}
