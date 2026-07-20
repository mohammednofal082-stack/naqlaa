"use client";

import { cn } from "@/lib/utils";

export function AmbientBackground({
  variant = "app",
  className,
}: {
  variant?: "app" | "auth" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("nq-ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)} aria-hidden>
      <div className={cn("nq-orb nq-orb-a", variant === "dark" && "opacity-80")} />
      <div className={cn("nq-orb nq-orb-b", variant === "dark" && "opacity-60")} />
      <div className={cn("nq-orb nq-orb-c", variant === "auth" && "opacity-40")} />
      <div className="nq-grain" />
      {variant === "auth" && <div className="nq-bridge-lines" />}
    </div>
  );
}
