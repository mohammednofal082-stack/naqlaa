"use client";

import {
  Briefcase, Building2, Cpu, GraduationCap, Rocket,
  Lightbulb, UserCircle, Users,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { AmbientGlow, GlassPanel, Reveal, SectionShell, SectionTag } from "./shared";

export function FeaturesGrid() {
  const { t } = useI18n();
  const FEATURES = [
    { icon: Briefcase, title: t("وظائف", "Jobs"), desc: t("فرص في كل القطاعات", "Opportunities across all sectors"), color: "#2563eb" },
    { icon: GraduationCap, title: t("تدريب", "Internships"), desc: t("تدريب عملي مدفوع", "Paid hands-on training"), color: "#06b6d4" },
    { icon: Rocket, title: t("مشاريع", "Projects"), desc: t("مشاريع تخرج ومشاريع حقيقية", "Graduation and real-world projects"), color: "#7c3aed" },
    { icon: Building2, title: t("شركات ناشئة", "Startups"), desc: t("انضم لفريق مبكر", "Join an early-stage team"), color: "#f59e0b" },
    { icon: UserCircle, title: t("ملفات شخصية", "Profiles"), desc: t("ملف مهني ذكي", "A smart professional profile"), color: "#2563eb" },
    { icon: Lightbulb, title: t("توصيات ذكية", "Smart Recommendations"), desc: t("اقتراحات مخصصة لك", "Personalized suggestions for you"), color: "#06b6d4" },
    { icon: Cpu, title: t("نظام مطابقة", "Matching System"), desc: t("تطابق دقيق بالمهارات", "Precise skills-based matching"), color: "#7c3aed" },
    { icon: Users, title: t("مجتمع مهني", "Professional Community"), desc: t("تواصل وبناء شبكة", "Connect and build a network"), color: "#2563eb" },
  ];

  return (
    <SectionShell id="features" className="bg-[#050816]">
      <AmbientGlow className="w-[400px] h-[400px] bg-cyan-500/8 bottom-0 right-0" />
      <Reveal>
        <SectionTag>{t("الميزات", "Features")}</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-12">
          {t("كل ما تحتاجه في مكان واحد", "Everything you need in one place")}
        </h2>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.05}>
            <GlassPanel
              hover
              className="p-5 h-full group cursor-default"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 border border-white/10 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${f.color}18` }}
              >
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-bold text-white text-sm mb-1">{f.title}</h3>
              <p className="text-[11px] text-white/40 leading-relaxed">{f.desc}</p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
