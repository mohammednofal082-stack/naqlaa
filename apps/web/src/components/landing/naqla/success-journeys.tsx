"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { Reveal, SectionShell, SectionTag } from "./shared";

export function SuccessJourneys() {
  const { t } = useI18n();
  const JOURNEY = [
    { stage: t("طالب", "Student"), desc: t("بداية الرحلة من الجامعة", "The start of the journey at university"), color: "#2563eb" },
    { stage: t("متدرب", "Intern"), desc: t("تدريب في شركة تقنية", "An internship at a tech company"), color: "#06b6d4" },
    { stage: t("مطور", "Developer"), desc: t("أول وظيفة بدوام كامل", "The first full-time job"), color: "#7c3aed" },
    { stage: t("قائد فريق", "Team Lead"), desc: t("قيادة مشروع وتوظيف", "Leading a project and hiring"), color: "#f59e0b" },
  ];

  return (
    <SectionShell id="journeys" className="bg-[#070b1a]">
      <Reveal>
        <SectionTag>{t("قصص نجاح", "Success Stories")}</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-10">
          {t("من طالب إلى قائد فريق", "From student to team lead")}
        </h2>
      </Reveal>

      <div className="relative overflow-x-auto scrollbar-hide pb-4">
        <div className="flex gap-0 min-w-[700px] md:min-w-0">
          {JOURNEY.map((step, i) => (
            <Reveal key={step.stage} delay={i * 0.1} className="flex-1 min-w-[160px]">
              <div className="relative flex flex-col items-center text-center px-4">
                {i < JOURNEY.length - 1 && (
                  <div className="absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px hidden md:block">
                    <motion.div
                      className="h-full bg-gradient-to-l from-purple-500/50 to-blue-500/50"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
                      style={{ originX: 1 }}
                    />
                  </div>
                )}
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 mb-4 relative z-10"
                  style={{
                    borderColor: step.color,
                    backgroundColor: `${step.color}15`,
                    boxShadow: `0 0 30px ${step.color}33`,
                  }}
                  whileInView={{ scale: [0.8, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                >
                  <span className="font-display font-bold text-sm" style={{ color: step.color }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </motion.div>
                <h3 className="font-display font-bold text-white mb-1">{step.stage}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
