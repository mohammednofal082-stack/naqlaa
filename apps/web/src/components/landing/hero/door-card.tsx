"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OpportunityCard, type OpportunityCardProps } from "./opportunity-card";

export interface DoorCardProps {
  label: string;
  opportunity: Pick<OpportunityCardProps, "title" | "icon" | "accent">;
  accent: OpportunityCardProps["accent"];
  isOpen: boolean;
  isActive: boolean;
  index: number;
  cardDirection?: "left" | "right";
  className?: string;
  onHover?: () => void;
  onClick?: () => void;
}

const doorThemes = {
  blue: {
    frame: "from-blue-500/40 via-blue-600/20 to-blue-900/40",
    glow: "bg-blue-500",
    beam: "from-blue-400/50 via-blue-500/20 to-transparent",
    label: "text-blue-300",
    border: "border-blue-400/40 hover:border-blue-400/70",
    inner: "from-blue-950/80 to-blue-900/60",
  },
  teal: {
    frame: "from-teal-500/40 via-teal-600/20 to-teal-900/40",
    glow: "bg-teal-500",
    beam: "from-teal-400/50 via-teal-500/20 to-transparent",
    label: "text-teal-300",
    border: "border-teal-400/40 hover:border-teal-400/70",
    inner: "from-teal-950/80 to-teal-900/60",
  },
  purple: {
    frame: "from-purple-500/40 via-purple-600/20 to-purple-900/40",
    glow: "bg-purple-500",
    beam: "from-purple-400/50 via-purple-500/20 to-transparent",
    label: "text-purple-300",
    border: "border-purple-400/40 hover:border-purple-400/70",
    inner: "from-purple-950/80 to-purple-900/60",
  },
  cyan: {
    frame: "from-cyan-500/40 via-cyan-600/20 to-cyan-900/40",
    glow: "bg-cyan-500",
    beam: "from-cyan-400/50 via-cyan-500/20 to-transparent",
    label: "text-cyan-300",
    border: "border-cyan-400/40 hover:border-cyan-400/70",
    inner: "from-cyan-950/80 to-cyan-900/60",
  },
};

export function DoorCard({
  label,
  opportunity,
  accent,
  isOpen,
  isActive,
  index,
  cardDirection = "right",
  className,
  onHover,
  onClick,
}: DoorCardProps) {
  const theme = doorThemes[accent];

  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.4 + index * 0.15 }}
      onMouseEnter={onHover}
    >
      <motion.button
        type="button"
        className="relative block cursor-pointer bg-transparent border-0 p-0 text-right"
        onClick={onClick}
        whileHover={{ scale: 1.06, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        aria-label={`${label}: ${opportunity.title}`}
      >
        <p className={cn("text-[10px] md:text-xs font-bold mb-2 text-center tracking-wide", theme.label)}>
          {label}
        </p>

        <div
          className={cn(
            "relative w-[72px] h-[96px] md:w-[88px] md:h-[116px] rounded-lg overflow-visible",
            "[perspective:600px]"
          )}
        >
          <motion.div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-16 md:h-20 w-24 md:w-32 blur-md pointer-events-none",
              "bg-gradient-to-l",
              theme.beam,
              cardDirection === "right" ? "-left-20 md:-left-24" : "-right-20 md:-right-24"
            )}
            animate={{ opacity: isOpen ? 0.7 : 0, scaleX: isOpen ? 1 : 0.3 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className={cn("absolute inset-2 rounded-md blur-xl", theme.glow)}
            animate={{ opacity: isOpen ? 0.6 : isActive ? 0.25 : 0 }}
            transition={{ duration: 0.6 }}
          />

          <div
            className={cn(
              "absolute inset-0 rounded-lg border bg-gradient-to-b p-px",
              theme.frame,
              theme.border,
              isActive && "ring-1 ring-white/25 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
            )}
          >
            <div className={cn("w-full h-full rounded-[7px] bg-gradient-to-b relative overflow-hidden", theme.inner)}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-white/15 via-transparent to-transparent"
                animate={{ opacity: isOpen ? 1 : 0.25 }}
              />

              <div className="absolute inset-0 flex [transform-style:preserve-3d]">
                <motion.div
                  className="w-1/2 h-full origin-right bg-gradient-to-br from-white/12 to-white/4 border-l border-white/10"
                  animate={{ rotateY: isOpen ? -82 : 0 }}
                  transition={{ type: "spring", stiffness: 75, damping: 14 }}
                />
                <motion.div
                  className="w-1/2 h-full origin-left bg-gradient-to-bl from-white/12 to-white/4 border-r border-white/10"
                  animate={{ rotateY: isOpen ? 82 : 0 }}
                  transition={{ type: "spring", stiffness: 75, damping: 14 }}
                />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.span
                  className="text-lg md:text-xl font-bold text-white/20"
                  animate={{ opacity: isOpen ? 0 : 1 }}
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.span>
              </div>
            </div>
          </div>

          <OpportunityCard
            {...opportunity}
            accent={accent}
            visible={isOpen}
            direction={cardDirection}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}
