"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useI18n } from "@/i18n";
import { AmbientGlow, Reveal, SectionShell, SectionTag } from "./shared";

function AnimatedCounter({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  const [count, setCount] = useState(0);
  const { locale } = useI18n();

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, value]);

  const formatted = count.toLocaleString(locale === "ar" ? "ar-PS" : "en-US");

  return (
    <span className="font-display text-3xl md:text-5xl font-bold text-white tabular-nums">
      +{formatted}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();
  const STATS = [
    { value: 50000, label: t("طالب", "Students"), color: "#2563eb" },
    { value: 10000, label: t("فرصة", "Opportunities"), color: "#06b6d4" },
    { value: 2000, label: t("شركة", "Companies"), color: "#7c3aed" },
    { value: 100000, label: t("عملية ربط", "Connections made"), color: "#f59e0b" },
  ];

  return (
    <SectionShell className="bg-[#050816]">
      <AmbientGlow className="w-[600px] h-[200px] bg-blue-600/10 top-0 left-1/2 -translate-x-1/2" />
      <Reveal>
        <SectionTag>{t("الأرقام", "The Numbers")}</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-14">
          {t("منصة تنمو معك", "A platform that grows with you")}
        </h2>
      </Reveal>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <AnimatedCounter value={s.value} active={inView} />
            <p className="text-sm text-white/40 mt-2" style={{ color: `${s.color}99` }}>
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
