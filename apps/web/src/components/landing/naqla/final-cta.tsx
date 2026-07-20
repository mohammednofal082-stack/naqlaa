"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";
import { AmbientGlow, MagneticButton } from "./shared";

export function FinalCTA() {
  const { t, isRTL } = useI18n();
  return (
    <section className="relative py-32 md:py-40 overflow-hidden bg-[#050816]">
      <AmbientGlow className="w-[700px] h-[400px] bg-blue-600/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <AmbientGlow className="w-[400px] h-[400px] bg-purple-600/12 top-0 right-0" />

      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.3) 0%, transparent 60%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="shell-wide relative z-10 text-center">
        <motion.h2
          className="font-display text-[clamp(2rem,6vw,4.5rem)] font-bold text-white leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {t("كل فرصة", "Every opportunity")}
          <br />
          <span className="bg-gradient-to-l from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {t("تبدأ بنقلة", "begins with Naqla")}
          </span>
        </motion.h2>
        <motion.p
          className="text-white/45 text-base max-w-md mx-auto mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t("انضم لآلاف الطلاب والخريجين والشركات الذين يبنون مستقبلهم المهني على نقلة.", "Join thousands of students, graduates, and companies building their careers on Naqla.")}
        </motion.p>
        <MagneticButton
          href="/auth/register"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-l from-blue-600 via-cyan-600 to-purple-600 shadow-[0_0_60px_rgba(37,99,235,0.5)]"
        >
          {t("أنشئ حسابك الآن", "Create your account now")}
          {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </MagneticButton>
      </div>
    </section>
  );
}
