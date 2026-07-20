"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { RoleExperience } from "./role-experience";

export function RoleIdentityBanner({ role }: { role: RoleExperience }) {
  return (
    <div className={cn("nq-hero mb-6 bg-gradient-to-l", role.gradient)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">
            {role.icon} {role.label} · {role.mantra}
          </p>
          <h2 className="font-display text-lg md:text-xl font-bold text-text mt-1">{role.tagline}</h2>
          {role.primaryFocus.length > 0 && (
            <p className="text-sm text-text-secondary mt-1.5">
              {role.primaryFocus.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoleScenarios({ role, compact }: { role: RoleExperience; compact?: boolean }) {
  return (
    <div className={cn("grid gap-3 mb-6", compact ? "grid-cols-1 sm:grid-cols-3" : "sm:grid-cols-3")}>
      {role.scenarios.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link href={s.href} className="nq-scenario-card group h-full block">
            <p className="font-semibold text-sm text-text mb-1">{s.title}</p>
            <p className={cn("text-text-muted leading-relaxed mb-3", compact ? "text-xs line-clamp-2" : "text-xs")}>
              {s.description}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
              {s.cta}
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function RoleJourneyTimeline({
  steps,
}: {
  steps: { label: string; status: "done" | "current" | "upcoming"; detail?: string }[];
}) {
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 bottom-4 w-px bg-border" />
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative flex gap-4 pr-9"
          >
            <div
              className={cn(
                "absolute right-2.5 w-3 h-3 rounded-full ring-4 ring-background",
                step.status === "done" && "bg-emerald",
                step.status === "current" && "bg-brand",
                step.status === "upcoming" && "bg-border"
              )}
            />
            <div className="flex-1 py-3 px-4 rounded-lg border border-border bg-surface-hover/50">
              <p className={cn("font-medium text-sm", step.status === "current" ? "text-brand" : "text-text")}>
                {step.label}
              </p>
              {step.detail && <p className="text-xs text-text-muted mt-0.5">{step.detail}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
