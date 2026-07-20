"use client";

import { useI18n } from "@/i18n";
import { GlassPanel } from "./shared";

export function Testimonials() {
  const { t } = useI18n();
  const TESTIMONIALS = [
    {
      name: t("أحمد خ.", "Ahmad Kh."),
      role: t("مطور Frontend · Jawwal", "Frontend Developer · Jawwal"),
      text: t("نقلة غيّرت طريقة بحثي عن وظيفة. خلال أسبوعين حصلت على تدريب ثم عرض وظيفة.", "Naqla changed the way I searched for a job. Within two weeks I got an internship, then a job offer."),
    },
    {
      name: t("ليلى م.", "Layla M."),
      role: t("خريجة هندسة · Exalt", "Engineering Graduate · Exalt"),
      text: t("الملف الذكي والمطابقة وفّرت عليّ شهور من التقديم العشوائي.", "The smart profile and matching saved me months of random applications."),
    },
    {
      name: t("سارة ن.", "Sara N."),
      role: t("مديرة توظيف · PalPay", "Hiring Manager · PalPay"),
      text: t("كشركة، وجدنا مرشحين مؤهلين بسرعة. المنصة ليست مجرد لوحة وظائف.", "As a company, we found qualified candidates quickly. The platform is more than just a job board."),
    },
    {
      name: t("محمد ع.", "Mohammad A."),
      role: t("طالب علوم حاسوب", "Computer Science Student"),
      text: t("بدأت كطالب بدون خبرة. اليوم أعمل على مشروع حقيقي مع شركة ناشئة.", "I started as a student with no experience. Today I work on a real project with a startup."),
    },
    {
      name: t("رنا د.", "Rana D."),
      role: t("مرشدة مهنية", "Career Mentor"),
      text: t("أربط الطلاب بالفرص المناسبة وأتابع تقدمهم — كل شيء في مكان واحد.", "I connect students with the right opportunities and track their progress — everything in one place."),
    },
  ];
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative py-24 bg-[#070b1a] overflow-hidden">
      <div className="shell-wide mb-10">
        <p className="text-sm font-medium text-cyan-400/90 mb-3">
          {t("ماذا يقولون", "What they say")}
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
          {t("قصص حقيقية من مجتمع نقلة", "Real stories from the Naqla community")}
        </h2>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070b1a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070b1a] to-transparent z-10 pointer-events-none" />
        <div className="flex gap-5 animate-marquee-rtl w-max">
          {items.map((item, i) => (
            <GlassPanel key={`${item.name}-${i}`} className="p-6 w-[320px] shrink-0">
              <p className="text-sm text-white/60 leading-relaxed mb-5">&ldquo;{item.text}&rdquo;</p>
              <div>
                <p className="font-display font-bold text-white text-sm">{item.name}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{item.role}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
