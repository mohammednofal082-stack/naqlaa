"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: "w-8 h-8", text: "text-lg" },
  md: { icon: "w-10 h-10", text: "text-xl" },
  lg: { icon: "w-14 h-14", text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  const { t } = useI18n();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          s.icon,
          "rounded-xl bg-brand flex items-center justify-center shadow-glow relative overflow-hidden nq-logo-glow group"
        )}
      >
        <svg viewBox="0 0 40 40" className="w-3/5 h-3/5" fill="none">
          <circle cx="8" cy="28" r="4" fill="white" opacity="0.95" />
          <circle cx="32" cy="12" r="4" fill="white" opacity="0.95" />
          <path d="M8 28 Q20 8 32 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M26 12 L32 12 L32 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      {showText && (
        <div>
          <span className={cn(s.text, "font-bold text-text leading-none")}>{t("نقلة", "Naqla")}</span>
          <p className="text-[10px] text-text-muted leading-tight mt-0.5 hidden sm:block">
            {t("من الجامعة إلى سوق العمل", "From University to Employment")}
          </p>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("w-10 h-10 rounded-xl bg-brand flex items-center justify-center", className)}>
      <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none">
        <circle cx="8" cy="28" r="4" fill="white" />
        <circle cx="32" cy="12" r="4" fill="white" />
        <path d="M8 28 Q20 8 32 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 12 L32 12 L32 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
