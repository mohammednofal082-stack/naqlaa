"use client";

import { Briefcase, Compass, Lightbulb } from "lucide-react";
import { useI18n } from "@/i18n";
import { AmbientGlow, GlassPanel, Reveal, SectionShell, SectionTag } from "./shared";

export function HowItWorks() {
  const { t } = useI18n();
  const STEPS = [
    {
      icon: Lightbulb,
      title: t("ابنِ مهاراتك", "Build your skills"),
      desc: t("ملف ذكي يجمع مهاراتك، مشاريعك، وشهاداتك — يفهمها النظام ويقترح لك ما ينقصك.", "A smart profile that brings together your skills, projects, and certificates — the system understands them and suggests what you're missing."),
      gradient: "from-blue-600/20 to-blue-900/10",
      accent: "#2563eb",
    },
    {
      icon: Compass,
      title: t("اعثر على فرص", "Find opportunities"),
      desc: t("وظائف، تدريب، مشاريع، وشركات ناشئة — مرتّبة حسب تطابقك وليس عشوائياً.", "Jobs, internships, projects, and startups — ranked by your match, not at random."),
      gradient: "from-cyan-600/20 to-cyan-900/10",
      accent: "#06b6d4",
    },
    {
      icon: Briefcase,
      title: t("ابدأ مسيرتك المهنية", "Start your career"),
      desc: t("من التقديم للمقابلة — مسار واضح، إشعارات فورية، ودعم في كل خطوة.", "From application to interview — a clear path, instant notifications, and support at every step."),
      gradient: "from-purple-600/20 to-purple-900/10",
      accent: "#7c3aed",
    },
  ];

  return (
    <SectionShell id="how" className="bg-[#050816]">
      <AmbientGlow className="w-[600px] h-[300px] bg-blue-600/8 top-0 left-1/2 -translate-x-1/2" />
      <Reveal>
        <SectionTag>{t("كيف تعمل نقلة", "How Naqla works")}</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-12 max-w-lg">
          {t("ثلاث خطوات نحو مستقبلك", "Three steps toward your future")}
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.12}>
            <GlassPanel hover className={`p-7 h-full bg-gradient-to-br ${step.gradient}`}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-white/10"
                style={{ backgroundColor: `${step.accent}22` }}
              >
                <step.icon className="w-5 h-5" style={{ color: step.accent }} />
              </div>
              <span className="text-[10px] font-bold text-white/30 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-2 mb-3">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
