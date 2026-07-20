"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { AmbientGlow, Reveal, SectionShell, SectionTag } from "./shared";

const NODES = [
  { id: "students", label: "طلاب", labelEn: "Students", x: 20, y: 30, color: "#2563eb" },
  { id: "companies", label: "شركات", labelEn: "Companies", x: 75, y: 25, color: "#7c3aed" },
  { id: "mentors", label: "مرشدون", labelEn: "Mentors", x: 50, y: 70, color: "#06b6d4" },
  { id: "startups", label: "شركات ناشئة", labelEn: "Startups", x: 80, y: 65, color: "#f59e0b" },
];

const EDGES = [
  ["students", "companies"],
  ["students", "mentors"],
  ["students", "startups"],
  ["mentors", "companies"],
  ["startups", "companies"],
  ["mentors", "startups"],
];

function getNode(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function OpportunityEcosystem() {
  const { t } = useI18n();
  return (
    <SectionShell id="ecosystem" className="bg-[#070b1a]">
      <AmbientGlow className="w-[500px] h-[500px] bg-purple-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <Reveal>
        <SectionTag>{t("النظام البيئي", "The Ecosystem")}</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          {t("شبكة حية تربط الجميع", "A living network that connects everyone")}
        </h2>
        <p className="text-white/45 text-sm md:text-base max-w-lg mb-12">
          {t("طلاب ↔ شركات ↔ مرشدون ↔ شركات ناشئة — كل الروابط تحدث في الوقت الفعلي.", "Students ↔ Companies ↔ Mentors ↔ Startups — all connections happen in real time.")}
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="relative aspect-[16/9] md:aspect-[2/1] max-h-[480px] rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {EDGES.map(([a, b], i) => {
              const na = getNode(a);
              const nb = getNode(b);
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="url(#lineGrad)"
                  strokeWidth="0.3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.15 }}
                />
              );
            })}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            {EDGES.map(([a, b], i) => {
              const na = getNode(a);
              const nb = getNode(b);
              return (
                <motion.circle
                  key={`pulse-${a}-${b}`}
                  r="0.8"
                  fill="#06b6d4"
                  initial={{ cx: na.x, cy: na.y }}
                  animate={{ cx: [na.x, nb.x], cy: [na.y, nb.y] }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.4,
                  }}
                />
              );
            })}

            {NODES.map((node, i) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              >
                <circle cx={node.x} cy={node.y} r="6" fill={`${node.color}33`} stroke={node.color} strokeWidth="0.4" />
                <circle cx={node.x} cy={node.y} r="3.5" fill={node.color} opacity="0.8" />
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="3.2"
                  fontFamily="var(--font-cairo)"
                >
                  {t(node.label, node.labelEn)}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
      </Reveal>
    </SectionShell>
  );
}
