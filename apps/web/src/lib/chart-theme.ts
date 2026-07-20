"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return {
    isDark,
    grid: isDark ? "rgba(255,255,255,0.06)" : "rgba(7,15,26,0.08)",
    tick: isDark ? "rgba(255,255,255,0.45)" : "#64748B",
    tooltip: {
      background: isDark ? "rgba(15,23,42,0.95)" : "#ffffff",
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2ded8",
      borderRadius: "12px",
      color: isDark ? "#fff" : "#070f1a",
    },
    primary: "#2563eb",
    emerald: "#10b981",
    purple: "#7c3aed",
    cyan: "#06b6d4",
  };
}
