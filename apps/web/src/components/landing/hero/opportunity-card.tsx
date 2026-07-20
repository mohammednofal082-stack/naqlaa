"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OpportunityCardProps {
  title: string;
  icon: string;
  accent: "blue" | "teal" | "purple" | "cyan";
  visible: boolean;
  direction?: "left" | "right";
  variant?: "floating" | "inline";
}

const accentStyles = {
  blue: {
    border: "border-blue-400/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.35)]",
    icon: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-400",
    text: "text-blue-300",
  },
  teal: {
    border: "border-teal-400/30",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.35)]",
    icon: "bg-teal-500/20 text-teal-300",
    dot: "bg-teal-400",
    text: "text-teal-300",
  },
  purple: {
    border: "border-purple-400/30",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.35)]",
    icon: "bg-purple-500/20 text-purple-300",
    dot: "bg-purple-400",
    text: "text-purple-300",
  },
  cyan: {
    border: "border-cyan-400/30",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.35)]",
    icon: "bg-cyan-500/20 text-cyan-300",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
  },
};

function CardContent({
  title,
  icon,
  styles,
}: {
  title: string;
  icon: string;
  styles: (typeof accentStyles)[keyof typeof accentStyles];
}) {
  return (
    <>
      <span className={cn("flex items-center justify-center w-7 h-7 rounded-md text-sm shrink-0", styles.icon)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] md:text-xs font-semibold text-white/90 leading-tight truncate">{title}</p>
      </div>
    </>
  );
}

export function OpportunityCard({
  title,
  icon,
  accent,
  visible,
  direction = "right",
  variant = "floating",
}: OpportunityCardProps) {
  const styles = accentStyles[accent];
  const slideX = direction === "right" ? 40 : -40;

  if (variant === "inline") {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <div
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border backdrop-blur-xl",
            "bg-white/10",
            styles.border,
            styles.glow
          )}
        >
          <CardContent title={title} icon={icon} styles={styles} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute z-30 top-1/2 -translate-y-1/2 whitespace-nowrap max-sm:hidden"
      style={{ [direction === "right" ? "right" : "left"]: "calc(100% + 10px)" }}
      initial={{ opacity: 0, x: slideX, scale: 0.85 }}
      animate={
        visible
          ? { opacity: 1, x: 0, scale: 1 }
          : { opacity: 0, x: slideX * 0.5, scale: 0.9 }
      }
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg border backdrop-blur-xl",
          "bg-white/10",
          styles.border,
          styles.glow
        )}
      >
        <CardContent title={title} icon={icon} styles={styles} />
      </div>
    </motion.div>
  );
}
