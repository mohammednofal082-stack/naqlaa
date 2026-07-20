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
        "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border",
        className
      )}
    >
      <div className="min-w-0">
        {meta && <p className="text-xs font-medium text-text-muted mb-1.5">{meta}</p>}
        <h1 className="font-display text-2xl md:text-[1.75rem] font-bold text-text tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-text-secondary mt-2 text-sm md:text-[15px] max-w-2xl leading-relaxed">{subtitle}</p>
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
