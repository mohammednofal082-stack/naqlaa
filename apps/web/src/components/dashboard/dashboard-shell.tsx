"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export function DashboardHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "nq-gradient-panel p-5 md:p-6 mb-6",
        className
      )}
    >
      {eyebrow && <p className="text-xs font-medium text-brand mb-1.5">{eyebrow}</p>}
      <h2 className="font-display text-lg md:text-xl font-bold text-text">{title}</h2>
      {subtitle && <p className="text-text-secondary text-sm mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
      {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </motion.div>
  );
}

export function QuickAction({
  href,
  label,
  icon: Icon,
  description,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="nq-lift group flex items-center gap-3 p-3.5 rounded-lg border border-border bg-surface"
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-muted border border-brand/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-text">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>}
      </div>
      <ArrowLeft className="w-4 h-4 text-text-muted group-hover:text-text transition-colors" />
    </Link>
  );
}

export function PipelineBar({
  label,
  count,
  pct,
}: {
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-muted font-medium tabular-nums">{count}</span>
      </div>
      <div className="h-1.5 bg-cream-dark dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-brand"
        />
      </div>
    </div>
  );
}

export function ActivityRow({
  avatar,
  title,
  subtitle,
  meta,
  badge,
}: {
  avatar: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="nq-lift flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface-hover/40">
      <div className="flex items-center gap-3 min-w-0">
        {avatar}
        <div className="min-w-0">
          <p className="font-medium text-sm text-text truncate">{title}</p>
          {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {meta && <span className="text-[11px] text-text-muted tabular-nums">{meta}</span>}
        {badge}
      </div>
    </div>
  );
}

export function PanelCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {action}
      </div>
      {children}
    </Card>
  );
}
