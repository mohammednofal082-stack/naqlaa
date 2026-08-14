import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  meta,
  className,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b border-border",
        className
      )}
    >
      <div className="min-w-0">
        {meta && <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-1">{meta}</p>}
        <h1 className="font-display text-xl sm:text-2xl font-semibold text-text tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-text-secondary mt-1 text-[13px] sm:text-sm max-w-2xl leading-snug line-clamp-2 sm:line-clamp-none">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="text-center py-14 px-6 border border-dashed border-border rounded-xl bg-surface/40">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-brand-muted flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-brand" />
        </div>
      )}
      <p className="font-display text-base font-bold text-text mb-1.5">{title}</p>
      {description && (
        <p className="text-text-muted text-sm max-w-md mx-auto mb-5 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2 ${
        active
          ? "border-brand text-brand font-semibold"
          : "border-transparent text-text-secondary hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-1 border-b border-border mb-6 pb-1 ${className ?? ""}`}>
      {children}
    </div>
  );
}
