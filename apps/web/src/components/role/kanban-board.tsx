"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export interface KanbanColumn<T> {
  id: string;
  label: string;
  color: string;
  items: T[];
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => React.ReactNode;
  onAction?: (item: T, columnId: string) => void;
  actionLabel?: string;
}

export function KanbanBoard<T extends { id: string }>({
  columns,
  renderCard,
  onAction,
  actionLabel,
}: KanbanBoardProps<T>) {
  const { t } = useI18n();
  const resolvedActionLabel = actionLabel ?? t("إجراء", "Action");
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {columns.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-80">
          <div className="flex items-center justify-between mb-3 px-1.5">
            <h3 className="font-display font-bold text-text text-sm">{col.label}</h3>
            <span className="text-[11px] font-semibold text-text-muted tabular-nums">
              {col.items.length}
            </span>
          </div>
          <div className="space-y-3 min-h-[420px] p-3 rounded-2xl bg-cream-dark/40 dark:bg-white/[0.02] border border-border">
            {col.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="nq-lift rounded-xl border border-border bg-surface p-4 shadow-soft"
              >
                {renderCard(item)}
                {onAction && (
                  <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => onAction(item, col.id)}>
                    {resolvedActionLabel}
                  </Button>
                )}
              </motion.div>
            ))}
            {col.items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-border rounded-xl bg-surface/40">
                <span className="w-8 h-8 rounded-full border border-dashed border-border-strong mb-2" />
                <p className="text-xs text-text-muted">{t("لا عناصر في هذه المرحلة", "No items at this stage")}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
